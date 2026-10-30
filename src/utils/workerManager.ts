/**
 * Web Worker pool manager for simulating CPU, Memory, and IndexedDB saturation.
 * Each worker runs the requested 4-step short loop:
 *  1. Tests to hit the CPU target (duty cycle spin-wait)
 *  2. Manages its in-memory footprint (allocating/freeing random byte arrays)
 *  3. Manages its IndexedDB footprint (storing/clearing uncompressible random blobs)
 *  4. Sleeps
 */

const WORKER_CODE = `
let workerId = 0;
let targetCpu = 0; // 0 to 99
let targetMemBytes = 0; // in bytes
let targetStorageBytes = 0; // in bytes

let allocatedMemoryChunks = [];
let currentMemoryBytes = 0;
let db = null;
let currentStoredBytes = 0;
let isLoopRunning = false;
let isBusyStep = false;

// Open IndexedDB
function initDB() {
  return new Promise((resolve) => {
    const request = indexedDB.open('ReallyBadWebsiteDB_' + workerId, 1);
    request.onupgradeneeded = (e) => {
      const database = e.target.result;
      if (!database.objectStoreNames.contains('blobs')) {
        database.createObjectStore('blobs', { autoIncrement: true });
      }
    };
    request.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };
    request.onerror = () => {
      resolve(null);
    };
  });
}

// 1. CPU Target Execution
function executeCpuBurn(workMs) {
  if (workMs <= 0) return;
  const start = performance.now();
  let x = 0;
  while (performance.now() - start < workMs) {
    x += Math.sqrt(Math.random() * 100000);
  }
}

// 2. In-Memory Footprint Management
function manageMemoryFootprint() {
  const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB chunks
  // If we need more memory
  while (currentMemoryBytes < targetMemBytes) {
    const needed = Math.min(CHUNK_SIZE, targetMemBytes - currentMemoryBytes);
    try {
      const arr = new Uint8Array(needed);
      // Fill with semi-random data so VM cannot trivially de-duplicate
      for (let i = 0; i < arr.length; i += 1024) {
        arr[i] = (i + Math.random() * 255) & 0xff;
      }
      allocatedMemoryChunks.push(arr);
      currentMemoryBytes += needed;
    } catch (e) {
      // Memory limit reached
      break;
    }
  }

  // If target decreased, release chunks
  while (currentMemoryBytes > targetMemBytes && allocatedMemoryChunks.length > 0) {
    const removed = allocatedMemoryChunks.pop();
    currentMemoryBytes -= removed ? removed.byteLength : 0;
  }
  if (targetMemBytes === 0) {
    allocatedMemoryChunks = [];
    currentMemoryBytes = 0;
  }
}

// 3. IndexedDB Footprint Management
async function manageStorageFootprint() {
  if (!db) return;
  const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB chunks

  if (currentStoredBytes < targetStorageBytes) {
    const delta = Math.min(CHUNK_SIZE, targetStorageBytes - currentStoredBytes);
    const buffer = new Uint8Array(delta);
    // Fill with non-compressible pseudo-random bytes
    for (let i = 0; i < delta; i += 256) {
      buffer[i] = Math.floor(Math.random() * 256);
    }

    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction('blobs', 'readwrite');
        const store = tx.objectStore('blobs');
        const req = store.add(buffer);
        req.onsuccess = () => {
          currentStoredBytes += delta;
          resolve();
        };
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      // Storage quota or error
    }
  } else if (currentStoredBytes > targetStorageBytes) {
    try {
      await new Promise((resolve) => {
        const tx = db.transaction('blobs', 'readwrite');
        const store = tx.objectStore('blobs');
        const req = store.openCursor();
        req.onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) {
            cursor.delete();
            currentStoredBytes = Math.max(0, currentStoredBytes - CHUNK_SIZE);
            resolve();
          } else {
            currentStoredBytes = 0;
            resolve();
          }
        };
        req.onerror = () => resolve();
      });
    } catch (e) {}
  }
}

async function cleanAllStorage() {
  if (!db) return;
  try {
    const tx = db.transaction('blobs', 'readwrite');
    tx.objectStore('blobs').clear();
    currentStoredBytes = 0;
  } catch (e) {}
}

// The Requested 4-Step Short Loop:
// 1. Tests to hit CPU target
// 2. Manages in-memory footprint
// 3. Manages IndexedDB footprint
// 4. Sleeps
async function loopStep() {
  if (!isLoopRunning) return;

  const cycleMs = 100;
  const clampedCpu = Math.max(0, Math.min(99, targetCpu));
  const workMs = (clampedCpu / 100) * cycleMs;
  const sleepMs = Math.max(1, cycleMs - workMs);

  // 1. CPU test
  executeCpuBurn(workMs);

  // 2. In-memory footprint
  manageMemoryFootprint();

  // 3. IndexedDB footprint
  try {
    await manageStorageFootprint();
  } catch (e) {}

  // Post periodic metrics
  postMessage({
    type: 'METRICS',
    workerId,
    memoryBytes: currentMemoryBytes,
    storageBytes: currentStoredBytes,
    targetCpu,
  });

  // 4. Sleep
  setTimeout(loopStep, sleepMs);
}

self.onmessage = async (e) => {
  const data = e.data;
  if (data.type === 'INIT') {
    workerId = data.workerId;
    await initDB();
    isLoopRunning = true;
    loopStep();
  } else if (data.type === 'UPDATE_TARGETS') {
    targetCpu = data.cpu;
    targetMemBytes = data.memoryBytes;
    targetStorageBytes = data.storageBytes;
  } else if (data.type === 'RESET') {
    targetCpu = 0;
    targetMemBytes = 0;
    targetStorageBytes = 0;
    allocatedMemoryChunks = [];
    currentMemoryBytes = 0;
    await cleanAllStorage();
    postMessage({
      type: 'METRICS',
      workerId,
      memoryBytes: 0,
      storageBytes: 0,
      targetCpu: 0,
    });
  }
};
`;

export interface WorkerMetrics {
  totalMemoryBytes: number;
  totalStorageBytes: number;
  activeWorkers: number;
  concurrencyLimit: number;
}

export class SaturationWorkerPool {
  private workers: Worker[] = [];
  private workerBlobUrl: string | null = null;
  private concurrency: number;
  private workerStats: Map<number, { memoryBytes: number; storageBytes: number }> = new Map();
  private onMetricsCallback?: (metrics: WorkerMetrics) => void;

  constructor(onMetrics?: (metrics: WorkerMetrics) => void) {
    const systemConcurrency = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 4) : 4;
    this.concurrency = Math.min(4, Math.max(1, systemConcurrency));
    this.onMetricsCallback = onMetrics;
    this.initWorkers();

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.emergencyReset());
    }
  }

  private initWorkers() {
    if (typeof window === 'undefined') return;
    try {
      const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
      this.workerBlobUrl = URL.createObjectURL(blob);

      for (let i = 0; i < this.concurrency; i++) {
        const worker = new Worker(this.workerBlobUrl);
        const id = i;
        this.workerStats.set(id, { memoryBytes: 0, storageBytes: 0 });

        worker.onmessage = (e) => {
          if (e.data.type === 'METRICS') {
            this.workerStats.set(e.data.workerId, {
              memoryBytes: e.data.memoryBytes || 0,
              storageBytes: e.data.storageBytes || 0,
            });
            this.emitMetrics();
          }
        };

        worker.postMessage({ type: 'INIT', workerId: id });
        this.workers.push(worker);
      }
    } catch (err) {
      console.warn('Worker initialization fallback', err);
    }
  }

  public setTargets(cpuPercent: number, totalMemoryMB: number, totalStorageMB: number) {
    const workerCount = Math.max(1, this.workers.length);
    const clampedCpu = Math.max(0, Math.min(99, cpuPercent));
    const memBytesPerWorker = Math.floor((totalMemoryMB * 1024 * 1024) / workerCount);
    const storageBytesPerWorker = Math.floor((totalStorageMB * 1024 * 1024) / workerCount);

    this.workers.forEach((worker) => {
      worker.postMessage({
        type: 'UPDATE_TARGETS',
        cpu: clampedCpu,
        memoryBytes: memBytesPerWorker,
        storageBytes: storageBytesPerWorker,
      });
    });
  }

  public emergencyReset() {
    this.workers.forEach((worker) => {
      worker.postMessage({ type: 'RESET' });
    });
    this.workerStats.forEach((val) => {
      val.memoryBytes = 0;
      val.storageBytes = 0;
    });
    this.emitMetrics();
  }

  private emitMetrics() {
    if (!this.onMetricsCallback) return;
    let totalMem = 0;
    let totalStorage = 0;
    this.workerStats.forEach((v) => {
      totalMem += v.memoryBytes;
      totalStorage += v.storageBytes;
    });
    this.onMetricsCallback({
      totalMemoryBytes: totalMem,
      totalStorageBytes: totalStorage,
      activeWorkers: this.workers.length,
      concurrencyLimit: this.concurrency,
    });
  }

  public terminate() {
    this.emergencyReset();
    this.workers.forEach((w) => w.terminate());
    this.workers = [];
    if (this.workerBlobUrl) {
      URL.revokeObjectURL(this.workerBlobUrl);
      this.workerBlobUrl = null;
    }
  }
}
