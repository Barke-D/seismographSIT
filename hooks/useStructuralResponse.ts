import { useMemo } from 'react';
import { DataPoint } from '../types';
import { computeSDOFResponse, StructuralParams } from '../sim/structuralResponse';

/**
 * Custom hook to calculate building sway based on seismic ground motion.
 * Qualitative educational model.
 */
export function useStructuralResponse(history: DataPoint[], dt: number = 1/60) {
  // Default structural properties for a 3-story small building
  const buildingParams: StructuralParams = {
    mass: 1200,          // kg
    stiffness: 150000,   // N/m (yields ~0.56s period)
    dampingRatio: 0.05   // 5% damping
  };

  return useMemo(() => {
    // Fix: Return consistent object structure even when history is empty to prevent type mismatch errors
    if (history.length === 0) return [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 }
    ];

    // Extract axes for integration
    const gx = history.map(d => d.x);
    const gy = history.map(d => d.y);
    const gz = history.map(d => d.z);

    // Compute relative displacements (u)
    const ux = computeSDOFResponse(gx, dt, buildingParams);
    const uy = computeSDOFResponse(gy, dt, buildingParams);
    const uz = computeSDOFResponse(gz, dt, buildingParams);

    // Get current (latest) relative offset
    const lastX = ux[ux.length - 1] || 0;
    const lastY = uy[uy.length - 1] || 0;
    const lastZ = uz[uz.length - 1] || 0;

    // Return offsets per floor (Floor 1 is least sway, Floor 3 is most sway)
    // Modeled as a simplified shear-frame amplification
    return [
      { x: lastX * 0.4, y: lastY * 0.4, z: lastZ * 0.4 },
      { x: lastX * 0.7, y: lastY * 0.7, z: lastZ * 0.7 },
      { x: lastX * 1.0, y: lastY * 1.0, z: lastZ * 1.0 }
    ];
  }, [history, dt]);
}
