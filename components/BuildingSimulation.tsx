
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { DataPoint } from '../types';

interface BuildingSimulationProps {
  currentPoint: DataPoint | undefined;
  exaggeration: number;
  isSimulating: boolean;
  magnitude: number;
  collapseThreshold: number;
}

const BuildingSimulation: React.FC<BuildingSimulationProps> = ({ currentPoint, exaggeration, isSimulating, magnitude, collapseThreshold }) => {
  const [isDestroyed, setIsDestroyed] = useState(false);
  const [destructionSeed, setDestructionSeed] = useState<{x: number, y: number, z: number, rx: number, ry: number}[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Interaction state
  const [rotation, setRotation] = useState({ x: -22, y: 38 });
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;
    
    setRotation(prev => ({
      x: Math.max(-65, Math.min(5, prev.x - deltaY * 0.4)),
      y: prev.y + deltaX * 0.4
    }));
    
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => setIsDragging(false);

  const softClamp = (val: number, limit: number) => {
    return (val * limit) / (limit + Math.abs(val));
  };

  const totalMove = Math.abs(currentPoint?.x || 0) + Math.abs(currentPoint?.y || 0) + Math.abs(currentPoint?.z || 0);
  const stressFactor = Math.min(1, (totalMove * exaggeration) / 2);

  useEffect(() => {
    if (!isSimulating) return;
    
    // Destruction logic based on user-defined threshold and relative motion
    const structuralFatigue = (totalMove * exaggeration);
    if (magnitude > collapseThreshold || (structuralFatigue > 1.25 && magnitude > (collapseThreshold * 0.8))) {
      if (!isDestroyed) {
        setIsDestroyed(true);
        setDestructionSeed(Array.from({ length: 90 }, () => ({
          x: (Math.random() - 0.5) * 1100,
          y: 600 + Math.random() * 600,
          z: (Math.random() - 0.5) * 600,
          rx: Math.random() * 2000,
          ry: Math.random() * 2000
        })));
      }
    }
  }, [currentPoint, magnitude, isDestroyed, isSimulating, totalMove, collapseThreshold, exaggeration]);

  useEffect(() => {
    if (isSimulating && currentPoint && currentPoint.relativeTime < 0.2) {
      setIsDestroyed(false);
      setDestructionSeed([]);
    }
  }, [isSimulating, currentPoint]);

  const hasMovement = isSimulating && currentPoint && currentPoint.relativeTime > 0 && !isDestroyed;
  
  const rawSwayX = hasMovement ? (currentPoint?.x || 0) * exaggeration * 30 : 0;
  const rawSwayY = hasMovement ? (currentPoint?.y || 0) * exaggeration * 30 : 0;
  const rawSwayZ = hasMovement ? (currentPoint?.z || 0) * exaggeration * 14 : 0;

  const swayX = softClamp(rawSwayX, 140);
  const swayY = softClamp(rawSwayY, 120);
  const swayZ = softClamp(rawSwayZ, 55);

  const buildingParts = useMemo(() => {
    const wallColor = 'rgba(234, 228, 210, 0.95)'; 
    const columnColor = '#D1CDC1';
    const floorColor = '#475569';
    const roofBlue = '#005b96'; // Deep blue as requested
    const roofBlueDark = '#003d66';
    
    // Hip Roof Geometry constants
    const roofBaseWidth = 168;
    const roofBaseDepth = 168;
    const peakHeight = 48;
    const metalTexture = `repeating-linear-gradient(90deg, ${roofBlue}, ${roofBlue} 6px, ${roofBlueDark} 7px)`;

    // Helper to calculate Y position on the slope for details
    // Assuming slope goes from edge (0 height) to center (peakHeight)
    const getYAtOffset = (zOffset: number) => {
        const normalizedDist = Math.abs(zOffset) / (roofBaseDepth / 2);
        return 200 + (1 - normalizedDist) * peakHeight;
    };

    const parts = [
      // Base Plinth
      { id: 'foundation', type: 'structure', style: { width: '230px', height: '20px', bottom: '-20px', background: 'linear-gradient(to bottom, #334155, #0f172a)', transform: 'rotateX(0deg)' } },
      
      // Structural Columns (C1)
      { id: 'c1-fl', type: 'column', style: { width: '12px', height: '100px', bottom: '0', transform: 'translateX(-74px) translateZ(74px)', background: columnColor } },
      { id: 'c1-fr', type: 'column', style: { width: '12px', height: '100px', bottom: '0', transform: 'translateX(74px) translateZ(74px)', background: columnColor } },
      { id: 'c1-bl', type: 'column', style: { width: '12px', height: '100px', bottom: '0', transform: 'translateX(-74px) translateZ(-74px)', background: columnColor } },
      { id: 'c1-br', type: 'column', style: { width: '12px', height: '100px', bottom: '0', transform: 'translateX(74px) translateZ(-74px)', background: columnColor } },

      // Walls (S1)
      { id: 's1-f', type: 'wall', style: { width: '150px', height: '100px', bottom: '0', transform: 'translateZ(75px)', background: wallColor } },
      { id: 's1-b', type: 'wall', style: { width: '150px', height: '100px', bottom: '0', transform: 'translateZ(-75px) rotateY(180deg)', background: wallColor } },
      { id: 's1-l', type: 'wall', style: { width: '150px', height: '100px', bottom: '0', transform: 'translateX(-75px) rotateY(-90deg)', background: wallColor } },
      { id: 's1-r', type: 'wall', style: { width: '150px', height: '100px', bottom: '0', transform: 'translateX(75px) rotateY(90deg)', background: wallColor } },
      
      // Floor Slab
      { id: 'floor-slab', type: 'structure', style: { width: '155px', height: '155px', bottom: '100px', transform: 'translateY(5px) rotateX(90deg)', background: floorColor } },

      // Structural Columns (C2)
      { id: 'c2-fl', type: 'column', style: { width: '12px', height: '100px', bottom: '100px', transform: 'translateX(-74px) translateZ(74px)', background: columnColor } },
      { id: 'c2-fr', type: 'column', style: { width: '12px', height: '100px', bottom: '100px', transform: 'translateX(74px) translateZ(74px)', background: columnColor } },
      { id: 'c2-bl', type: 'column', style: { width: '12px', height: '100px', bottom: '100px', transform: 'translateX(-74px) translateZ(-74px)', background: columnColor } },
      { id: 'c2-br', type: 'column', style: { width: '12px', height: '100px', bottom: '100px', transform: 'translateX(74px) translateZ(-74px)', background: columnColor } },

      // Walls (S2)
      { id: 's2-f', type: 'wall', style: { width: '150px', height: '100px', bottom: '100px', transform: 'translateZ(75px)', background: wallColor } },
      { id: 's2-b', type: 'wall', style: { width: '150px', height: '100px', bottom: '100px', transform: 'translateZ(-75px) rotateY(180deg)', background: wallColor } },
      { id: 's2-l', type: 'wall', style: { width: '150px', height: '100px', bottom: '100px', transform: 'translateX(-75px) rotateY(-90deg)', background: wallColor } },
      { id: 's2-r', type: 'wall', style: { width: '150px', height: '100px', bottom: '100px', transform: 'translateX(75px) rotateY(90deg)', background: wallColor } },
      
      // --- FULLY CLOSED HIP ROOF (ALL SIDES BLUE METAL) ---
      // Front Sloped Panel (Trapezoid)
      { id: 'roof-front', type: 'roof', style: { width: `${roofBaseWidth}px`, height: '82px', bottom: '200px', transformOrigin: 'bottom', transform: 'translateZ(84px) rotateX(-35deg)', background: metalTexture, clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)', border: '1px solid rgba(0,0,0,0.2)' } },
      // Back Sloped Panel (Trapezoid)
      { id: 'roof-back', type: 'roof', style: { width: `${roofBaseWidth}px`, height: '82px', bottom: '200px', transformOrigin: 'bottom', transform: 'translateZ(-84px) rotateX(35deg)', background: metalTexture, clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)', border: '1px solid rgba(0,0,0,0.2)' } },
      // Left Sloped Panel (Triangle)
      { id: 'roof-left', type: 'roof', style: { width: `${roofBaseDepth}px`, height: '82px', bottom: '200px', transformOrigin: 'bottom', transform: 'translateX(-84px) rotateY(-90deg) rotateX(-35deg)', background: metalTexture, clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)', border: '1px solid rgba(0,0,0,0.2)' } },
      // Right Sloped Panel (Triangle)
      { id: 'roof-right', type: 'roof', style: { width: `${roofBaseDepth}px`, height: '82px', bottom: '200px', transformOrigin: 'bottom', transform: 'translateX(84px) rotateY(90deg) rotateX(-35deg)', background: metalTexture, clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)', border: '1px solid rgba(0,0,0,0.2)' } },
      // Top Ridge Seal
      { id: 'roof-ridge-seal', type: 'roof', style: { width: '68px', height: '6px', bottom: `${200 + peakHeight}px`, transform: 'translateY(-3px)', background: roofBlueDark, borderRadius: '3px', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' } },

      // --- ROOFTOP DETAILS (SITTING ON SLOPES) ---
      // Access Hatch (Back Slope)
      { id: 'hatch', type: 'detail', style: { width: '28px', height: '28px', bottom: `${getYAtOffset(-25) + 2}px`, transform: 'translateX(-35px) translateZ(-25px) rotateX(90deg) rotateX(-12deg)', background: '#1a202c', border: '2px solid #2d3748' } },
      // Industrial Vent Stack (Front Slope)
      { id: 'vent-a', type: 'vent', style: { width: '10px', height: '35px', bottom: `${getYAtOffset(15)}px`, transform: 'translateX(40px) translateZ(15px)', background: '#4a5568', border: '1px solid #2d3748' } },
      { id: 'vent-a-cap', type: 'vent', style: { width: '14px', height: '5px', bottom: `${getYAtOffset(15) + 35}px`, transform: 'translateX(40px) translateZ(15px)', background: '#1a202c' } },
      // Secondary Small Vent (Back-Right Slope)
      { id: 'vent-b', type: 'vent', style: { width: '8px', height: '20px', bottom: `${getYAtOffset(-45)}px`, transform: 'translateX(10px) translateZ(-45px)', background: '#4a5568' } },
      // Satellite System (Front-Left Slope)
      { id: 'dish-base', type: 'dish-detail', style: { width: '4px', height: '30px', bottom: `${getYAtOffset(40)}px`, transform: 'translateX(-40px) translateZ(40px)', background: '#718096' } },
      { id: 'dish-main', type: 'dish', style: { width: '40px', height: '40px', bottom: `${getYAtOffset(40) + 30}px`, transform: 'translateX(-42px) translateZ(42px) rotateX(45deg) rotateY(-15deg)', background: 'radial-gradient(circle, #f7fafc, #cbd5e0)', borderRadius: '50%', border: '1px solid #a0aec0', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)' } }
    ];
    return parts;
  }, []);

  const getShatterStyle = (index: number) => {
    if (!isDestroyed) return {};
    const seed = destructionSeed[index % destructionSeed.length] || { x: 0, y: 0, z: 0, rx: 0, ry: 0 };
    return {
      transform: `translate3d(${seed.x}px, ${seed.y}px, ${seed.z}px) rotateX(${seed.rx}deg) rotateY(${seed.ry}deg)`,
      opacity: 0,
      scale: 0.1,
      transition: 'all 3.8s cubic-bezier(0.1, 0, 0, 1)'
    };
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current.requestFullscreen();
  };

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-sit-lightblue/50 to-white dark:from-sit-daintree dark:to-slate-950 rounded-[3rem] border-2 border-sit-lightblue dark:border-sit-halfbaked/10 overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing group transition-all duration-300"
      style={{ perspective: '2400px' }}
    >
      <button 
        onClick={toggleFullscreen}
        className="absolute top-8 right-8 z-50 w-12 h-12 flex items-center justify-center bg-white/90 dark:bg-slate-800/90 backdrop-blur shadow rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-sit-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
        </svg>
      </button>

      {/* Ground Plane Overlay */}
      <div 
        className="absolute w-[1400px] h-[1400px] bg-slate-400/10 dark:bg-slate-800/20 rounded-full blur-[120px] pointer-events-none" 
        style={{ transform: `rotateX(${90 + rotation.x}deg) rotateZ(${rotation.y}deg) translateZ(-200px)` }} 
      />

      <div 
        className="absolute w-[600px] h-[600px] border-[4px] border-sit-halfbaked/30 rounded-[4rem] bg-sit-lightblue/5 shadow-inner"
        style={{ 
          transform: `rotateX(${90 + rotation.x}deg) rotateZ(${rotation.y}deg) translateZ(-180px) translateX(${swayX}px) translateY(${swayY}px)`,
          backgroundImage: 'linear-gradient(rgba(138,196,199,0.1) 2px, transparent 2px), linear-gradient(90deg, rgba(138,196,199,0.1) 2px, transparent 2px)',
          backgroundSize: '50px 50px',
          transition: hasMovement ? 'none' : 'transform 0.8s cubic-bezier(0.1, 0.9, 0.2, 1)'
        }}
      >
        {!isDestroyed && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-black/15 blur-3xl rounded-2xl" />
        )}
      </div>
      
      <div 
        className="relative w-48 h-64" 
        style={{ 
          transformStyle: 'preserve-3d', 
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateY(140px) translateX(${swayX}px) translateZ(${swayY}px) rotateZ(${swayX * 0.012}deg)`,
          transition: hasMovement ? 'none' : 'transform 1.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
      >
        {buildingParts.map((part, i) => {
          const isStressed = isSimulating && (part.type === 'column' || part.type === 'roof');
          const dynamicColor = isStressed 
            ? `rgb(${150 + 105 * stressFactor}, ${150 - 100 * stressFactor}, ${150 - 100 * stressFactor})`
            : part.style.background;

          return (
            <div 
              key={part.id}
              className={`absolute flex items-center justify-center ${isDestroyed ? 'pointer-events-none' : ''}`}
              style={{ 
                ...part.style, 
                ...getShatterStyle(i),
                background: (part.type === 'column') ? dynamicColor : part.style.background,
                boxShadow: !isDestroyed && (part.type === 'wall' || part.type === 'column') ? 'inset 0 0 10px rgba(0,0,0,0.1)' : 'none',
                left: '50%',
                marginLeft: `-${parseInt(part.style.width || '0') / 2}px`,
                transition: isDestroyed ? getShatterStyle(i).transition : 'background 0.2s linear, all 0.1s linear'
              }}
            >
              {part.type === 'wall' && (
                <div className="w-full h-full p-4 grid grid-cols-2 grid-rows-2 gap-4 border border-black/5">
                  {[1, 2, 3, 4].map(w => (
                    <div key={w} className="bg-slate-950 border-[2px] border-slate-300/30 shadow relative overflow-hidden">
                      <div className="absolute inset-0 bg-blue-500/5" />
                      <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent" />
                    </div>
                  ))}
                </div>
              )}
              
              {part.type === 'column' && <div className="absolute inset-0 border-x border-black/5" />}
              
              {part.type === 'dish' && (
                <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden">
                  <div className="w-4 h-4 bg-slate-600 rounded-full" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isDestroyed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-50 animate-in fade-in zoom-in-95 duration-1000">
           <div className="bg-sit-orange/95 text-white px-12 py-6 rounded-[3rem] font-black uppercase tracking-[0.3em] text-sm shadow-xl border-2 border-white/20 backdrop-blur-xl mb-8 flex flex-col items-center">
              <span>Structural Failure</span>
           </div>
           <button 
              onClick={(e) => { e.stopPropagation(); setIsDestroyed(false); setDestructionSeed([]); }}
              className="pointer-events-auto px-10 py-4 bg-white/10 hover:bg-white/20 backdrop-blur text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl border border-white/20 transition-all active:scale-95 shadow-lg"
           >
             Reset Model
           </button>
        </div>
      )}

      {/* Simplified HUD */}
      <div className="absolute bottom-10 left-10 flex items-center gap-4 pointer-events-none">
         <div className="bg-white/90 dark:bg-slate-900/90 px-6 py-3 rounded-2xl border border-sit-lightblue shadow backdrop-blur">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${isSimulating ? 'bg-sit-orange animate-ping' : 'bg-slate-400'}`} />
              <span className="text-[12px] font-black text-sit-daintree dark:text-sit-lightblue uppercase tracking-widest">
                {isSimulating ? 'Live Feed' : 'Idle'}
              </span>
            </div>
         </div>
      </div>
      
      <div className="absolute bottom-10 right-10 text-right pointer-events-none opacity-40">
        <p className="text-[10px] font-black text-sit-orange uppercase tracking-widest">SIT SEISMOLOGY</p>
      </div>
    </div>
  );
};

export default BuildingSimulation;
