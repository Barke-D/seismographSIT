/**
 * STRUCTURAL DYNAMICS MODULE (Undergraduate Physics / Seismology)
 * This module computes the relative displacement of a structure relative to ground motion.
 * 
 * Physics Model: Damped Mass-Spring-Damper system driven by base acceleration.
 * Equation of Motion: m*u''(t) + c*u'(t) + k*u(t) = -m*ug''(t)
 * where u is relative displacement and ug is ground displacement.
 */

export interface StructuralParams {
  mass: number;      // kg
  stiffness: number; // N/m
  dampingRatio: number; // xi (dimensionless, 0.02 - 0.05 typical)
}

/**
 * Solves for relative structural displacement using the Central Difference Method.
 * This is an explicit numerical integration scheme.
 * 
 * @param groundDisp Array of ground displacement values (ug)
 * @param dt Time step (seconds)
 * @param params Structural properties
 * @returns Array of relative structural displacements (u)
 */
export function computeSDOFResponse(
  groundDisp: number[],
  dt: number,
  params: StructuralParams
): number[] {
  const n = groundDisp.length;
  if (n < 3) return new Array(n).fill(0);

  const { mass: m, stiffness: k, dampingRatio: zeta } = params;
  
  // Natural frequency calculations
  const wn = Math.sqrt(k / m);
  const c = 2 * zeta * m * wn;

  const u = new Array(n).fill(0);
  
  // 1. Numerical differentiation to find ground acceleration (ug'')
  // Accel_i = (ug_{i+1} - 2*ug_i + ug_{i-1}) / dt^2
  const groundAccel = new Array(n).fill(0);
  for (let i = 1; i < n - 1; i++) {
    groundAccel[i] = (groundDisp[i + 1] - 2 * groundDisp[i] + groundDisp[i - 1]) / (dt * dt);
  }

  // 2. Setup Central Difference Constants
  // We use effective stiffness and force to solve for u_{i+1}
  const kHat = m / (dt * dt) + c / (2 * dt);
  const a = m / (dt * dt) - c / (2 * dt);
  const b = k - 2 * m / (dt * dt);

  // Initial conditions (assume rest)
  u[0] = 0;
  // Special handling for u[-1] to start integration
  let uPrev = 0; // u_{-1} approximated for zero initial velocity/accel

  for (let i = 0; i < n - 1; i++) {
    const Pi = -m * groundAccel[i]; // Effective load from base acceleration
    u[i + 1] = (Pi - a * uPrev - b * u[i]) / kHat;
    uPrev = u[i];
  }

  // Educational note: Results are qualitative and intended for classroom visualization.
  return u;
}
