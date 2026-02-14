import React, { useState, useRef } from 'react';
import { Boss } from '../types';
import { TYPE_VIVID } from '../constants';
import { Zap } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface SkillBarProps {
    team: Boss[];
    charges: Record<string, number>;
    onUseSkill: (monster: Boss) => void;
    disabled: boolean;
}

const SkillBar: React.FC<SkillBarProps> = ({ team, charges, onUseSkill, disabled }) => {
    const [infoMonster, setInfoMonster] = useState<Boss | null>(null);
    const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLongPress = useRef(false);

    const handlePointerDown = (e: React.PointerEvent, monster: Boss) => {
        if (disabled && !charges) return;
        
        // Prevent default browser actions (scrolling, selecting)
        e.preventDefault();
        
        // Clear previous states
        if (pressTimer.current) clearTimeout(pressTimer.current);
        setInfoMonster(null); 
        isLongPress.current = false;

        pressTimer.current = setTimeout(() => {
            isLongPress.current = true;
            setInfoMonster(monster);
            soundManager.playButton();
        }, 150); // Reduced to 150ms for snappier response
    };

    const handlePointerUp = (e: React.PointerEvent, monster: Boss) => {
        e.preventDefault();
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }

        if (!isLongPress.current) {
            // Short tap: Try to use skill
            const currentCharge = charges[monster.id] || 0;
            if (!disabled && currentCharge >= monster.skillCost) {
                onUseSkill(monster);
            }
        } else {
            // Was long press, clear info on release
             setInfoMonster(null);
        }
        isLongPress.current = false;
    };

    const handlePointerLeave = (e: React.PointerEvent) => {
        e.preventDefault();
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }
        setInfoMonster(null);
        isLongPress.current = false;
    };

    return (
        <div className="w-full max-w-md px-4 py-0 relative z-30">
            {/* FIXED INFO MODAL - CENTERED TOP */}
            {infoMonster && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 z-50 animate-in zoom-in duration-200 pointer-events-none">
                    <div className={`
                        relative p-4 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl text-center
                        ${TYPE_VIVID[infoMonster.type] || 'bg-slate-900'} 
                        bg-opacity-95
                    `}>
                        {/* Down Arrow */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-inherit border-b border-r border-white/20"></div>
                        
                        <h3 className="text-lg font-black text-white uppercase tracking-wider drop-shadow-md mb-1">
                            {infoMonster.skillName}
                        </h3>
                        <p className="text-xs text-white font-medium leading-relaxed mb-3">
                            {infoMonster.skillDescription}
                        </p>
                        
                        <div className="inline-flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full text-xs font-mono text-white border border-white/10">
                            <Zap size={12} className={charges[infoMonster.id] >= infoMonster.skillCost ? 'text-yellow-400' : 'text-slate-400'} />
                            {charges[infoMonster.id] >= infoMonster.skillCost 
                                ? <span className="text-yellow-400 font-bold">¡LISTO!</span>
                                : <span>Faltan: {Math.max(0, infoMonster.skillCost - (charges[infoMonster.id] || 0))}</span>
                            }
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between gap-4">
                {team.map((monster) => {
                    const currentCharge = charges[monster.id] || 0;
                    const percent = Math.min(100, (currentCharge / monster.skillCost) * 100);
                    const isReady = percent >= 100;

                    return (
                        <div 
                            key={monster.id}
                            className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden transition-all select-none touch-none
                                ${disabled ? 'opacity-50 grayscale' : ''}
                                ${isReady ? 'shadow-[0_0_15px_rgba(250,204,21,0.6)] border-2 border-yellow-400 scale-105' : 'border border-slate-600 bg-slate-900'}
                            `}
                            onPointerDown={(e) => handlePointerDown(e, monster)}
                            onPointerUp={(e) => handlePointerUp(e, monster)}
                            onPointerLeave={handlePointerLeave}
                            onPointerCancel={handlePointerLeave}
                            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }} // CRITICAL: Prevents browser menu on long press
                        >
                            {/* Background Charge Fill (Bottom to Top) */}
                            <div 
                                className="absolute bottom-0 left-0 w-full bg-indigo-500/40 transition-all duration-500 ease-out z-0"
                                style={{ height: `${percent}%` }}
                            ></div>
                            
                            {/* Ready Glow Effect overlay */}
                            {isReady && (
                                <div className="absolute inset-0 bg-yellow-400/10 animate-pulse z-0"></div>
                            )}

                            {/* Monster Icon */}
                            <div className={`absolute inset-0 flex items-center justify-center z-10 ${isReady ? 'animate-pulse' : ''}`}>
                                {monster.image ? (
                                    <img src={monster.image} alt={monster.emoji} className="w-full h-full object-contain p-2" draggable={false} />
                                ) : (
                                    <span className="text-3xl">{monster.emoji}</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SkillBar;