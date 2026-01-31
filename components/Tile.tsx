import React, { useState } from 'react';
import { TileData } from '../types';
import { TYPE_PASTELS } from '../constants';
import { motion } from 'framer-motion';

interface TileProps {
  tile: TileData;
  isSelected: boolean;
  isDragging: boolean;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
}

const Tile: React.FC<TileProps> = React.memo(({ tile, isSelected, isDragging, onPointerDown }) => {
  const [imgError, setImgError] = useState(false);
  
  const isRock = tile.status === 'rock';
  const isSteel = tile.status === 'steel';
  const isFrozen = tile.status === 'ice';
  const typeStyle = !isRock && !isSteel ? (TYPE_PASTELS[tile.type] || 'bg-slate-700') : '';

  // Configuración del "Motor de Física" - CAÍDA AÚN MÁS LENTA
  // Stiffness reducido drásticamente (70) para una caída más lenta visualmente
  // Damping aumentado (30) para evitar rebotes excesivos con la baja velocidad
  // Mass aumentado (1.5) para dar sensación de peso
  const springConfig = {
    type: "spring" as const,
    stiffness: 70,  
    damping: 15,    
    mass: 1       
  };

  return (
    <motion.div
      onPointerDown={(e) => onPointerDown(e, tile.id)}
      
      // Initial state: IMPORTANTE incluir la X para que caiga recto en su columna
      initial={tile.id.startsWith('spawn') ? { 
          x: `${tile.x * 100}%`, 
          y: '-150%', 
          opacity: 0 
      } : false}
      
      // The Physics Target: Where should the tile be?
      animate={{
        x: `${tile.x * 100}%`,
        y: `${tile.y * 100}%`,
        scale: tile.isMatched ? 0 : (isSelected ? 1.1 : 1),
        opacity: isDragging ? 0 : (tile.isMatched ? 0 : 1),
        rotate: tile.isMatched ? 180 : 0, 
        filter: tile.isMatched ? 'brightness(2)' : 'brightness(1)',
      }}
      
      // Apply the physics config
      transition={springConfig}

      style={{
        width: '16.666%', 
        height: '16.666%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: isDragging ? 100 : (tile.isMatched ? 50 : 10),
      }}
      
      draggable={false}
      className={`
        p-1 touch-none select-none
        will-change-transform
      `}
    >
      <div
        className={`
          w-full h-full flex items-center justify-center 
          text-3xl sm:text-4xl md:text-5xl 
          rounded-xl border-[3px] relative overflow-hidden
          cursor-grab active:cursor-grabbing
          ${isSelected 
            ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]' 
            : 'hover:brightness-110 shadow-sm'
          }
          ${isRock ? 'bg-stone-700 border-stone-500 shadow-inner' : 
            isSteel ? 'bg-slate-800 border-slate-400 shadow-inner' : 
            isFrozen ? 'border-cyan-300/80 bg-cyan-50/10' :
            typeStyle}
        `}
      >
        {isRock ? (
             <div className="relative w-full h-full flex items-center justify-center">
                 <span className="text-4xl filter grayscale contrast-125">🪨</span>
             </div>
        ) : isSteel ? (
             <div className="flex flex-col items-center justify-center w-full h-full bg-slate-800 relative">
                 <div className="absolute inset-0 border-4 border-slate-500 opacity-50 rounded-xl"></div>
                 <div className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center border border-slate-500 z-10">
                    <span className="text-[10px] font-bold text-white">{tile.statusLife}</span>
                 </div>
             </div>
        ) : (
             <>
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                    {tile.image && !imgError ? (
                        <img 
                            src={tile.image} 
                            alt={tile.emoji} 
                            className="w-full h-full object-contain p-0.5 select-none" 
                            draggable={false}
                            onDragStart={(e) => e.preventDefault()} 
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <span className="select-none">{tile.emoji}</span>
                    )}
                </div>
                {isFrozen && (
                    <div className="absolute inset-0 rounded-xl z-20 pointer-events-none bg-cyan-400/20 backdrop-blur-[1px] border-2 border-white/40"></div>
                )}
             </>
        )}
      </div>
    </motion.div>
  );
});

export default Tile;