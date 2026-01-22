
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { DataPoint } from '../types';
import { COLORS, PHYSICS } from '../constants';

interface FrequencyBands {
  low: number;
  medium: number;
  high: number;
}

interface WaveformPlotProps {
  label: string;
  data: DataPoint[];
  dataKey: 'x' | 'y' | 'z';
  color: string;
  scale: number;
  theme: 'dark' | 'light';
  distance: number;
}

const WaveformPlot: React.FC<WaveformPlotProps> = ({ label, data, dataKey, color, scale, theme, distance }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [peak, setPeak] = useState(0);
  const [dominantFreq, setDominantFreq] = useState(0);
  const [bands, setBands] = useState<FrequencyBands>({ low: 0, medium: 0, high: 0 });

  const calculateSpectrum = (samples: number[]) => {
    const N = samples.length;
    if (N < 16) return { spectrum: new Float32Array(0), freq: 0, maxPower: 0, bands: { low: 0, medium: 0, high: 0 } };
    const spectrum = new Float32Array(Math.floor(N / 2));
    const sampleRate = 60;
    const freqResolution = sampleRate / N;
    const windowedSamples = samples.map((val, n) => val * (0.5 * (1 - Math.cos((2 * Math.PI * n) / (N - 1)))));

    let maxPower = 0;
    let peakBin = 0;
    let lowSum = 0, lowCount = 0;
    let medSum = 0, medCount = 0;
    let highSum = 0, highCount = 0;

    for (let k = 0; k < spectrum.length; k++) {
      let real = 0, imag = 0;
      for (let n = 0; n < N; n++) {
        const angle = (2 * Math.PI * k * n) / N;
        real += windowedSamples[n] * Math.cos(angle);
        imag -= windowedSamples[n] * Math.sin(angle);
      }
      const power = Math.sqrt(real * real + imag * imag) / N;
      spectrum[k] = power;
      const currentFreq = k * freqResolution;
      if (currentFreq > 0.1 && currentFreq <= 2.5) { lowSum += power; lowCount++; }
      else if (currentFreq > 2.5 && currentFreq <= 10) { medSum += power; medCount++; }
      else if (currentFreq > 10) { highSum += power; highCount++; }
      if (power > maxPower && k > 0) { maxPower = power; peakBin = k; }
    }
    const freq = (peakBin * sampleRate) / N;
    return { spectrum, freq, maxPower, bands: { low: lowCount > 0 ? lowSum / lowCount : 0, medium: medCount > 0 ? medSum / medCount : 0, high: highCount > 0 ? highSum / highCount : 0 } };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Phase Background Bands
    if (data.length > 1) {
      const step = width / (data.length - 1);
      const pArrival = (distance * 1000) / PHYSICS.P_VELOCITY;
      const sArrival = (distance * 1000) / PHYSICS.S_VELOCITY;
      const surfArrival = (distance * 1000) / PHYSICS.SURFACE_VELOCITY;

      data.forEach((point, i) => {
        const xPos = i * step;
        const nextX = (i + 1) * step;
        
        if (point.relativeTime >= pArrival && point.relativeTime < sArrival) {
          ctx.fillStyle = theme === 'dark' ? 'rgba(138, 196, 199, 0.05)' : 'rgba(138, 196, 199, 0.1)';
          ctx.fillRect(xPos, 0, step, height);
        } else if (point.relativeTime >= sArrival && point.relativeTime < surfArrival) {
          ctx.fillStyle = theme === 'dark' ? 'rgba(238, 190, 65, 0.05)' : 'rgba(238, 190, 65, 0.1)';
          ctx.fillRect(xPos, 0, step, height);
        } else if (point.relativeTime >= surfArrival) {
          ctx.fillStyle = theme === 'dark' ? 'rgba(241, 90, 36, 0.05)' : 'rgba(241, 90, 36, 0.1)';
          ctx.fillRect(xPos, 0, step, height);
        }
      });
    }

    // Grid lines
    ctx.strokeStyle = theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(226, 232, 240, 0.5)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    for (let i = 0; i < width; i += 100) { ctx.moveTo(i, 0); ctx.lineTo(i, height); }
    for (let j = 0; j < height; j += 40) { ctx.moveTo(0, j); ctx.lineTo(width, j); }
    ctx.stroke();
    ctx.setLineDash([]);

    // Center line
    ctx.strokeStyle = theme === 'dark' ? '#334155' : '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(width, midY); ctx.stroke();

    if (data.length < 2) {
      setPeak(0); setDominantFreq(0); setBands({ low: 0, medium: 0, high: 0 });
      return;
    }

    let currentPeak = 0;
    const valuesForFFT: number[] = [];
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';

    const step = width / (data.length - 1);
    data.forEach((point, i) => {
      const actualVal = point[dataKey] * 50;
      const val = actualVal * scale; 
      const xPos = i * step;
      const yPos = midY - val;
      valuesForFFT.push(actualVal);
      if (Math.abs(actualVal) > currentPeak) currentPeak = Math.abs(actualVal);
      if (i === 0) ctx.moveTo(xPos, yPos); else ctx.lineTo(xPos, yPos);

      const prevPoint = data[i-1];
      if (prevPoint) {
        if (point.activeWaves.p && !prevPoint.activeWaves.p) drawArrival(ctx, xPos, 'P-Onset', COLORS.P_WAVE);
        if (point.activeWaves.s && !prevPoint.activeWaves.s) drawArrival(ctx, xPos, 'S-Onset', COLORS.S_WAVE);
        if (point.activeWaves.surf && !prevPoint.activeWaves.surf) drawArrival(ctx, xPos, 'Surface', COLORS.SURFACE_WAVE);
      }
    });
    ctx.stroke();
    setPeak(currentPeak);

    const windowSize = Math.min(128, valuesForFFT.length);
    const fftWindow = valuesForFFT.slice(-windowSize);
    const { spectrum, freq, maxPower, bands: bandData } = calculateSpectrum(fftWindow);
    setDominantFreq(freq); setBands(bandData);

    // Spectrum Overlay
    if (spectrum.length > 0) {
      const specWidth = 140; const specHeight = 70; const margin = 10;
      const specX = width - specWidth - margin; const specY = height - specHeight - margin;
      ctx.fillStyle = theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(248, 250, 252, 0.95)';
      ctx.fillRect(specX, specY, specWidth, specHeight);
      ctx.strokeStyle = theme === 'dark' ? '#334155' : '#cbd5e1';
      ctx.strokeRect(specX, specY, specWidth, specHeight);
      const barWidth = specWidth / spectrum.length;
      const effectiveMaxPower = Math.max(maxPower, 1e-9);
      for (let i = 0; i < spectrum.length; i++) {
        const currentFreq = i * (60 / fftWindow.length);
        if (currentFreq <= 2.5) ctx.fillStyle = '#F15A24';
        else if (currentFreq <= 10) ctx.fillStyle = '#EEBE41';
        else ctx.fillStyle = '#8AC4C7';
        const h = Math.sqrt(spectrum[i] / effectiveMaxPower) * specHeight * 0.85;
        ctx.fillRect(specX + i * barWidth, specY + specHeight - h, Math.max(1, barWidth - 0.5), h);
      }
    }
  }, [data, dataKey, color, scale, theme, distance]);

  const drawArrival = (ctx: CanvasRenderingContext2D, x: number, text: string, arrivalColor: string) => {
    ctx.save();
    ctx.strokeStyle = arrivalColor;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ctx.canvas.height); ctx.stroke();
    ctx.fillStyle = arrivalColor;
    ctx.font = 'black 9px "JetBrains Mono"';
    ctx.fillText(text.toUpperCase(), x + 4, 15);
    ctx.restore();
  };

  const dominantBandLabel = useMemo(() => {
    const { low, medium, high } = bands;
    if (low > medium && low > high) return "LOW BAND (Surface)";
    if (medium > low && medium > high) return "MID BAND (S-Wave)";
    if (high > low && high > medium) return "HIGH BAND (P-Wave)";
    return "STATIONARY";
  }, [bands]);

  return (
    <div className={`flex flex-col w-full h-full rounded-2xl border p-3 md:p-4 shadow-lg transition-all border-l-[6px] ${
      theme === 'dark' ? 'bg-slate-900/80 border-slate-800 shadow-slate-950/50' : 'bg-white border-slate-200 shadow-slate-200/50'
    }`} style={{ borderLeftColor: color }}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col">
           <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 italic leading-none">{label}</span>
           <span className="text-[7px] md:text-[8px] text-slate-400 dark:text-slate-600 font-mono tracking-tighter uppercase mt-1">Channel_{dataKey.toUpperCase()} // Phase Analysis</span>
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-[10px] md:text-[12px] font-bold tracking-widest font-mono ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
            {peak.toFixed(2)} μm
          </span>
          <div className="flex gap-2 mt-0.5">
            <span className="text-[7px] text-sit-orange font-mono font-bold uppercase">{dominantBandLabel}</span>
          </div>
        </div>
      </div>
      <div className="flex-1 relative min-h-[110px] md:min-h-[140px]">
        <canvas ref={canvasRef} width={1000} height={160} className="w-full h-full rounded-lg" />
      </div>
    </div>
  );
};

export default WaveformPlot;
