
import { SeismicParams, WaveToggles, DataPoint } from '../types';
import { PHYSICS } from '../constants';

const calculateEnvelope = (t: number, damping: number, sharpness: number = 2) => {
  if (t <= 0) return 0;
  return Math.pow(t, sharpness) * Math.exp(-damping * t * 1.5);
};

export const calculateGroundMotion = (
  time: number,
  startTime: number,
  params: SeismicParams,
  toggles: WaveToggles
): DataPoint => {
  const elapsed = time - startTime;
  
  const distanceMeters = params.distance * 1000;
  const pArrival = distanceMeters / PHYSICS.P_VELOCITY;
  const sArrival = distanceMeters / PHYSICS.S_VELOCITY;
  const surfArrival = distanceMeters / PHYSICS.SURFACE_VELOCITY;

  const magAmplitude = Math.pow(10, (params.magnitude - 5));

  const getBroadbandWave = (arrival: number, baseFreq: number, ampWeight: number, dampingMult: number, complexity: number = 1) => {
    const t = elapsed - arrival;
    if (t < 0 || t > 60) return 0;

    // Use specific frequency signatures for better distinction
    const signal = (
      Math.sin(2 * Math.PI * baseFreq * t) +
      0.3 * Math.sin(2 * Math.PI * baseFreq * 1.5 * t + 0.8) +
      (complexity > 1 ? 0.15 * Math.sin(2 * Math.PI * baseFreq * 2.2 * t + 1.2) : 0)
    );

    const env = calculateEnvelope(t, params.damping * dampingMult);
    return signal * env * ampWeight * magAmplitude;
  };

  let x = 0, y = 0, z = 0;

  // P-WAVE: High Frequency, Vertical Dominance, Sharp Attack
  if (toggles.pWave) {
    const pAmp = getBroadbandWave(pArrival, params.frequency * 2.5, 0.4, 3.0, 1);
    x += pAmp * 0.15;
    y += pAmp * 0.15;
    z += pAmp * 1.2; // Strongest on vertical
  }

  // S-WAVE: Medium Frequency, Horizontal Dominance, Rumble
  if (toggles.sWave) {
    const sAmp = getBroadbandWave(sArrival, params.frequency * 1.0, 1.4, 1.0, 2);
    x += sAmp * 1.2;
    y += sAmp * 1.2;
    z += sAmp * 0.3;
  }

  // SURFACE WAVE: Low Frequency, Rolling Motion, Long Duration
  if (toggles.surfaceWave) {
    const surfAmp = getBroadbandWave(surfArrival, params.frequency * 0.45, 2.8, 0.3, 3);
    x += surfAmp * 1.8;
    y += surfAmp * 1.8;
    z += surfAmp * 1.0;
  }

  const noiseScale = params.noiseLevel * 0.015;
  x += (Math.random() - 0.5) * noiseScale;
  y += (Math.random() - 0.5) * noiseScale;
  z += (Math.random() - 0.5) * noiseScale;

  return {
    time,
    relativeTime: elapsed,
    x,
    y,
    z,
    activeWaves: {
      p: elapsed >= pArrival && elapsed < sArrival,
      s: elapsed >= sArrival && elapsed < surfArrival,
      surf: elapsed >= surfArrival && elapsed < surfArrival + 25
    }
  };
};
