import React, { useState, useRef } from 'react';
import { Boss } from '../types';
import { ChevronRight } from 'lucide-react';
import { soundManager } from '../utils/sound';
import { getLevelBackground, TYPE_PASTELS } from '../constants';

interface TeamSelectorProps {
    collection: Boss[];
    currentTeam: Boss[];
    onUpdateTeam: (newTeam: Boss[]) => void;
    onStart: () => void;
    nextLevel: number;
    nextEnemy: Boss;
    movesLeft: number; 
}

const TeamSelector: React.FC<TeamSelectorProps> = ({ collection, currentTeam, onUpdateTeam, onStart, nextLevel, nextEnemy, movesLeft }) => {
    const [hoveredMonster, setHoveredMonster] = useState<Boss | null>(null);
    const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
    
    // Custom Touch Drag State
    const [dragMonster, setDragMonster] = useState<Boss | null>(null);
    const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    
    // Hold timer for mobile drag
    const holdTimerRef = useRef<number | null>(null);
    const touchStartPosRef = useRef({ x: 0, y: 0 });

    const isTeamValid = currentTeam.length === 4;

    const handleImageError = (id: string) => {
        setImgErrors(prev => ({ ...prev, [id]: true }));
    };

    // --- DESKTOP DND HANDLERS ---
    const handleDragStart = (e: React.DragEvent, monster: Boss) => {
        e.dataTransfer.setData('monsterId', monster.id);
    };

    const handleDrop = (e: React.DragEvent, slotIndex: number) => {
        e.preventDefault();
        const monsterId = e.dataTransfer.getData('monsterId');
        if (monsterId) {
             const monster = collection.find(m => m.id === monsterId);
             if (monster) equipMonster(monster, slotIndex);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    // --- MOBILE TOUCH HANDLERS (HOLD TO DRAG) ---
    const handleTouchStart = (e: React.TouchEvent, monster: Boss) => {
        const touch = e.touches[0];
        touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
        
        // Start Timer: If held for 300ms without moving, start drag
        holdTimerRef.current = window.setTimeout(() => {
            setDragMonster(monster);
            setDragPos({ x: touch.clientX, y: touch.clientY });
            soundManager.playButton(); // Feedback
            // Prevent native scroll loop via state if possible, but touch-action CSS handles usually
        }, 300);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        
        if (!dragMonster) {
            // Check if moved significantly to cancel hold
            const dist = Math.hypot(touch.clientX - touchStartPosRef.current.x, touch.clientY - touchStartPosRef.current.y);
            if (dist > 10) {
                if (holdTimerRef.current) {
                    clearTimeout(holdTimerRef.current);
                    holdTimerRef.current = null;
                }
            }
        } else {
            // We are dragging, update ghost
            if (e.cancelable) e.preventDefault(); // Stop scroll
            setDragPos({ x: touch.clientX, y: touch.clientY });
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
        }

        if (dragMonster) {
            const touch = e.changedTouches[0];
            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            
            // Find if we dropped on a slot
            const slotElement = target?.closest('[data-slot-index]');
            if (slotElement) {
                const index = parseInt(slotElement.getAttribute('data-slot-index') || '-1');
                if (index >= 0) {
                    equipMonster(dragMonster, index);
                    soundManager.playSwap();
                }
            }
            setDragMonster(null);
        }
    };

    // --- SHARED LOGIC ---
    const equipMonster = (monster: Boss, slotIndex: number) => {
        const newTeam = [...currentTeam];
        const existingIdx = newTeam.findIndex(m => m.id === monster.id);
        if (existingIdx >= 0) {
             newTeam[existingIdx] = newTeam[slotIndex]; 
        }
        
        const slots = [0,1,2,3].map(i => currentTeam[i] || null);
        slots[slotIndex] = monster;
        
        const uniqueTeam: Boss[] = [];
        const seen = new Set();
        slots.forEach(m => {
            if (m && !seen.has(m.id)) {
                uniqueTeam.push(m);
                seen.add(m.id);
            }
        });
        onUpdateTeam(uniqueTeam);
    };

    return (
        <div className={`absolute inset-0 z-50 flex flex-col items-center pt-8 pb-4 px-4 overflow-hidden transition-all duration-1000 ${getLevelBackground(nextLevel, nextEnemy.type)}`}>
            {/* Lighter overlay */}
            <div className="absolute inset-0 bg-slate-900/40 pointer-events-none"></div>

            <div className="relative z-10 w-full flex flex-col items-center flex-1 overflow-hidden">
                <h1 className="text-3xl font-black text-white italic mb-2 uppercase tracking-widest drop-shadow-md">
                    Fase {nextLevel}
                </h1>
                
                {/* VS Panel */}
                <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-md rounded-2xl p-4 border border-slate-600 flex items-center gap-4 mb-2 shadow-xl">
                    <div className="flex-1 text-right">
                        <span className="text-xs text-red-400 font-bold uppercase block">Enemigo</span>
                        <span className="text-xl font-bold text-white">{nextEnemy.name}</span>
                        <span className="text-xs text-slate-400 block">HP: {nextEnemy.maxHp}</span>
                    </div>
                    <div className="w-16 h-16 flex items-center justify-center filter drop-shadow-lg animate-bounce">
                        {nextEnemy.image && !imgErrors[nextEnemy.id] ? (
                            <img 
                                src={nextEnemy.image} 
                                alt={nextEnemy.emoji} 
                                className="w-full h-full object-contain" 
                                onError={() => handleImageError(nextEnemy.id)}
                            />
                        ) : (
                            <span className="text-5xl">{nextEnemy.emoji}</span>
                        )}
                    </div>
                    <div className="flex-1">
                        <span className="bg-slate-900 text-xs px-2 py-1 rounded text-slate-300 border border-slate-700 font-bold uppercase">
                            Tipo: {nextEnemy.type}
                        </span>
                    </div>
                </div>

                {/* Moves Info */}
                <div className="mb-4 bg-black/40 px-4 py-1.5 rounded-full text-xs text-slate-300 font-mono border border-white/10 shadow-lg">
                    TURNOS DISPONIBLES: <span className="text-white font-bold text-base ml-1">{movesLeft}</span>
                </div>

                {/* Info Box */}
                <div className="h-12 w-full max-w-md flex items-center justify-center mb-2">
                    {hoveredMonster && (
                        <div className="bg-slate-800/90 px-4 py-2 rounded-xl border border-yellow-500/50 text-center animate-in fade-in zoom-in duration-200 shadow-xl backdrop-blur-sm">
                            <span className="text-yellow-400 font-bold text-xs block">{hoveredMonster.skillName}</span>
                            <span className="text-slate-300 text-[10px]">{hoveredMonster.skillDescription}</span>
                        </div>
                    )}
                </div>

                {/* Active Team Slots */}
                <div className="w-full max-w-md mb-4">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-white uppercase drop-shadow">Tu Equipo</span>
                        <button 
                            onClick={() => { soundManager.playButton(); onStart(); }}
                            disabled={!isTeamValid}
                            className={`
                                px-6 py-2 rounded-full font-bold flex items-center gap-2 transition-all shadow-xl
                                ${isTeamValid ? 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white transform hover:scale-105' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}
                            `}
                        >
                            ¡A Luchar! <ChevronRight size={18} />
                        </button>
                    </div>
                    <div className="flex gap-2 h-24">
                        {[0, 1, 2, 3].map(idx => {
                            const member = currentTeam[idx];
                            return (
                                <div 
                                    key={idx} 
                                    data-slot-index={idx} // Needed for touch drop detection
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, idx)}
                                    className="flex-1 bg-slate-800/80 backdrop-blur-sm rounded-xl border-2 border-dashed border-slate-600 flex items-center justify-center relative overflow-hidden group transition-all hover:border-indigo-400 shadow-inner"
                                >
                                    {member ? (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-900/40">
                                            <div className="w-10 h-10 mb-1 flex items-center justify-center filter drop-shadow-md">
                                                {member.image && !imgErrors[member.id] ? (
                                                    <img 
                                                        src={member.image} 
                                                        alt={member.emoji} 
                                                        className="w-full h-full object-contain" 
                                                        onError={() => handleImageError(member.id)}
                                                    />
                                                ) : (
                                                    <span className="text-3xl">{member.emoji}</span>
                                                )}
                                            </div>
                                            <div className="text-[10px] font-bold text-indigo-200 truncate w-full text-center px-1">{member.name}</div>
                                            <div className="absolute top-1 right-1 px-1 rounded-sm bg-black/40 flex items-center justify-center text-[7px] text-white">
                                                {member.type}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-slate-500 font-bold text-xs opacity-50">VACÍO</span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Collection */}
                <div className="flex-1 w-full max-w-md bg-white/10 backdrop-blur-xl rounded-t-3xl border-t border-white/20 p-4 overflow-hidden flex flex-col shadow-2xl">
                    <span className="text-xs text-white font-bold uppercase mb-2 block text-center tracking-widest text-shadow">MONSTEMOJIS DISPONIBLES</span>
                    <div 
                        ref={scrollContainerRef}
                        className="flex-1 overflow-y-auto grid grid-cols-4 gap-2 content-start pb-20 no-scrollbar touch-pan-y"
                    >
                        {collection.map(monster => {
                            const isSelected = currentTeam.find(m => m.id === monster.id);
                            const bgColor = TYPE_PASTELS[monster.type] || 'bg-slate-800 border-slate-700';
                            
                            return (
                                <div
                                    key={monster.id}
                                    draggable={true}
                                    onDragStart={(e) => handleDragStart(e, monster)}
                                    
                                    // Touch handlers
                                    onTouchStart={(e) => handleTouchStart(e, monster)}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                    
                                    onMouseEnter={() => setHoveredMonster(monster)}
                                    onMouseLeave={() => setHoveredMonster(null)}
                                    className={`
                                        aspect-square rounded-xl flex flex-col items-center justify-center border-2 relative cursor-grab active:cursor-grabbing transition-transform select-none
                                        ${bgColor}
                                        ${isSelected 
                                            ? 'opacity-40 grayscale scale-95' 
                                            : 'hover:scale-105 shadow-md'
                                        }
                                    `}
                                >
                                    <div className="w-10 h-10 mb-1 flex items-center justify-center filter drop-shadow-sm">
                                        {monster.image && !imgErrors[monster.id] ? (
                                            <img 
                                                src={monster.image} 
                                                alt={monster.emoji} 
                                                className="w-full h-full object-contain" 
                                                onError={() => handleImageError(monster.id)}
                                            />
                                        ) : (
                                            <span className="text-3xl">{monster.emoji}</span>
                                        )}
                                    </div>
                                    <div className="text-[9px] font-bold text-slate-800 truncate w-full text-center bg-white/50 rounded px-1">{monster.name}</div>
                                    <div className="absolute top-1 right-1 px-1 rounded-sm bg-black/40 flex items-center justify-center text-[7px] text-white">
                                        {monster.type}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Mobile Drag Ghost Element */}
            {dragMonster && (
                <div 
                    className="fixed w-24 h-24 rounded-full bg-indigo-600/90 backdrop-blur border-4 border-white z-[100] flex items-center justify-center pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-bounce"
                    style={{ left: dragPos.x, top: dragPos.y }}
                >
                     {dragMonster.image && !imgErrors[dragMonster.id] ? (
                        <img src={dragMonster.image} alt={dragMonster.emoji} className="w-16 h-16 object-contain" />
                    ) : (
                        <span className="text-5xl">{dragMonster.emoji}</span>
                    )}
                </div>
            )}

            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .text-shadow {
                    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                }
            `}</style>
        </div>
    );
};

export default TeamSelector;