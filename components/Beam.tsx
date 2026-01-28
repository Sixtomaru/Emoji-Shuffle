import React from 'react';

interface ProjectileProps {
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
    color: string;
}

const AttackProjectile: React.FC<ProjectileProps> = ({ startX, startY, targetX, targetY, color }) => {
    return (
        <div 
            className="fixed z-50 pointer-events-none w-8 h-8 rounded-full shadow-[0_0_20px_white] animate-projectile"
            style={{
                '--startX': `${startX}px`,
                '--startY': `${startY}px`,
                '--targetX': `${targetX}px`,
                '--targetY': `${targetY}px`,
                background: `radial-gradient(circle at 30% 30%, white, ${color})`,
            } as React.CSSProperties}
        >
             <style>{`
                @keyframes projectile-move {
                    0% { transform: translate(var(--startX), var(--startY)) scale(0.5); opacity: 0; }
                    10% { opacity: 1; transform: translate(var(--startX), var(--startY)) scale(1.2); }
                    100% { transform: translate(var(--targetX), var(--targetY)) scale(1); opacity: 0; }
                }
                .animate-projectile {
                    animation: projectile-move 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }
             `}</style>
        </div>
    );
};

export default AttackProjectile;