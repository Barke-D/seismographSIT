
import React, { useState, useMemo } from 'react';
import { COLORS } from '../constants';
import { DataPoint, SeismicParams } from '../types';
import BuildingSimulation from './BuildingSimulation';

interface EducationalPanelProps {
  currentPoint?: DataPoint;
  history?: DataPoint[];
  params: SeismicParams;
  isSimulating: boolean;
}

const EducationalPanel: React.FC<EducationalPanelProps> = ({ currentPoint, history = [], params, isSimulating }) => {
  const [activeTab, setActiveTab] = useState<'interpretation' | 'theory' | 'structural'>('interpretation');
  const [exaggeration, setExaggeration] = useState(5);

  const structuralStatus = useMemo(() => {
    if (!currentPoint || !isSimulating) return "Structural Equilibrium";
    if (currentPoint.activeWaves.p) return "Primary Jolt: Vertical Stress";
    if (currentPoint.activeWaves.s) return "Secondary Sway: Lateral Loading";
    if (currentPoint.activeWaves.surf) return "Surface Roll: Maximum Drift";
    return "Damping & Stabilization";
  }, [currentPoint, isSimulating]);

  return (
    <div className="bg-white dark:bg-sit-daintree rounded-[3rem] border-2 border-sit-lightblue dark:border-sit-halfbaked/20 flex flex-col overflow-hidden shadow-2xl min-h-[850px] transition-all duration-500">
      <div className="flex flex-col lg:flex-row border-b border-sit-lightblue dark:border-sit-halfbaked/10 bg-sit-lightblue/20 dark:bg-sit-daintree px-10 py-10 items-start lg:items-center justify-between gap-6">
        <div className="flex flex-col">
          <h2 className="font-title font-black text-xl text-sit-daintree dark:text-white uppercase tracking-widest">Technical Observatory</h2>
          <p className="text-[10px] text-sit-orange font-sans font-black mt-1 uppercase tracking-[0.4em]">SIT Research Division • Group 9</p>
        </div>
        <div className="flex w-full lg:w-auto gap-3 p-2 bg-sit-lightblue/40 dark:bg-slate-900 rounded-[1.5rem]">
          <button onClick={() => setActiveTab('interpretation')} className={`flex-1 lg:flex-none px-8 py-3 rounded-2xl text-[10px] font-title font-black uppercase tracking-widest transition-all ${activeTab === 'interpretation' ? 'bg-sit-orange text-white shadow-xl scale-105' : 'text-sit-daintree/40 dark:text-sit-halfbaked/40 hover:bg-sit-lightblue/20'}`}>Interpretation</button>
          <button onClick={() => setActiveTab('structural')} className={`flex-1 lg:flex-none px-8 py-3 rounded-2xl text-[10px] font-title font-black uppercase tracking-widest transition-all ${activeTab === 'structural' ? 'bg-sit-orange text-white shadow-xl scale-105' : 'text-sit-daintree/40 dark:text-sit-halfbaked/40 hover:bg-sit-lightblue/20'}`}>Structural View</button>
          <button onClick={() => setActiveTab('theory')} className={`flex-1 lg:flex-none px-8 py-3 rounded-2xl text-[10px] font-title font-black uppercase tracking-widest transition-all ${activeTab === 'theory' ? 'bg-sit-orange text-white shadow-xl scale-105' : 'text-sit-daintree/40 dark:text-sit-halfbaked/40 hover:bg-sit-lightblue/20'}`}>Physics Core</button>
        </div>
      </div>

      <div className="flex-1 p-10 md:p-14 overflow-y-auto custom-scrollbar">
        {activeTab === 'interpretation' && (
          <div className="space-y-14 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <section className="space-y-10">
              <div className="flex items-center gap-5">
                 <div className="h-8 w-2 bg-sit-orange rounded-full" />
                 <h3 className="font-title font-black text-sit-daintree dark:text-white uppercase text-sm tracking-[0.2em]">Wave Signature Identification</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <PhaseCard title="Base State" time="Idle" status="Stable" color="#94a3b8">Normal background noise levels with no significant structural loading.</PhaseCard>
                <PhaseCard title="P-Waves" time="Fastest" status="Pulse" color={COLORS.P_WAVE}>High-frequency compressional waves. Arrival indicates immediate seismic start.</PhaseCard>
                <PhaseCard title="S-Waves" time="Shear" status="Lateral" color={COLORS.S_WAVE}>Secondary shear waves. These introduce the first major side-to-side sways.</PhaseCard>
                <PhaseCard title="Surface" time="Severe" status="Roll" color={COLORS.SURFACE_WAVE}>Complex rolling waves. Responsible for the highest peak ground displacements.</PhaseCard>
              </div>
            </section>
            
            <section className="bg-sit-lightblue/20 dark:bg-slate-900/50 p-12 rounded-[3.5rem] border border-sit-lightblue dark:border-sit-halfbaked/10">
              <h4 className="font-title font-black text-sit-orange text-[12px] uppercase tracking-[0.3em] mb-8">Our observation</h4>
              <p className="text-[17px] leading-relaxed text-sit-daintree/70 dark:text-sit-lightblue/60 font-sans italic max-w-4xl">
                "Our real-time analysis focuses on the spectral density of the incoming signals. By isolating the low-frequency rollers from the high-frequency P-jolts, we can quantify the structural danger to nearby tall buildings."
              </p>
            </section>

            <section className="space-y-10">
              <div className="flex items-center gap-5">
                 <div className="h-8 w-2 bg-sit-orange rounded-full" />
                 <h3 className="font-title font-black text-sit-daintree dark:text-white uppercase text-sm tracking-[0.2em]">2. Quantitative Metrics & Significance</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-sit-daintree/40 p-8 rounded-[2.5rem] border-2 border-sit-lightblue dark:border-sit-halfbaked/20 flex gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-sit-orange/10 flex items-center justify-center shrink-0 border border-sit-orange/20">
                    <span className="text-xl font-black text-sit-orange font-mono">μm</span>
                  </div>
                  <div>
                    <h4 className="font-title font-black text-sm text-sit-daintree dark:text-white uppercase mb-2 tracking-tight">Peak Ground Displacement (PGD)</h4>
                    <p className="text-[13px] text-sit-daintree/60 dark:text-sit-lightblue/50 font-sans leading-relaxed">
                      Measured in Micrometers (μm), where 1 μm = 10⁻⁶ meters. Our instrumentation tracks the absolute spatial translation of the ground relative to an inertial reference. While a 500 μm displacement (0.5 mm) appears negligible to human perception, the acceleration associated with high-frequency cycles at this scale generates massive structural stress.
                    </p>
                  </div>
                </div>
                <div className="bg-white dark:bg-sit-daintree/40 p-8 rounded-[2.5rem] border-2 border-sit-lightblue dark:border-sit-halfbaked/20 flex gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-sit-halfbaked/10 flex items-center justify-center shrink-0 border border-sit-halfbaked/20">
                    <span className="text-xl font-black text-sit-halfbaked font-mono">Hz</span>
                  </div>
                  <div>
                    <h4 className="font-title font-black text-sm text-sit-daintree dark:text-white uppercase mb-2 tracking-tight">Dominant Spectral Frequency</h4>
                    <p className="text-[13px] text-sit-daintree/60 dark:text-sit-lightblue/50 font-sans leading-relaxed">
                      Expressed in Hertz (Hz), this represents the oscillation rate per second. Low-frequency rolling (0.1–1.0 Hz) is critical for structural resonance in large skyscrapers, while high-frequency rattles (5–10 Hz) are most destructive to rigid masonry and smaller domestic structures.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'theory' && (
          <div className="space-y-14 animate-in fade-in slide-in-from-bottom-6 duration-700 font-sans">
            <section className="space-y-8">
               <h3 className="font-title font-black text-3xl text-sit-daintree dark:text-white tracking-tight uppercase">Earth Physics Foundation</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="p-8 bg-sit-lightblue/20 dark:bg-slate-900/50 rounded-[2.5rem] border border-sit-lightblue dark:border-sit-halfbaked/10">
                    <h5 className="font-title font-black text-[12px] uppercase text-sit-orange tracking-widest mb-4">Physics Assumptions</h5>
                    <ul className="space-y-3 text-sit-daintree/70 dark:text-sit-lightblue/60 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-sit-orange rounded-full" />
                        <span>The Earth is treated as a <b>homogeneous and isotropic medium</b>.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-sit-orange rounded-full" />
                        <span>Waves travel at constant velocities based on rock elasticity.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-sit-orange rounded-full" />
                        <span>Energy dissipation is modeled via exponential decay.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="p-8 bg-sit-lightblue/20 dark:bg-slate-900/50 rounded-[2.5rem] border border-sit-lightblue dark:border-sit-halfbaked/10">
                    <h5 className="font-title font-black text-[12px] uppercase text-sit-orange tracking-widest mb-4">Propagation Velocities</h5>
                    <div className="space-y-4 font-mono text-sm">
                      <div className="flex justify-between border-b border-sit-halfbaked/10 pb-1">
                        <span className="text-sit-halfbaked">Primary (Vp):</span>
                        <span className="font-bold">6000.0 m/s</span>
                      </div>
                      <div className="flex justify-between border-b border-sit-halfbaked/10 pb-1">
                        <span className="text-sit-yellow">Secondary (Vs):</span>
                        <span className="font-bold">3500.0 m/s</span>
                      </div>
                      <div className="flex justify-between border-b border-sit-halfbaked/10 pb-1">
                        <span className="text-sit-orange">Surface (Vsurf):</span>
                        <span className="font-bold">3000.0 m/s</span>
                      </div>
                      <p className="text-[10px] font-sans text-sit-daintree/40 dark:text-sit-lightblue/40 uppercase italic mt-2">
                        *Arrival Time = Distance / Velocity
                      </p>
                    </div>
                  </div>
               </div>
            </section>

            <section className="space-y-10">
               <div className="flex items-center gap-5">
                  <div className="h-8 w-2 bg-sit-orange rounded-full shadow-lg" />
                  <h3 className="font-title font-black text-sit-daintree dark:text-white uppercase text-sm tracking-[0.2em]">Seismic Signal Synthesis</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="space-y-6">
                    <h5 className="font-title font-black text-sit-daintree dark:text-white text-xs uppercase tracking-[0.2em]">1. Gamma Envelope</h5>
                    <div className="bg-sit-lightblue/20 dark:bg-slate-900/50 p-8 rounded-[3rem] border border-sit-lightblue dark:border-sit-halfbaked/10 flex flex-col items-center justify-center min-h-[180px] text-center">
                       <p className="text-lg font-title font-black text-sit-orange mb-3">Envelope(t) = (Δt)² · e<sup>-λΔt</sup></p>
                       <p className="text-[11px] text-sit-daintree/60 dark:text-sit-lightblue/50 leading-relaxed font-sans">
                         Simulates the "messy" burst of energy: starting with a sudden jump and fading slowly as it dissipates through rock.
                       </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h5 className="font-title font-black text-sit-daintree dark:text-white text-xs uppercase tracking-[0.2em]">2. Amplitude Scaling</h5>
                    <div className="bg-sit-lightblue/20 dark:bg-slate-900/50 p-8 rounded-[3rem] border border-sit-lightblue dark:border-sit-halfbaked/10 flex flex-col items-center justify-center min-h-[180px] text-center">
                       <p className="text-lg font-title font-black text-sit-orange mb-3">A<sub>scale</sub> = 10<sup>(Mw - 5.0)</sup></p>
                       <p className="text-[11px] text-sit-daintree/60 dark:text-sit-lightblue/50 leading-relaxed font-sans">
                         Derived from the Moment Magnitude (Mw) scale, representing the logarithmic release of seismic joules.
                       </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h5 className="font-title font-black text-sit-daintree dark:text-white text-xs uppercase tracking-[0.2em]">3. Total Motion</h5>
                    <div className="bg-sit-lightblue/20 dark:bg-slate-900/50 p-8 rounded-[3rem] border border-sit-lightblue dark:border-sit-halfbaked/10 flex flex-col items-center justify-center min-h-[180px] text-center">
                       <p className="text-lg font-title font-black text-sit-orange mb-3">A(t) = A<sub>scale</sub> · Envelope · sin(2πfΔt)</p>
                       <p className="text-[11px] text-sit-daintree/60 dark:text-sit-lightblue/50 leading-relaxed font-sans">
                         Combines magnitude scaling, energy envelope, and oscillatory frequency to produce the 3D ground motion vector.
                       </p>
                    </div>
                  </div>
               </div>
            </section>
          </div>
        )}

        {activeTab === 'structural' && (
          <div className="flex flex-col xl:flex-row gap-14 animate-in fade-in slide-in-from-bottom-8 duration-700 h-full">
             <div className="w-full xl:w-[65%] min-h-[500px] xl:min-h-0 aspect-[16/10] relative">
                <BuildingSimulation 
                  currentPoint={currentPoint} 
                  exaggeration={exaggeration} 
                  isSimulating={isSimulating}
                  magnitude={params.magnitude}
                  collapseThreshold={params.collapseThreshold}
                />
             </div>
             <div className="flex-1 space-y-10 py-6">
                <div className="p-8 bg-sit-orange/5 dark:bg-slate-900/80 rounded-[2.5rem] border border-sit-orange/20 shadow-xl shadow-sit-orange/5">
                   <p className="text-[10px] font-black uppercase text-sit-orange tracking-[0.3em] mb-2">Live Structural Status</p>
                   <p className="text-lg font-title font-bold text-sit-daintree dark:text-white uppercase">{structuralStatus}</p>
                </div>
                
                <div className="space-y-6">
                  <h3 className="font-title font-black text-sit-daintree dark:text-white uppercase text-sm tracking-widest border-l-6 border-sit-orange pl-6">Building Response Profile</h3>
                  <p className="text-sit-daintree/70 dark:text-sit-lightblue/60 leading-relaxed text-[16px]">
                    This 2-story reinforced concrete model demonstrates how lateral loads translate through the foundation to the roof. We've implemented a <strong>Sigmoid Soft-Clamp</strong> on the visual physics to ensure the building remains within observable bounds while still visualizing extreme drift.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="p-6 bg-sit-lightblue/30 dark:bg-slate-900 rounded-[2rem] border border-sit-lightblue">
                      <p className="text-[10px] font-mono text-sit-daintree/50 dark:text-sit-halfbaked font-bold uppercase mb-2">Drift Load</p>
                      <p className="text-xl font-title font-black text-sit-daintree dark:text-white">{(params.magnitude * 1.8).toFixed(1)} kN/m²</p>
                   </div>
                   <div className="p-6 bg-sit-lightblue/30 dark:bg-slate-900 rounded-[2rem] border border-sit-lightblue">
                      <p className="text-[10px] font-mono text-sit-daintree/50 dark:text-sit-halfbaked font-bold uppercase mb-2">Elastic Limit</p>
                      <p className="text-xl font-title font-black text-sit-orange">Mw {params.collapseThreshold.toFixed(1)} Trigger</p>
                   </div>
                </div>

                <div className="pt-6">
                   <p className="text-[11px] font-sans text-sit-daintree/40 dark:text-sit-lightblue/30 uppercase font-black tracking-[0.4em] mb-4">View Controls</p>
                   <div className="flex flex-wrap gap-4">
                      <div className="px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-slate-700">Auto-Center: ON</div>
                      <div className="px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-slate-700">Perspective: 35° ISO</div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PhaseCard = ({ title, time, status, color, children }: any) => (
  <div className="bg-white dark:bg-sit-daintree/40 p-8 rounded-[2.5rem] border-2 border-sit-lightblue dark:border-sit-halfbaked/20 hover:border-sit-orange/40 hover:scale-[1.02] transition-all shadow-xl shadow-sit-daintree/5">
    <div className="flex justify-between items-start mb-6">
      <span className="text-[10px] font-black text-sit-orange uppercase tracking-widest">{status}</span>
      <span className="text-[9px] font-mono text-sit-daintree/40 dark:text-sit-halfbaked/40 border px-3 py-1 rounded-full">{time}</span>
    </div>
    <h4 className="font-title font-black text-sm text-sit-daintree dark:text-white uppercase mb-4 tracking-tight" style={{ color: color }}>{title}</h4>
    <p className="text-[13px] text-sit-daintree/60 dark:text-sit-lightblue/50 font-sans leading-relaxed">{children}</p>
  </div>
);

const FormulaBox = ({ title, math, desc }: any) => (
  <div className="space-y-6 p-2">
    <h5 className="font-title font-black text-sit-daintree dark:text-white text-xs uppercase tracking-[0.2em]">{title}</h5>
    <div className="bg-sit-lightblue/20 dark:bg-slate-900/50 p-10 rounded-[3rem] border border-sit-lightblue dark:border-sit-halfbaked/10 flex flex-col items-center justify-center min-h-[160px] shadow-inner">
       <p className="text-xl md:text-2xl font-title font-black text-sit-orange mb-4 text-center">{math}</p>
       <p className="text-[11px] text-sit-daintree/40 dark:text-sit-halfbaked/40 uppercase tracking-widest font-bold text-center leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default EducationalPanel;
