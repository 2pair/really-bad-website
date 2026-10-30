/**
 * Pure calculation logic for resource saturation, throttling, and visual transformations.
 */

export interface DutyCycle {
  workMs: number;
  sleepMs: number;
}

/**
 * Calculates work vs sleep milliseconds for a CPU target percentage (capped at 99%).
 * Cycle length is typically 100ms.
 */
export function calculateDutyCycle(cpuPercent: number, cycleMs: number = 100): DutyCycle {
  const clamped = Math.max(0, Math.min(99, cpuPercent));
  const workMs = Math.round((clamped / 100) * cycleMs);
  const sleepMs = Math.max(1, cycleMs - workMs); // Always keep at least 1ms sleep to prevent lockup
  return { workMs, sleepMs };
}

/**
 * Divides a total resource budget (MB or bytes) across N concurrent workers.
 */
export function partitionTarget(totalAmount: number, workerCount: number): number {
  if (workerCount <= 0) return 0;
  return Math.max(0, Math.floor(totalAmount / workerCount));
}

/**
 * Computes count of small 1mm squares around the screen based on storage usage (0 to 4096 MB).
 * Starts appearing at 64 MB, scaling to dense clusters of micro-squares as storage saturates.
 */
export function calculateStorageArtifactCount(storageMB: number, maxMB: number = 4096): number {
  const clamped = Math.max(0, Math.min(maxMB, storageMB));
  if (clamped < 64) return 0;
  return Math.round((clamped / maxMB) * 500);
}

/**
 * Calculates synthetic UI lag delay in milliseconds for Memory usage (0 to 4096 MB).
 * Translates into intentional main-thread execution stalls and dropped frames.
 */
export function calculateLagDelayMs(memoryMB: number, maxMB: number = 4096): number {
  const clamped = Math.max(0, Math.min(maxMB, memoryMB));
  if (clamped < 256) return 0;
  // Scales from 10ms up to 90ms stall
  return Math.round((clamped / maxMB) * 85);
}

/**
 * Human-readable byte formatting.
 */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${val} ${sizes[i]}`;
}

export interface PointCoordinate {
  top: number;
  left: number;
}

/**
 * Deterministic pseudo-random number generator (Mulberry32).
 */
function pseudoRandom(seed: number): number {
  let t = (seed + 0x6D2B79F5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * Generates screen coordinates with strong weighted bias towards viewport perimeter edges.
 * ~82% of positions cluster within the outer 15% margin of the screen.
 */
export function calculateEdgeBiasedPosition(index: number, _total: number = 500): PointCoordinate {
  const r1 = pseudoRandom(index * 7 + 101);
  const r2 = pseudoRandom(index * 7 + 203);
  const r3 = pseudoRandom(index * 7 + 307);
  const r4 = pseudoRandom(index * 7 + 409);

  // 82% bias towards the outer edges (0-15% or 85-100%)
  const isEdgeBiased = r1 < 0.82;

  let top: number;
  let left: number;

  if (isEdgeBiased) {
    // 0: top, 1: bottom, 2: left, 3: right
    const edge = Math.floor(r2 * 4);
    // Depth along chosen edge: 0% to 15% (with power curve for density right at the screen bezel)
    const edgeDepth = Math.pow(r3, 1.6) * 15;
    const span = r4 * 100;

    if (edge === 0) {
      top = edgeDepth;
      left = span;
    } else if (edge === 1) {
      top = Math.max(85, 100 - edgeDepth);
      left = span;
    } else if (edge === 2) {
      left = edgeDepth;
      top = span;
    } else {
      left = Math.max(85, 100 - edgeDepth);
      top = span;
    }
  } else {
    // Interior scatter (18% probability)
    top = r2 * 100;
    left = r3 * 100;
  }

  return {
    top: parseFloat(top.toFixed(2)),
    left: parseFloat(left.toFixed(2)),
  };
}

