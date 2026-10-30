import React, { useMemo } from 'react';
import { calculateStorageArtifactCount, calculateEdgeBiasedPosition } from '../utils/resourceMath.ts';

interface StorageCorruptionEffectProps {
  storageMB: number; // 0 to 4096
  maxStorageMB?: number;
}

export const StorageCorruptionEffect: React.FC<StorageCorruptionEffectProps> = ({
  storageMB,
  maxStorageMB = 4096,
}) => {
  const count = calculateStorageArtifactCount(storageMB, maxStorageMB);

  // 1mm square ≈ 3.78px (~4px by 4px), nearly opaque (0.94) scattered with strong edge bias
  const squares = useMemo(() => {
    const list = [];
    for (let i = 0; i < 500; i++) {
      const { top, left } = calculateEdgeBiasedPosition(i, 500);

      const colorType = i % 10;
      const bg =
        colorType === 0
          ? '#ff0055' // neon red glitch
          : colorType === 1
          ? '#00e5ff' // cyan glitch
          : colorType === 2
          ? '#ffff00' // yellow glitch
          : '#000000'; // black void square

      list.push({ id: i, top, left, bg });
    }
    return list;
  }, []);

  if (count <= 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-36 overflow-hidden select-none"
    >
      {squares.slice(0, count).map((sq) => (
        <div
          key={sq.id}
          className="absolute"
          style={{
            top: `${sq.top}%`,
            left: `${sq.left}%`,
            // 1mm square: 1mm ≈ 3.78px (~4px)
            width: '4px',
            height: '4px',
            backgroundColor: sq.bg,
            // nearly opaque
            opacity: 0.92,
            boxShadow: '0 0 1px rgba(0, 0, 0, 0.9)',
          }}
        />
      ))}
    </div>
  );
};
