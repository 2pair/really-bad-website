/**
 * Web Worker pool manager for simulating CPU, Memory, and IndexedDB saturation.
 * Each worker runs the requested 4-step short loop:
 *  1. Tests to hit the CPU target (duty cycle spin-wait)
 *  2. Manages its in-memory footprint (allocating/freeing random byte arrays)
 *  3. Manages its IndexedDB footprint (storing/clearing uncompressible random blobs)
 *  4. Sleeps
 * 
 * Fleet & Marshal Architecture:
 * - Each worker is capped at 1024MB.
 * - Sequential allocation: Worker 0 is filled to 1024MB first, then Worker 1, etc.
 * - A Marshal monitors the fleet. When an OOM occurs (worker.onerror or memory allocation catch),
 *   the marshal records the high watermark as the nearest full worker and treats that as the new maximum value.
 */

const WORKER_CODE = `
let workerId = 0;
let targetCpu = 0; // 0 to 99
let targetMemBytes = 0; // in bytes (max 1024MB per worker)
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

// 2. In-Memory Footprint Management (capped at targetMemBytes <= 1024MB)
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
      // Memory limit / OOM hit inside worker
      postMessage({
        type: 'OOM',
        workerId,
        currentMemoryBytes,
        error: String(e),
      });
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
  private workerStats: Map<number, { memoryBytes: number; storageBytes: number; isDead?: boolean }> = new Map();
  private onMetricsCallback?: (metrics: WorkerMetrics) => void;
  private onHighWatermarkChange?: (newMaxMB: number) => void;
  private maxMemoryMB: number;
  private lastCpuPercent: number = 0;
  private lastTargetMemoryMB: number = 0;
  private lastTargetStorageMB: number = 0;

  constructor(
    initialMaxMemoryMB: number = 4096,
    onMetrics?: (metrics: WorkerMetrics) => void,
    onHighWatermarkChange?: (newMaxMB: number) => void
  ) {
    this.maxMemoryMB = Math.max(1024, initialMaxMemoryMB);
    this.onMetricsCallback = onMetrics;
    this.onHighWatermarkChange = onHighWatermarkChange;

    // Number of 1024MB workers needed to cover system memory, at least 4
    const neededFleetSize = Math.max(4, Math.ceil(this.maxMemoryMB / 1024));
    this.concurrency = neededFleetSize;

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
        const id = i;
        this.workerStats.set(id, { memoryBytes: 0, storageBytes: 0, isDead: false });
        this.spawnWorker(id);
      }
    } catch (err) {
      console.warn('Worker initialization fallback', err);
    }
  }

  private spawnWorker(id: number) {
    if (!this.workerBlobUrl) return;
    try {
      const worker = new Worker(this.workerBlobUrl);

      worker.onmessage = (e) => {
        if (e.data.type === 'METRICS') {
          const stats = this.workerStats.get(e.data.workerId);
          if (stats && !stats.isDead) {
            stats.memoryBytes = e.data.memoryBytes || 0;
            stats.storageBytes = e.data.storageBytes || 0;
            this.emitMetrics();
          }
        } else if (e.data.type === 'OOM') {
          // Worker hit out-of-memory exception
          this.handleWorkerOOM(e.data.workerId);
        }
      };

      // Marshal monitoring: catches worker death / system OOM kill
      worker.onerror = (e) => {
        console.warn(`[Marshal] Worker ${id} died from OOM or uncaught error`, e);
        this.handleWorkerOOM(id);
      };

      worker.postMessage({ type: 'INIT', workerId: id });
      this.workers[id] = worker;
    } catch (err) {
      console.warn(`Failed to spawn worker ${id}`, err);
    }
  }

  /**
   * Marshal OOM handler:
   * When worker `workerIndex` dies from an OOM error, record the high watermark
   * as the nearest full worker (each worker holds up to 1024MB).
   * E.g. If worker 2 dies while allocating, workers 0 and 1 were fully filled = 2048MB.
   */
  private handleWorkerOOM(workerIndex: number) {
    const stats = this.workerStats.get(workerIndex);
    if (stats) stats.isDead = true;

    // Calculate nearest full worker watermark
    const nearestFullWorkerMB = Math.max(0, workerIndex * 1024);
    console.warn(`[Marshal] OOM triggered at worker ${workerIndex}. High watermark clamped to ${nearestFullWorkerMB} MB`);

    this.maxMemoryMB = nearestFullWorkerMB;

    if (this.onHighWatermarkChange) {
      this.onHighWatermarkChange(this.maxMemoryMB);
    }

    // Reapply targets clamped to new high watermark
    this.setTargets(this.lastCpuPercent, Math.min(this.lastTargetMemoryMB, this.maxMemoryMB), this.lastTargetStorageMB);
  }

  /**
   * Sequential worker filling:
   * Worker 0 is filled up to 1024MB, then Worker 1, etc.
   */
  public setTargets(cpuPercent: number, totalMemoryMB: number, totalStorageMB: number) {
    this.lastCpuPercent = cpuPercent;
    this.lastTargetMemoryMB = totalMemoryMB;
    this.lastTargetStorageMB = totalStorageMB;

    const clampedMemoryMB = Math.min(totalMemoryMB, this.maxMemoryMB);
    let remainingMemMB = clampedMemoryMB;
    const clampedCpu = Math.max(0, Math.min(99, cpuPercent));
    const storageBytesPerWorker = Math.floor((totalStorageMB * 1024 * 1024) / Math.max(1, this.workers.length));

    this.workers.forEach((worker, index) => {
      if (!worker) return;
      const stats = this.workerStats.get(index);
      if (stats?.isDead) return;

      const allocMB = Math.min(1024, Math.max(0, remainingMemMB));
      remainingMemMB -= allocMB;
      const memBytes = allocMB * 1024 * 1024;

      try {
        worker.postMessage({
          type: 'UPDATE_TARGETS',
          cpu: clampedCpu,
          memoryBytes: memBytes,
          storageBytes: storageBytesPerWorker,
        });
      } catch (err) {
        console.warn(`Failed to postMessage to worker ${index}`, err);
      }
    });
  }

  public emergencyReset() {
    this.workers.forEach((worker) => {
      try {
        worker?.postMessage({ type: 'RESET' });
      } catch (e) {}
    });
    this.workerStats.forEach((val) => {
      val.memoryBytes = 0;
      val.storageBytes = 0;
      val.isDead = false;
    });
    this.emitMetrics();
  }

  private emitMetrics() {
    if (!this.onMetricsCallback) return;
    let totalMem = 0;
    let totalStorage = 0;
    let active = 0;
    this.workerStats.forEach((v) => {
      if (!v.isDead) {
        totalMem += v.memoryBytes;
        totalStorage += v.storageBytes;
        active++;
      }
    });
    this.onMetricsCallback({
      totalMemoryBytes: totalMem,
      totalStorageBytes: totalStorage,
      activeWorkers: active,
      concurrencyLimit: this.concurrency,
    });
  }

  public getMaxMemoryMB(): number {
    return this.maxMemoryMB;
  }

  public terminate() {
    this.emergencyReset();
    this.workers.forEach((w) => {
      try {
        w?.terminate();
      } catch (e) {}
    });
    this.workers = [];
    if (this.workerBlobUrl) {
      URL.revokeObjectURL(this.workerBlobUrl);
      this.workerBlobUrl = null;
    }
  }
}
