import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDutyCycle,
  partitionTarget,
  calculateStorageArtifactCount,
  calculateLagDelayMs,
  formatBytes,
  calculateEdgeBiasedPosition,
} from './resourceMath.ts';

test('calculateDutyCycle caps at 99% and maintains non-zero sleep', () => {

  const atZero = calculateDutyCycle(0, 100);
  assert.equal(atZero.workMs, 0);
  assert.equal(atZero.sleepMs, 100);

  const atFifty = calculateDutyCycle(50, 100);
  assert.equal(atFifty.workMs, 50);
  assert.equal(atFifty.sleepMs, 50);

  const atMax = calculateDutyCycle(100, 100);
  // Clamped at 99%
  assert.equal(atMax.workMs, 99);
  assert.equal(atMax.sleepMs, 1);
});

test('partitionTarget evenly distributes resources among workers', () => {
  assert.equal(partitionTarget(1024, 4), 256);
  assert.equal(partitionTarget(1000, 3), 333);
  assert.equal(partitionTarget(1024, 0), 0);
});

test('calculateStorageArtifactCount scales 1mm squares with storage', () => {
  const zero = calculateStorageArtifactCount(0);
  assert.equal(zero, 0);

  const half = calculateStorageArtifactCount(2048, 4096);
  assert.ok(half > 200);

  const full = calculateStorageArtifactCount(4096, 4096);
  assert.equal(full, 500);
});

test('calculateLagDelayMs scales main thread stalls with memory', () => {
  assert.equal(calculateLagDelayMs(0, 4096), 0);
  assert.equal(calculateLagDelayMs(100, 4096), 0); // threshold
  assert.ok(calculateLagDelayMs(2048, 4096) > 30);
  assert.equal(calculateLagDelayMs(4096, 4096), 85);
});

test('formatBytes formats human readable strings correctly', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(formatBytes(1024 * 1024), '1 MB');
  assert.equal(formatBytes(1024 * 1024 * 1024), '1 GB');
});

test('calculateEdgeBiasedPosition generates coordinates with strong edge bias', () => {
  const sampleSize = 500;
  let edgeCount = 0;

  for (let i = 0; i < sampleSize; i++) {
    const pos = calculateEdgeBiasedPosition(i, sampleSize);
    assert.ok(pos.top >= 0 && pos.top <= 100, `top out of bounds: ${pos.top}`);
    assert.ok(pos.left >= 0 && pos.left <= 100, `left out of bounds: ${pos.left}`);

    // Check if within 15% edge margin (perimeter)
    const isAtEdge = pos.top <= 15 || pos.top >= 85 || pos.left <= 15 || pos.left >= 85;
    if (isAtEdge) {
      edgeCount++;
    }
  }

  // Strong edge bias: at least 80% of coordinates are in outer margin
  const edgeRatio = edgeCount / sampleSize;
  assert.ok(edgeRatio >= 0.80, `Expected >= 80% edge bias, got ${(edgeRatio * 100).toFixed(1)}%`);
});
