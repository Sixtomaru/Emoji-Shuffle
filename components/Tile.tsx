import React, { useState } from 'react';
import { TileData } from '../types';
import { Lock, Snowflake, Box } from 'lucide-react';
import { TYPE_PASTELS } from '../constants';

interface TileProps {
  tile: TileData;
  isSelected: boolean;
  isDragging: boolean;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  style?: React.CSSProperties;
}

const Tile: React.FC<TileProps> = ({ tile, isSelected, isDragging, onPointerDown, style }) => {
  const [imgError, setImgError] = useState(false);
  
  const isNew = tile.id.startsWith('new');
  const isMod = tile.id.endsWith('_mod'); 

  // PERFORMANCE: Use translate3d for GPU acceleration and will-change to hint the browser
  const dynamicStyle = {
    ...style,
    '--tx': `${tile.x * 100}%`,
    '--ty': `${tile.y * 100}%`,
    transform: `translate3d(${tile.x * 100}%, ${tile.y * 100}%, 0)`,
    willChange: 'transform', // Critical for mobile performance
  } as React.CSSProperties;

  const isFrozen = tile.status === 'ice';
  const isRock = tile.status === 'rock';
  const isSteel = tile.status === 'steel';
  
  const typeStyle = !isRock && !isSteel ? (TYPE_PASTELS[tile.type] || 'bg-slate-700') : '';

  return (
    <div
      onPointerDown={(e) => {
          if (isRock || isSteel || isFrozen) return;
          onPointerDown(e, tile.id);
      }}
      style={dynamicStyle}
      className={`
        absolute top-0 left-0 w-[16.666%] h-[16.666%] p-1
        touch-none transition-transform duration-500 ease-out
        ${isDragging ? 'z-50 opacity-0' : isSelected ? 'z-20' : 'z-10'}
        ${isNew ? 'animate-drop-in' : ''}
        ${isMod ? 'animate-zoom-pop' : ''}
        ${(isRock || isSteel || isFrozen) ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
      `}
    >
      <div
        className={`
          w-full h-full flex items-center justify-center 
          text-3xl sm:text-4xl md:text-5xl 
          rounded-xl border-[3px] relative overflow-hidden transition-all
          ${isSelected 
            ? 'border-yellow-400 scale-110 brightness-110 shadow-[0_0_15px_rgba(250,204,21,0.6)] z-30' 
            : 'hover:brightness-110 shadow-sm'
          }
          ${isRock ? 'bg-stone-700 border-stone-500 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]' : 
            isSteel ? 'bg-slate-800 border-slate-400 shadow-[inset_0_0_15px_rgba(255,255,255,0.1)]' : 
            typeStyle}
          ${tile.isMatched ? 'animate-implode' : ''}
          ${isFrozen ? 'ring-2 ring-cyan-300/50' : ''}
        `}
      >
        {/* Obstacles / Emojis */}
        {isRock ? (
             <div className="relative w-full h-full flex items-center justify-center">
                 <span className="text-4xl filter grayscale contrast-125">🪨</span>
                 <div className="absolute inset-0 bg-black/10 rounded-xl"></div>
             </div>
        ) : isSteel ? (
             <div className="flex flex-col items-center justify-center w-full h-full bg-slate-800 relative">
                 <div className="absolute inset-0 border-4 border-slate-500 opacity-50 rounded-xl"></div>
                 <div className="absolute inset-2 border-2 border-slate-600 rounded"></div>
                 <div className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center border border-slate-500 z-10">
                    <span className="text-[10px] font-bold text-white">{tile.statusLife}</span>
                 </div>
                 {/* Shiny glare */}
                 <div className="absolute -top-4 -left-4 w-12 h-20 bg-white/10 rotate-45 blur-md"></div>
             </div>
        ) : (
             <>
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                    {tile.image && !imgError ? (
                        <img 
                            src={tile.image} 
                            alt={tile.emoji} 
                            className="w-full h-full object-contain p-0.5" 
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        /* Removed drop-shadow filter on emojis for performance */
                        tile.emoji
                    )}
                </div>
                {isFrozen && (
                    <div className="absolute inset-0 bg-cyan-100/10 flex items-center justify-center border border-white/20 rounded-lg z-20">
                        <Snowflake className="text-white/60 drop-shadow-md" size={24} strokeWidth={2} />
                        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/10 to-transparent"></div>
                    </div>
                )}
             </>
        )}
      </div>
    </div>
  );
};

export default Tile;