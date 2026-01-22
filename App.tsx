
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { SeismicParams, WaveToggles, DataPoint } from './types';
import { PHYSICS, COLORS } from './constants';
import { calculateGroundMotion } from './services/seismicPhysics';
import WaveformPlot from './components/WaveformPlot';
import Controls from './components/Controls';
import EducationalPanel from './components/EducationalPanel';

const App: React.FC = () => {
  const [params, setParams] = useState<SeismicParams>({
    magnitude: 6.8,
    frequency: 3.0,
    duration: 12,
    damping: 0.25,
    noiseLevel: 4,
    distance: 50,
    packetWidth: 10,
    dispersionRate: 0.1,
    collapseThreshold: 8.5
  });

  const [toggles, setToggles] = useState<WaveToggles>({
    pWave: true,
    sWave: true,
    surfaceWave: true
  });

  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [history, setHistory] = useState<DataPoint[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  
  const lastEventParams = useRef<SeismicParams | null>(null);
  const lastEventToggles = useRef<WaveToggles | null>(null);
  const sessionPeaks = useRef({ p: { amp: 0, time: 0 }, s: { amp: 0, time: 0 }, surf: { amp: 0, time: 0 }, x: 0, y: 0, z: 0 });
  const startTimeRef = useRef<number | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const dataBuffer = useRef<DataPoint[]>([]);

  const onTrigger = useCallback(() => {
    setIsSimulating(true);
    setIsReplaying(false);
    sessionPeaks.current = { p: { amp: 0, time: 0 }, s: { amp: 0, time: 0 }, surf: { amp: 0, time: 0 }, x: 0, y: 0, z: 0 };
    lastEventParams.current = { ...params };
    lastEventToggles.current = { ...toggles };
    startTimeRef.current = performance.now() / 1000;
    dataBuffer.current = [];
    setHistory([]);
  }, [params, toggles]);

  const onReplay = useCallback(() => {
    if (!lastEventParams.current || !lastEventToggles.current) return;
    setIsSimulating(false);
    setIsReplaying(true);
    sessionPeaks.current = { p: { amp: 0, time: 0 }, s: { amp: 0, time: 0 }, surf: { amp: 0, time: 0 }, x: 0, y: 0, z: 0 };
    startTimeRef.current = performance.now() / 1000;
    dataBuffer.current = [];
    setHistory([]);
  }, []);

  useEffect(() => {
    const loop = (time: number) => {
      const currentTime = time / 1000;
      const start = startTimeRef.current || currentTime;
      let point: DataPoint | null = null;
      
      if (isSimulating) {
        point = calculateGroundMotion(currentTime, start, params, toggles);
        if (currentTime - start > params.duration + 25) setIsSimulating(false);
      } else if (isReplaying && lastEventParams.current && lastEventToggles.current) {
        point = calculateGroundMotion(currentTime, start, lastEventParams.current, lastEventToggles.current);
        if (currentTime - start > lastEventParams.current.duration + 25) setIsReplaying(false);
      } else {
        point = calculateGroundMotion(currentTime, start, params, toggles);
      }
      
      if (point) {
        const ampX = Math.abs(point.x) * 50, ampY = Math.abs(point.y) * 50, ampZ = Math.abs(point.z) * 50;
        const currentDisp = Math.max(ampX, ampY, ampZ);
        if (ampX > sessionPeaks.current.x) sessionPeaks.current.x = ampX;
        if (ampY > sessionPeaks.current.y) sessionPeaks.current.y = ampY;
        if (ampZ > sessionPeaks.current.z) sessionPeaks.current.z = ampZ;
        if (point.activeWaves.p && currentDisp > sessionPeaks.current.p.amp) sessionPeaks.current.p = { amp: currentDisp, time: point.relativeTime };
        if (point.activeWaves.s && currentDisp > sessionPeaks.current.s.amp) sessionPeaks.current.s = { amp: currentDisp, time: point.relativeTime };
        if (point.activeWaves.surf && currentDisp > sessionPeaks.current.surf.amp) sessionPeaks.current.surf = { amp: currentDisp, time: point.relativeTime };
        dataBuffer.current.push(point);
        if (dataBuffer.current.length > PHYSICS.HISTORY_LENGTH) dataBuffer.current.shift();
        setHistory([...dataBuffer.current]);
      }
      frameIdRef.current = requestAnimationFrame(loop);
    };
    frameIdRef.current = requestAnimationFrame(loop);
    return () => { if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current); };
  }, [params, toggles, isSimulating, isReplaying]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const Logo = () => {
    const isDark = theme === 'dark';
    const mainColor = isDark ? '#FFFFFF' : '#05262D';
    const orangeAccent = '#F15A24';
    
    return (
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 119 109" className="w-14 h-14 md:w-16 md:h-16 shrink-0 drop-shadow-sm">
          <path d="M0 0 C3.1875 0.3125 3.1875 0.3125 5.33984375 1.62890625 C8.30000832 5.92834189 7.86627759 10.46038549 7.9375 15.5625 C7.96714844 16.59375 7.99679688 17.625 8.02734375 18.6875 C8.09794778 21.22924495 8.15069009 23.77007783 8.1875 26.3125 C9.44754665 25.22915565 10.70480865 24.14257208 11.9609375 23.0546875 C12.66138184 22.44995605 13.36182617 21.84522461 14.08349609 21.22216797 C16.11156008 19.38142575 17.96521871 17.45769161 19.8125 15.4375 C21.99993465 13.2550143 23.29408463 12.26586922 26.1875 11 C30.70843189 11.47093041 33.0906638 14.15152814 36.1875 17.3125 C30.36121096 24.47051225 23.7492015 30.83841766 17.1875 37.3125 C18.2544812 37.33437378 18.2544812 37.33437378 19.34301758 37.35668945 C22.56256332 37.43111006 25.78106518 37.52779 29 37.625 C30.11955078 37.64755859 31.23910156 37.67011719 32.39257812 37.69335938 C33.46572266 37.72880859 34.53886719 37.76425781 35.64453125 37.80078125 C36.63428955 37.82696533 37.62404785 37.85314941 38.64379883 37.88012695 C41.55086323 38.37426373 42.42429707 39.0027431 44.1875 41.3125 C45.55702673 44.05155345 45.31371361 46.28337332 45.1875 49.3125 C44.6925 50.3025 44.6925 50.3025 44.1875 51.3125 C43.2903125 51.31660889 42.393125 51.32071777 41.46875 51.32495117 C38.10582687 51.35209253 34.74467779 51.40134123 31.38232422 51.46508789 C29.93354347 51.48813301 28.4845984 51.50263169 27.03564453 51.50805664 C15.14896842 51.40892537 15.14896842 51.40892537 5.1875 57.3125 C2.88401644 60.87918423 1.80303689 64.12684915 1.1875 68.3125 C-0.8125 67.3125 -0.8125 67.3125 -1.453125 65.421875 C-1.75476562 64.25398438 -1.75476562 64.25398438 -2.0625 63.0625 C-3.62227755 58.0902142 -5.47013261 56.14833176 -9.8125 53.3125 C-13.39726326 52.07756002 -17.00009819 52.1077831 -20.765625 51.99609375 C-21.42584656 51.97531265 -22.08606812 51.95453156 -22.76629639 51.93312073 C-24.86493015 51.86799853 -26.96368372 51.80891498 -29.0625 51.75 C-30.48959547 51.70677921 -31.91667905 51.6631638 -33.34375 51.61914062 C-36.83320722 51.51235589 -40.32279753 51.41098434 -43.8125 51.3125 C-43.89371924 49.70917209 -43.95179134 48.10465974 -44 46.5 C-44.05220703 45.16001953 -44.05220703 45.16001953 -44.10546875 43.79296875 C-43.8125 41.3125 -43.8125 41.3125 -42.6472168 39.52026367 C-40.13218078 37.86465713 -38.26875923 37.88012591 -35.26953125 37.80078125 C-34.19638672 37.76533203 -33.12324219 37.72988281 -32.01757812 37.69335938 C-30.89802734 37.67080078 -29.77847656 37.64824219 -28.625 37.625 C-27.49384766 37.59083984 -26.36269531 37.55667969 -25.19726562 37.52148438 C-22.4024426 37.43893686 -19.60793602 37.36980818 -16.8125 37.3125 C-17.36301025 36.78817383 -17.91352051 36.26384766 -18.48071289 35.72363281 C-20.95838478 33.34964568 -23.41670418 30.95653865 -25.875 28.5625 C-26.74189453 27.7375 -27.60878906 26.9125 -28.50195312 26.0625 C-29.31728516 25.26328125 -30.13261719 24.4640625 -30.97265625 23.640625 C-31.73199463 22.9074707 -32.49133301 22.17431641 -33.27368164 21.41894531 C-34.8125 19.3125 -34.8125 19.3125 -34.65795898 17.18261719 C-33.44756704 14.50528473 -32.15975123 13.08879822 -29.8125 11.3125 C-26.81429553 10.79275395 -24.76377297 10.69028196 -22.15600586 12.39599609 C-20.40137689 13.90686238 -18.75843186 15.4839972 -17.125 17.125 C-16.27325195 17.94581055 -16.27325195 17.94581055 -15.40429688 18.78320312 C-13.85830061 20.27845156 -12.3314981 21.78989321 -10.8125 23.3125 C-10.25715576 23.86768311 -9.70181152 24.42286621 -9.12963867 24.99487305 C-8.69498291 25.42968994 -8.26032715 25.86450684 -7.8125 26.3125 C-5.89235146 22.47220292 -6.87090851 17.31389429 -7.02734375 13.05273438 C-7.11372247 8.25871515 -6.88714191 5.24464254 -3.8125 1.3125 C-2.8125 0.3125 -2.8125 0.3125 0 0 Z" fill={mainColor} transform="translate(64.8125,24.6875)"/>
          <path d="M0 0 C7.26153846 0.36923077 7.26153846 0.36923077 11 3.5625 C11.66 4.366875 12.32 5.17125 13 6 C12.62602613 8.83151645 12.37410057 10.56533372 11 13 C4.13581582 17.30677575 -4.83170434 16.34172048 -12.5625 16.1875 C-14.50479492 16.16719727 -14.50479492 16.16719727 -16.48632812 16.14648438 C-19.65799214 16.1113737 -22.8287709 16.06219347 -26 16 C-26.08121924 14.39667209 -26.13929134 12.79215974 -26.1875 11.1875 C-26.22230469 10.29417969 -26.25710937 9.40085937 -26.29296875 8.48046875 C-26 6 -26 6 -24.8347168 4.20776367 C-22.31968078 2.55215713 -20.45625923 2.56762591 -17.45703125 2.48828125 C-16.38388672 2.45283203 -15.31074219 2.41738281 -14.20507812 2.38085938 C-13.08552734 2.35830078 -11.96597656 2.33574219 -10.8125 2.3125 C-9.68134766 2.27833984 -8.55019531 2.24417969 -7.38476562 2.20898438 C-4.5899426 2.12643686 -1.79543602 2.05730818 1 2 C0.67 1.34 0.34 0.68 0 0 Z" fill={mainColor} transform="translate(47,60)"/>
          <path d="M0 0 C2.5546875 1.75 2.5546875 1.75 4.875 4 C5.65617187 4.7425 6.43734375 5.485 7.2421875 6.25 C7.82226562 6.8275 8.40234375 7.405 9 8 C8.52949219 8.45246094 8.05898438 8.90492187 7.57421875 9.37109375 C5.3687605 11.65316841 4 13.78331852 4 17 C3.34 17 2.68 17 2 17 C2 17.66 2 18.32 2 19 C-1.58402695 17.46751951 -4.02850134 15.3325399 -6.8125 12.625 C-8.02873047 11.46871094 -8.02873047 11.46871094 -9.26953125 10.2890625 C-11 8 -11 8 -10.8671875 5.8515625 C-8.41813395 0.62250222 -5.61103125 -0.63809008 0 0 Z" fill={mainColor} transform="translate(41,36)"/>
          <path d="M0 0 C3.16664666 -0.02940458 6.33325747 -0.04693315 9.5 -0.0625 C10.386875 -0.07087891 11.27375 -0.07925781 12.1875 -0.08789062 C17.55823086 -0.10763596 22.68633663 0.21164107 28 1 C28 1.66 28 2.32 28 3 C26.35546875 4.078125 26.35546875 4.078125 24.1875 5.25 C20.25741805 7.61082661 18.5643711 9.58295219 17 14 C16.30092586 16.73572585 16.30092586 16.73572585 16 19 C14 18 14 18 13.359375 16.109375 C13.05773437 14.94148438 13.05773437 14.94148438 12.75 13.75 C11.16553438 8.7418147 9.40013086 6.8471435 5 4 C1.78734084 2.67649342 1.78734084 2.67649342 -1 2 C-0.67 1.34 -0.34 0.68 0 0 Z" fill={orangeAccent} transform="translate(50,74)"/>
          <path d="M0 0 C3.16664666 -0.02940458 6.33325747 -0.04693315 9.5 -0.0625 C10.386875 -0.07087891 11.27375 -0.07925781 12.1875 -0.08789062 C17.55823086 -0.10763596 22.68633663 0.21164107 28 1 C28 1.66 28 2.32 28 3 C21.73 3 15.46 3 9 3 C9.33 4.32 9.66 5.64 10 7 C9.29875 6.54625 8.5975 6.0925 7.875 5.625 C4.97015409 3.98313057 2.1860652 2.96322901 -1 2 C-0.67 1.34 -0.34 0.68 0 0 Z" fill="#B35F44" transform="translate(50,74)"/>
          <path d="M0 0 C3.96 0 7.92 0 12 0 C10.875 5.625 10.875 5.625 8 8 C5.125 6.8125 5.125 6.8125 2 5 C1.34 3.35 0.68 1.7 0 0 Z" fill={orangeAccent} transform="translate(58,76)"/>
          <path d="M0 0 C5.61 0 11.22 0 17 0 C17 0.33 17 0.66 17 1 C12.545 1.495 12.545 1.495 8 2 C8.33 3.32 8.66 4.64 9 6 C8.2575 5.525625 7.515 5.05125 6.75 4.5625 C4.38949985 3.22130673 2.63351523 2.487688 0 2 C0 1.34 0 0.68 0 0 Z" fill={orangeAccent} transform="translate(51,75)"/>
          <path d="M0 0 C0.66 0.33 1.32 0.66 2 1 C0.90344712 2.31886772 -0.20253423 3.62990057 -1.3125 4.9375 C-1.92738281 5.66839844 -2.54226562 6.39929687 -3.17578125 7.15234375 C-5 9 -5 9 -8 10 C-6.34908222 5.70761377 -3.26245434 3.1206085 0 0 Z" fill={mainColor} transform="translate(83,42)"/>
          <path d="M0 0 C3.0625 0.125 3.0625 0.125 5.0625 1.125 C4.7325 1.785 4.4025 2.445 4.0625 3.125 C3.32 2.898125 2.5775 2.67125 1.8125 2.4375 C-0.99664993 1.83023302 -0.99664993 1.83023302 -3.25 3.5625 C-3.806875 4.078125 -4.36375 4.59375 -4.9375 5.125 C-3.81691788 0.16242204 -3.81691788 0.16242204 0 0 Z" fill={mainColor} transform="translate(64.9375,24.875)"/>
          <path d="M0 0 C0.99 0.495 0.99 0.495 2 1 C2 1.99 2 2.98 2 4 C2.99 3.67 3.98 3.34 5 3 C4.67 5.31 4.34 7.62 4 10 C3.34 9.67 2.68 9.34 2 9 C1.3671875 6.93359375 1.3671875 6.93359375 0.875 4.4375 C0.70742188 3.61121094 0.53984375 2.78492187 0.3671875 1.93359375 C0.24601562 1.29550781 0.12484375 0.65742187 0 0 Z" fill={orangeAccent} transform="translate(62,83)"/>
          <path d="M0 0 C1.65 0 3.3 0 5 0 C5.33 0.66 5.66 1.32 6 2 C3.69 3.32 1.38 4.64 -1 6 C-0.67 4.02 -0.34 2.04 0 0 Z" fill={orangeAccent} transform="translate(70,76)"/>
        </svg>
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="font-title font-black text-3xl md:text-4xl tracking-tighter text-sit-daintree dark:text-white leading-none">SIT</span>
            <span className="hidden md:block text-[11px] font-mono font-bold text-sit-orange uppercase tracking-widest">Group 9</span>
          </div>
          <span className="text-[10px] md:text-[13px] font-sans font-bold text-sit-daintree/80 dark:text-sit-lightblue uppercase tracking-tight -mt-0.5">
            Shaggar Institute of Technology
          </span>
        </div>
      </div>
    );
  };

  const activePhase = useMemo(() => {
    const latest = history[history.length - 1];
    if (!latest) return { label: 'Station Idle', color: 'text-slate-400' };
    if (latest.activeWaves.p) return { label: 'Phase I: P-Wave Arrival (High Freq)', color: 'text-sit-halfbaked' };
    if (latest.activeWaves.s) return { label: 'Phase II: S-Wave Shaking (Mid Freq)', color: 'text-sit-yellow' };
    if (latest.activeWaves.surf) return { label: 'Phase III: Surface Rolling (Low Freq)', color: 'text-sit-orange' };
    return { label: 'Post-Event Monitoring', color: 'text-slate-500' };
  }, [history]);

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} transition-colors duration-300 font-sans`}>
      <div className="flex flex-col h-screen h-[100dvh] bg-sit-lightblue dark:bg-sit-daintree text-sit-daintree dark:text-sit-lightblue selection:bg-sit-orange/30 overflow-hidden">
        <header className="px-6 md:px-12 py-5 bg-white/95 dark:bg-sit-daintree/80 border-b border-sit-halfbaked/30 backdrop-blur-2xl flex justify-between items-center shrink-0 z-20 shadow-xl shadow-sit-daintree/5">
          <Logo />
          
          <div className="flex gap-4 md:gap-10 items-center">
            <div className="hidden lg:flex flex-col items-end mr-4">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${activePhase.color}`}>{activePhase.label}</span>
              <div className="h-1 w-48 bg-slate-200 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                <div className={`h-full transition-all duration-300 ${isSimulating ? 'bg-sit-orange animate-pulse' : 'bg-transparent'}`} style={{ width: '100%' }} />
              </div>
            </div>
            <button 
              onClick={toggleTheme} 
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl border-2 border-sit-halfbaked/20 hover:border-sit-orange hover:bg-sit-lightblue/50 transition-all text-sit-daintree dark:text-sit-lightblue group"
            >
              {theme === 'dark' ? <span className="text-xl">☀️</span> : <span className="text-xl">🌙</span>}
            </button>
            <div className={`flex items-center gap-3 md:gap-5 px-5 md:px-8 py-3 rounded-2xl border-2 transition-all duration-500 ${isSimulating || isReplaying ? 'bg-sit-orange/10 border-sit-orange shadow-2xl shadow-sit-orange/20' : 'bg-white dark:bg-slate-900/50 border-sit-halfbaked/40'}`}>
              <div className={`w-2.5 h-2.5 rounded-full ${isSimulating || isReplaying ? 'bg-sit-orange animate-pulse' : 'bg-sit-halfbaked'}`} />
              <span className={`text-[10px] md:text-[12px] font-title font-black uppercase tracking-[0.2em] ${isSimulating || isReplaying ? 'text-sit-orange' : 'text-sit-daintree/40 dark:text-sit-halfbaked/60'}`}>
                {isSimulating ? 'Live Feed' : isReplaying ? 'Replay' : 'Ready'}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col md:flex-row overflow-hidden p-4 md:p-10 gap-6 md:gap-12 overflow-y-auto md:overflow-hidden">
          <aside className="w-full md:w-[360px] lg:w-[420px] shrink-0 flex flex-col order-first md:order-last h-auto md:h-full">
            <Controls params={params} setParams={setParams} toggles={toggles} setToggles={setToggles} onTrigger={onTrigger} onReplay={onReplay} canReplay={!!lastEventParams.current} isSimulating={isSimulating || isReplaying} theme={theme} />
          </aside>

          <div className="flex-1 flex flex-col gap-6 md:gap-10 min-w-0 md:overflow-y-auto custom-scrollbar md:pr-4">
            <div className="grid grid-cols-1 gap-4 md:gap-8">
               <WaveformPlot label="Radial Movement (X)" data={history} dataKey="x" color={COLORS.AXIS_X} scale={1.0} theme={theme} distance={params.distance} />
               <WaveformPlot label="Transverse Movement (Y)" data={history} dataKey="y" color={COLORS.AXIS_Y} scale={1.0} theme={theme} distance={params.distance} />
               <WaveformPlot label="Vertical Movement (Z)" data={history} dataKey="z" color={COLORS.AXIS_Z} scale={1.0} theme={theme} distance={params.distance} />
            </div>

            <section className={`p-8 md:p-12 rounded-[2.5rem] border transition-all shadow-2xl ${theme === 'dark' ? 'bg-slate-900 border-sit-halfbaked/20' : 'bg-white border-sit-lightblue'}`}>
              <div className="flex items-center gap-6 mb-8 border-b border-sit-lightblue dark:border-sit-halfbaked/10 pb-6">
                <div className="w-2.5 h-10 bg-sit-orange rounded-full shadow-lg shadow-sit-orange/30" />
                <div>
                  <h3 className="font-title font-black text-lg md:text-xl uppercase tracking-widest text-sit-daintree dark:text-white">
                    SIT Group 9 Analysis
                  </h3>
                  <p className="text-[10px] text-sit-orange font-bold uppercase tracking-[0.3em] mt-1">Live Wave Identification</p>
                </div>
              </div>
              <div className="space-y-8 font-sans">
                 <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-sit-orange rounded-full animate-ping"></span>
                    <p className={`text-[11px] font-mono uppercase font-black tracking-[0.2em] italic ${activePhase.color}`}>/// {activePhase.label}</p>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-[14px] text-sit-daintree/80 dark:text-sit-lightblue/70 leading-relaxed">
                    <div className="space-y-4">
                      <h5 className="font-black text-[12px] uppercase tracking-widest text-sit-daintree dark:text-white border-b-2 border-sit-halfbaked/30 pb-2">Phase Transition</h5>
                      <p>Notice the background colors on the plot. We use these "Phase Zones" to show exactly when the energy shifts from high-frequency compressional pulses to lower-frequency shear and rolling waves.</p>
                    </div>
                    <div className="space-y-4">
                      <h5 className="font-black text-[12px] uppercase tracking-widest text-sit-daintree dark:text-white border-b-2 border-sit-halfbaked/30 pb-2">Peak Displacement</h5>
                      <p>Currently, the vertical axis (Z) is showing the most variation during {activePhase.label.includes('P-Wave') ? 'initial compression' : 'active shaking'}. Maximum station displacement reached {Math.max(sessionPeaks.current.x, sessionPeaks.current.y, sessionPeaks.current.z).toFixed(2)}μm.</p>
                    </div>
                 </div>
              </div>
            </section>
            
            <div className="w-full pb-20">
              <EducationalPanel 
                currentPoint={history[history.length - 1]} 
                history={history} 
                params={params}
                isSimulating={isSimulating || isReplaying}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
