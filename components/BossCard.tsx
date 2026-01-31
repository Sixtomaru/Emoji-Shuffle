import React, { useState } from 'react';
import { Boss } from '../types';

interface BossCardProps {
  boss: Boss;
  shake: boolean;
  damageTaken: number | null;
  isDefeated?: boolean; // New prop for defeat animation
}

const BossCard: React.FC<BossCardProps> = ({ boss, shake, damageTaken, isDefeated }) => {
  const [imgError, setImgError] = useState(false);
  const hpPercentage = Math.max(0, (boss.currentHp / boss.maxHp) * 100);

  return (
    <div className="relative w-full max-w-md mx-auto p-4 bg-slate-800/90 backdrop-blur rounded-3xl shadow-2xl border-2 border-slate-600 flex flex-col items-center">
      <div className="absolute top-2 right-4 text-xs text-slate-300 font-mono border border-slate-500 px-3 py-1 rounded-full bg-slate-700/50">
        {boss.type.toUpperCase()}
      </div>

      <div className="text-center mb-4">
        <h2 className="text-3xl font-black text-white tracking-wide drop-shadow-md">{boss.name}</h2>
      </div>

      {/* Main Container for Boss Image */}
      <div className={`relative transition-transform duration-100 ${shake ? 'animate-shake-violent' : ''}`}>
        <div className={`w-32 h-32 md:w-40 md:h-40 flex items-center justify-center filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] 
            ${!shake && !isDefeated ? 'animate-float-boss' : ''} 
            ${isDefeated ? 'animate-defeat-spin' : ''}
        `}>
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
        
        {/* Smoke Effect triggers when defeated */}
        {isDefeated && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-40 h-40 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0)_70%)] animate-poof opacity-0" style={{ animationDelay: '0.8s' }}></div>
            </div>
        )}
        
        {damageTaken && (
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-5xl font-black text-red-500 damage-float pointer-events-none z-50 drop-shadow-[0_2px_0_white]">
             -{damageTaken}
           </div>
        )}
      </div>

      <div className="w-full mt-6 px-2">
        <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
          <span>HP</span>
          <span>{boss.currentHp} / {boss.maxHp}</span>
        </div>
        <div className="w-full h-5 bg-slate-950 rounded-full overflow-hidden border border-slate-600 shadow-inner">
            <div 
                className={`h-full transition-all duration-500 ease-out shadow-[inset_0_-2px_4px_rgba(0,0,0,0.3)] ${
                    hpPercentage < 20 ? 'bg-gradient-to-r from-red-600 to-red-500' : hpPercentage < 50 ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' : 'bg-gradient-to-r from-green-600 to-green-400'
                }`}
                style={{ width: `${hpPercentage}%` }}
            />
        </div>
      </div>
      
      <style>{`
         @keyframes float-boss {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-8px) rotate(2deg); }
         }
         .animate-float-boss {
            animation: float-boss 4s ease-in-out infinite;
         }
         @keyframes shake-violent {
            0% { transform: translate(0, 0) rotate(0deg); }
            10% { transform: translate(-5px, -5px) rotate(-5deg); }
            20% { transform: translate(5px, 5px) rotate(5deg); }
            30% { transform: translate(-5px, 5px) rotate(-5deg); }
            40% { transform: translate(5px, -5px) rotate(5deg); }
            50% { transform: translate(-5px, 0) rotate(-5deg); }
            100% { transform: translate(0, 0) rotate(0deg); }
         }
         .animate-shake-violent {
            animation: shake-violent 0.4s ease-in-out;
         }
         @keyframes defeat-spin {
            0% { transform: scale(1) rotate(0deg); opacity: 1; }
            20% { transform: scale(1.1) rotate(-10deg); opacity: 1; }
            100% { transform: scale(0) rotate(720deg); opacity: 0; }
         }
         .animate-defeat-spin {
            animation: defeat-spin 1s ease-in forwards;
         }
         @keyframes poof {
            0% { transform: scale(0.5); opacity: 0.8; }
            100% { transform: scale(1.5); opacity: 0; }
         }
         .animate-poof {
            animation: poof 0.5s ease-out forwards;
         }
      `}</style>
    </div>
  );
};

export default BossCard;