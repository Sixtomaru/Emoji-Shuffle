import React, { useEffect, useState } from 'react';
import { Boss } from '../types';
import { TYPE_VIVID } from '../constants';
import { soundManager } from '../utils/sound';

interface CaptureModalProps {
    boss: Boss;
    chance: number;
    onCaptureEnd: (caught: boolean) => void;
}

const CaptureModal: React.FC<CaptureModalProps> = ({ boss, chance, onCaptureEnd }) => {
    const [imgError, setImgError] = useState(false);
    // Phases: 
    // idle: waiting for throw
    // throwing: ball goes UP
    // contact: ball hits boss position, smoke appears
    // dropping: ball falls to catch position
    // shaking: ball shakes
    // result: success or fail
    const [phase, setPhase] = useState<'idle' | 'throwing' | 'contact' | 'dropping' | 'shaking' | 'result'>('idle');
    const [shakes, setShakes] = useState(0);
    const [caught, setCaught] = useState(false);
    
    // Dynamic multicolored background
    const baseColor = TYPE_VIVID[boss.type] || 'bg-slate-900';
    
    const handleThrow = () => {
        if (phase === 'idle') {
            soundManager.playThrow();
            setPhase('throwing');
        }
    };

    // Animation Sequence
    useEffect(() => {
        if (phase === 'throwing') {
            const timer = setTimeout(() => setPhase('contact'), 500);
            return () => clearTimeout(timer);
        }
        if (phase === 'contact') {
            // Smoke effect triggers here, Boss disappears
            const timer = setTimeout(() => setPhase('dropping'), 200); // Quick flash of smoke
            return () => clearTimeout(timer);
        }
        if (phase === 'dropping') {
            const timer = setTimeout(() => setPhase('shaking'), 500); // Time to fall down
            return () => clearTimeout(timer);
        }
    }, [phase]);

    useEffect(() => {
        if (phase === 'shaking') {
            const roll = Math.random() * 100;
            const isSuccess = roll <= chance;
            
            // Logic: Max 3 shakes.
            const maxShakes = isSuccess ? 3 : Math.floor(Math.random() * 3);
            
            let shakeCount = 0;
            const interval = setInterval(() => {
                shakeCount++;
                setShakes(shakeCount);
                if (shakeCount > maxShakes) {
                    clearInterval(interval);
                    if (isSuccess) {
                        setCaught(true);
                        setPhase('result');
                        soundManager.playCaptureSuccess();
                        setTimeout(() => onCaptureEnd(true), 2500); 
                    } else {
                        setCaught(false);
                        setPhase('result');
                        setTimeout(() => onCaptureEnd(false), 2000);
                    }
                } else {
                    soundManager.playShake();
                }
            }, 1000); 
            return () => clearInterval(interval);
        }
    }, [phase, chance, onCaptureEnd]);

    return (
        <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center py-20 overflow-hidden transition-all duration-1000`}>
            {/* Background Layers */}
            <div className={`absolute inset-0 ${baseColor} transition-colors duration-1000`}></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/50 via-transparent to-yellow-500/30 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-black/60"></div>

            {/* Content Container - MOVED DOWN via mt-40 to be lower on screen */}
            <div className="relative w-full h-full flex flex-col items-center justify-center mt-40">
                
                {/* Boss Area */}
                <div className="relative h-64 w-full flex items-center justify-center z-10 -mt-32">
                    {/* Boss Visible only until Contact */}
                    {(phase === 'idle' || phase === 'throwing') && (
                         <div className="w-40 h-40 animate-bounce transition-all duration-500 filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] flex items-center justify-center">
                             {boss.image && !imgError ? (
                                <img 
                                    src={boss.image} 
                                    alt={boss.emoji} 
                                    className="w-full h-full object-contain" 
                                    onError={() => setImgError(true)}
                                />
                            ) : (
                                <span className="text-9xl">{boss.emoji}</span>
                            )}
                         </div>
                    )}

                    {/* Smoke Effect on Contact (CSS Radial Gradients instead of Emoji) */}
                    {phase === 'contact' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            {/* Inner Poof */}
                            <div className="w-40 h-40 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0)_70%)] animate-puff-expand"></div>
                            {/* Outer Ring */}
                            <div className="absolute w-40 h-40 rounded-full border-4 border-white/50 opacity-0 animate-ring-expand delay-75"></div>
                        </div>
                    )}
                    
                    {/* Capture Percentage */}
                    <div className="absolute -top-12 right-4 bg-black/40 backdrop-blur-md rounded-full px-4 py-1 text-white font-mono text-xs border border-white/20 shadow-lg">
                        PROBABILIDAD: {chance.toFixed(1)}%
                    </div>
                </div>

                {/* Ball Area */}
                <div className="relative h-40 w-full flex flex-col items-center justify-center z-20 perspective-1000">
                    
                    {phase === 'idle' && (
                         <div className="absolute -top-24 text-white animate-pulse text-sm font-bold uppercase tracking-[0.2em] drop-shadow-md text-center">
                             TOCA PARA CAPTURAR
                         </div>
                    )}

                    {/* The Ball */}
                    <button 
                        onClick={handleThrow}
                        disabled={phase !== 'idle'}
                        className={`
                            w-24 h-24 rounded-full relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500
                            ${phase === 'idle' ? 'cursor-pointer hover:scale-105 animate-float-slow' : ''}
                            ${phase === 'throwing' ? 'animate-throw-upwards' : ''}
                            ${phase === 'contact' ? 'opacity-0' : ''} 
                            ${phase === 'dropping' ? 'animate-drop-down' : ''}
                            ${phase === 'shaking' ? '' : ''}
                            ${phase === 'result' && !caught ? 'opacity-0 scale-150' : ''} 
                            ${phase === 'result' && caught ? 'brightness-125 shadow-[0_0_50px_#4f46e5]' : ''}
                        `}
                        style={{
                            background: 'radial-gradient(circle at 35% 35%, #ffffff, #9ca3af, #1f2937)',
                            animation: phase === 'shaking' ? `shake-ball 1s ${shakes}` : undefined
                        }}
                    >
                        {/* Ball Details */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-4 bg-slate-800/80 border-y border-cyan-400/50 shadow-[0_0_10px_cyan] z-10"></div>
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-slate-300 z-20 transition-colors duration-300 ${phase === 'shaking' ? 'bg-red-500 animate-ping' : 'bg-white shadow-[0_0_10px_white]'}`}></div>
                    </button>

                    {/* Stars Explosion on Success */}
                    {phase === 'result' && caught && (
                        <div className="absolute top-0 w-20 h-20">
                            {[...Array(12)].map((_, i) => {
                                const angle = (i * 30) * (Math.PI / 180);
                                const dist = 100 + Math.random() * 50;
                                const tx = Math.cos(angle) * dist;
                                const ty = Math.sin(angle) * dist;
                                return (
                                    <div 
                                        key={i}
                                        className="absolute top-1/2 left-1/2 w-4 h-4 text-yellow-300 text-2xl animate-star-explode opacity-0"
                                        style={{
                                            '--tx': `${tx}px`,
                                            '--ty': `${ty}px`,
                                            '--delay': `${Math.random() * 0.2}s`,
                                        } as React.CSSProperties}
                                    >
                                        ⭐
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Fleeing Animation */}
                    {phase === 'result' && !caught && (
                        <div className="absolute -top-32 text-8xl animate-flee flex items-center justify-center w-32 h-32">
                             {boss.image && !imgError ? (
                                <img src={boss.image} alt={boss.emoji} className="w-full h-full object-contain" />
                            ) : (
                                <span className="text-9xl">{boss.emoji}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes throw-upwards {
                    0% { transform: translateY(0) scale(1); }
                    100% { transform: translateY(-12rem) scale(0.5); }
                }
                .animate-throw-upwards {
                    animation: throw-upwards 0.5s ease-out forwards;
                }

                @keyframes drop-down {
                    0% { transform: translateY(-12rem); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                .animate-drop-down {
                    animation: drop-down 0.5s ease-in forwards;
                }
                
                @keyframes puff-expand {
                    0% { transform: scale(0.2); opacity: 0.8; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
                .animate-puff-expand {
                    animation: puff-expand 0.4s ease-out forwards;
                }
                
                @keyframes ring-expand {
                    0% { transform: scale(0.5); opacity: 1; border-width: 4px; }
                    100% { transform: scale(2); opacity: 0; border-width: 0px; }
                }
                .animate-ring-expand {
                    animation: ring-expand 0.4s ease-out forwards;
                }

                @keyframes shake-ball {
                    0% { transform: rotate(0deg) translateX(0); }
                    25% { transform: rotate(-20deg) translateX(-15px); }
                    50% { transform: rotate(20deg) translateX(15px); }
                    75% { transform: rotate(-20deg) translateX(-15px); }
                    100% { transform: rotate(0deg) translateX(0); }
                }
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float-slow {
                    animation: float-slow 3s ease-in-out infinite;
                }
                @keyframes flee {
                    0% { transform: scale(1) translateX(0); opacity: 1; filter: blur(0); }
                    30% { transform: scale(1.1) translateX(-20px) skewX(-10deg); }
                    100% { transform: scale(0.5) translateX(300px) skewX(20deg); opacity: 0; filter: blur(4px); }
                }
                .animate-flee {
                    animation: flee 0.8s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards;
                }
                
                @keyframes star-explode {
                    0% { transform: translate(-50%, -50%) rotate(0deg) scale(0.5); opacity: 0; }
                    20% { opacity: 1; }
                    100% { transform: translate(var(--tx), var(--ty)) rotate(360deg) scale(0); opacity: 0; }
                }
                .animate-star-explode {
                    animation: star-explode 1s ease-out forwards;
                    animation-delay: var(--delay);
                }

                .perspective-1000 { perspective: 1000px; }
            `}</style>
        </div>
    );
};

export default CaptureModal;