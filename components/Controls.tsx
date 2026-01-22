
import React from 'react';
import { SeismicParams, WaveToggles } from '../types';
import { COLORS } from '../constants';

interface ControlsProps {
  params: SeismicParams;
  setParams: React.Dispatch<React.SetStateAction<SeismicParams>>;
  toggles: WaveToggles;
  setToggles: React.Dispatch<React.SetStateAction<WaveToggles>>;
  onTrigger: () => void;
  onReplay: () => void;
  canReplay: boolean;
  isSimulating: boolean;
  theme: 'dark' | 'light';
}

const Controls: React.FC<ControlsProps> = ({ params, setParams, toggles, setToggles, onTrigger, onReplay, canReplay, isSimulating, theme }) => {
  const isDarkMode = theme === 'dark';
  return (
    <div className={`flex flex-col h-full rounded-3xl border shadow-2xl transition-all duration-300 overflow-hidden ${
      isDarkMode ? 'bg-slate-900 border-sit-halfbaked/20' : 'bg-white border-sit-lightblue'
    }`}>
      <div className={`p-8 border-b ${isDarkMode ? 'border-sit-halfbaked/10 bg-sit-daintree/30' : 'border-sit-lightblue bg-sit-lightblue/20'}`}>
        <h2 className="font-title font-black text-xl tracking-tight text-sit-daintree dark:text-white uppercase">Simulation Settings</h2>
        <p className="text-[9px] text-sit-orange font-sans font-black uppercase tracking-[0.25em] mt-1">Adjust Event Details</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
        <div className="space-y-6">
          <ControlItem label="Distance from Origin" val={`${params.distance} km`} min={10} max={250} value={params.distance} onChange={(v:any) => setParams(p=>({...p, distance:v}))} theme={theme} />
          <ControlItem label="Event Magnitude (Mw)" val={params.magnitude.toFixed(1)} min={2} max={9.5} step={0.1} value={params.magnitude} onChange={(v:any) => setParams(p=>({...p, magnitude:v}))} theme={theme} />
          <ControlItem label="Shaking Frequency" val={`${params.frequency.toFixed(1)} Hz`} min={0.5} max={8} value={params.frequency} onChange={(v:any) => setParams(p=>({...p, frequency:v}))} theme={theme} />
          <ControlItem label="Energy Damping" val={params.damping.toFixed(2)} min={0.05} max={0.8} value={params.damping} onChange={(v:any) => setParams(p=>({...p, damping:v}))} theme={theme} />
          <ControlItem label="Failure Limit (Mw)" val={params.collapseThreshold.toFixed(1)} min={5} max={9.5} step={0.1} value={params.collapseThreshold} onChange={(v:any) => setParams(p=>({...p, collapseThreshold:v}))} theme={theme} />
        </div>

        <div className={`space-y-4 pt-8 border-t ${isDarkMode ? 'border-sit-halfbaked/10' : 'border-sit-lightblue'}`}>
          <h3 className="text-[10px] font-black text-sit-daintree/40 dark:text-sit-lightblue/40 uppercase tracking-widest">Toggle Wave Phases</h3>
          <div className="grid grid-cols-1 gap-2">
            <PhaseToggle active={toggles.pWave} onClick={() => setToggles(p=>({...p, pWave:!p.pWave}))} label="P-Waves" color={COLORS.P_WAVE} desc="The first, fast pulses" theme={theme} />
            <PhaseToggle active={toggles.sWave} onClick={() => setToggles(p=>({...p, sWave:!p.sWave}))} label="S-Waves" color={COLORS.S_WAVE} desc="Side-to-side shear" theme={theme} />
            <PhaseToggle active={toggles.surfaceWave} onClick={() => setToggles(p=>({...p, surfaceWave:!p.surfaceWave}))} label="Surface Waves" color={COLORS.SURFACE_WAVE} desc="Strong, rolling energy" theme={theme} />
          </div>
        </div>
      </div>

      <div className={`p-8 border-t space-y-3 ${isDarkMode ? 'border-sit-halfbaked/10' : 'border-sit-lightblue'}`}>
         <button onClick={onTrigger} disabled={isSimulating} className={`w-full py-4 rounded-2xl font-title font-black text-xs tracking-widest transition-all active:scale-95 shadow-lg ${
            isSimulating ? 'bg-sit-lightblue dark:bg-slate-800 text-sit-daintree/40' : 'bg-sit-orange hover:bg-[#D1491F] text-white'
          }`}>
          {isSimulating ? 'Recording Active' : 'Start Simulation'}
        </button>
        <button onClick={onReplay} disabled={isSimulating || !canReplay} className={`w-full py-3 rounded-xl font-bold text-[10px] tracking-widest transition-all border-2 ${
            isSimulating || !canReplay ? 'border-sit-lightblue text-sit-lightblue/60' : 'border-sit-halfbaked text-sit-daintree dark:text-sit-halfbaked hover:bg-sit-halfbaked/10'
          }`}>
          Replay Last Event
        </button>
        <p className="text-[8px] text-center text-sit-daintree/30 dark:text-sit-lightblue/20 font-sans uppercase tracking-[0.3em] font-black mt-2">Group 9 • SIT Project</p>
      </div>
    </div>
  );
};

const ControlItem = ({ label, val, min, max, step=1, value, onChange, theme }: any) => (
  <div>
    <div className="flex justify-between text-[11px] mb-2 font-sans">
      <span className="text-sit-daintree/50 dark:text-sit-lightblue/50 font-black uppercase tracking-tight">{label}</span>
      <span className="font-mono font-bold text-sit-orange">{val}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-sit-lightblue dark:bg-sit-daintree/60 accent-sit-orange" />
  </div>
);

const PhaseToggle = ({ active, onClick, label, color, desc, theme }: any) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
    active ? (theme==='dark' ? 'bg-sit-daintree border-sit-halfbaked/30 shadow-lg' : 'bg-sit-lightblue/30 border-sit-halfbaked') : 'bg-transparent border-transparent opacity-30 hover:opacity-50'
  }`}>
    <div className="flex flex-col items-start">
      <span className="text-[11px] font-title font-black uppercase tracking-tight" style={{ color: active ? color : undefined }}>{label}</span>
      <span className="text-[9px] text-sit-daintree/50 dark:text-sit-lightblue/50 uppercase font-sans tracking-tight">{desc}</span>
    </div>
    <div className={`w-3 h-3 rounded-full ${active ? 'animate-pulse' : ''}`} style={{ backgroundColor: color }} />
  </button>
);

export default Controls;
