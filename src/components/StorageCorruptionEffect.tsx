import React, { useMemo } from 'react';
import {
  calculateStorageArtifactCount,
  calculateMemoryArtifactCount,
  calculateEdgeBiasedPosition,
} from '../utils/resourceMath.ts';

interface StorageCorruptionEffectProps {
  storageMB: number; // 0 to 4096
  maxStorageMB?: number;
  memoryMB?: number;
  maxMemoryMB?: number;
}

export const StorageCorruptionEffect: React.FC<StorageCorruptionEffectProps> = ({
  storageMB,
  maxStorageMB = 4096,
  memoryMB = 0,
  maxMemoryMB = 4096,
}) => {
  // Max artifacts dynamically based on whatever ceiling memory or storage is configured to
  const maxArtifactCapacity = Math.max(
    500,
    Math.min(2500, Math.round((Math.max(maxMemoryMB, maxStorageMB) / 1024) * 125))
  );

  const memoryCount = calculateMemoryArtifactCount(memoryMB, maxMemoryMB, maxArtifactCapacity);
  const storageCount = calculateStorageArtifactCount(storageMB, maxStorageMB);
  const count = Math.min(maxArtifactCapacity, Math.max(memoryCount, storageCount));

  // 1mm square ≈ 3.78px (~4px by 4px), mostly white like the background (#ffffff, #fafafa)
  const squares = useMemo(() => {
    const list = [];
    for (let i = 0; i < maxArtifactCapacity; i++) {
      const { top, left } = calculateEdgeBiasedPosition(i, maxArtifactCapacity);

      // Mostly white like the page background, with subtle tone variations
      const colorType = i % 12;
      const bg =
        colorType === 0
          ? '#ffffff'
          : colorType === 1
          ? '#fafafa'
          : colorType === 2
          ? '#f4f4f5'
          : colorType === 3
          ? '#ffffff'
          : colorType === 4
          ? '#ffffff'
          : colorType === 5
          ? '#f8fafc'
          : colorType === 6
          ? '#ffffff'
          : colorType === 7
          ? '#f1f5f9'
          : colorType === 8
          ? '#ffffff'
          : colorType === 9
          ? '#fff7ed' // faint warm white
          : colorType === 10
          ? '#f0fdf4' // faint cool white
          : '#ffffff';

      list.push({ id: i, top, left, bg });
    }
    return list;
  }, [maxArtifactCapacity]);

  if (count <= 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-36 overflow-hidden select-none"
    >
      {squares.slice(0, count).map((sq) => (
        <div
          key={sq.id}
          style={{
            position: 'absolute',
            top: `${sq.top}%`,
            left: `${sq.left}%`,
            width: '4px',
            height: '4px',
            backgroundColor: sq.bg,
            border: '1px solid rgba(228, 228, 231, 0.7)',
            opacity: 0.92,
            boxShadow: '0 0 1px rgba(0,0,0,0.06)',
          }}
        />
      ))}
    </div>
  );
};
