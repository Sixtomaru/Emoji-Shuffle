import React, { useState, useRef } from 'react';
import { Boss } from '../types';
import { TYPE_VIVID, TYPE_ICONS } from '../constants';
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

    // Updated type signature to accept MouseEvent, TouchEvent, or PointerEvent
    const handlePointerDown = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent, monster: Boss) => {
        if (disabled && !charges) return; 
        
        isLongPress.current = false;
        pressTimer.current = setTimeout(() => {
            isLongPress.current = true;
            setInfoMonster(monster);
            soundManager.playButton();
        }, 300); 
    };

    // Updated type signature
    const handlePointerUp = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent, monster: Boss) => {
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
    };

    const handlePointerLeave = () => {
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }
        setInfoMonster(null);
    };

    return (
        <div className="w-full max-w-md px-4 py-2 flex justify-between gap-4 relative z-30">
            {team.map((monster) => {
                const currentCharge = charges[monster.id] || 0;
                const percent = Math.min(100, (currentCharge / monster.skillCost) * 100);
                const isReady = percent >= 100;

                return (
                    <div 
                        key={monster.id}
                        className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden transition-all select-none
                            ${disabled ? 'opacity-50 grayscale' : ''}
                            ${isReady ? 'shadow-[0_0_15px_rgba(250,204,21,0.6)] border-2 border-yellow-400 scale-105' : 'border border-slate-600 bg-slate-900'}
                        `}
                        onMouseDown={(e) => handlePointerDown(e, monster)}
                        onMouseUp={(e) => handlePointerUp(e, monster)}
                        onMouseLeave={handlePointerLeave}
                        onTouchStart={(e) => handlePointerDown(e, monster)}
                        onTouchEnd={(e) => handlePointerUp(e, monster)}
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

                        {/* Type Icon Badge (Small) */}
                        <div className="absolute top-0 right-0 bg-black/60 rounded-full w-5 h-5 flex items-center justify-center z-20 border border-slate-700">
                            <span className="text-[10px]">{TYPE_ICONS[monster.type]}</span>
                        </div>
                    </div>
                );
            })}

            {/* INFO MODAL (Long Press) */}
            {infoMonster && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 z-50 animate-in zoom-in duration-200 pointer-events-none">
                    <div className={`
                        relative p-4 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl text-center
                        ${TYPE_VIVID[infoMonster.type] || 'bg-slate-900'} 
                        bg-opacity-80
                    `}>
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
        </div>
    );
};

export default SkillBar;