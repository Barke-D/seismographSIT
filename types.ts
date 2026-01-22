
export interface SeismicParams {
  magnitude: number;
  frequency: number;
  duration: number;
  damping: number;
  noiseLevel: number;
  distance: number; // km from epicenter
  packetWidth: number;
  dispersionRate: number;
  collapseThreshold: number; // Mw at which building fails
}

export interface WaveToggles {
  pWave: boolean;
  sWave: boolean;
  surfaceWave: boolean;
}

export interface DataPoint {
  time: number;
  relativeTime: number; // seconds since simulation start
  x: number;
  y: number;
  z: number;
  activeWaves: {
    p: boolean;
    s: boolean;
    surf: boolean;
  };
}

export enum WaveType {
  P = 'P-Wave',
  S = 'S-Wave',
  Surface = 'Surface-Wave'
}
