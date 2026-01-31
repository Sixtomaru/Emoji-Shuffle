import React, { useState, useRef, useEffect } from 'react';
import { TileData, GRID_WIDTH, GRID_HEIGHT, FloatingText } from '../types';
import Tile from './Tile';

interface BoardProps {
  board: TileData[];
  selectedTileId: string | null;
  onMove: (id: string, x: number, y: number) => void;
  isProcessing: boolean;
  floatingTexts: FloatingText[];
  shake?: boolean;
}

const Board: React.FC<BoardProps> = ({ board, selectedTileId, onMove, isProcessing, floatingTexts, shake }) => {
  // Drag State
  const [draggingTileId, setDraggingTileId] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 }); 
  const boardRef = useRef<HTMLDivElement>(null);

  // Pointer Events for Dragging
  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    if (isProcessing) return;
    
    // CRITICAL: Prevent native image dragging or text selection
    e.preventDefault(); 
    
    // Capture pointer to track movement even outside the tile
    const target = e.target as Element;
    target.setPointerCapture(e.pointerId);
    
    setDraggingTileId(id);
    setStartPos({ x: e.clientX, y: e.clientY });
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingTileId) return;
    e.preventDefault();
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!draggingTileId) return;
    e.preventDefault();

    const target = e.target as Element;
    try {
        if (target.hasPointerCapture(e.pointerId)) {
            target.releasePointerCapture(e.pointerId);
        }
    } catch (err) {
        // Ignore capture errors
    }

    const distance = Math.hypot(e.clientX - startPos.x, e.clientY - startPos.y);
    
    if (distance < 10) {
      // Click/Tap Case: Toggle selection
      const t = board.find(t => t.id === draggingTileId);
      if (t) onMove(draggingTileId, t.x, t.y); 
    } else {
      // Drag Case: Calculate Drop Target
      if (boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;
        
        const gridX = Math.floor((relX / rect.width) * GRID_WIDTH);
        const gridY = Math.floor((relY / rect.height) * GRID_HEIGHT);

        // Check if inside bounds
        if (gridX >= 0 && gridX < GRID_WIDTH && gridY >= 0 && gridY < GRID_HEIGHT) {
            onMove(draggingTileId, gridX, gridY);
        }
      }
    }

    setDraggingTileId(null);
  };

  const renderGridBackground = () => {
    const cells = [];
    for (let i = 0; i < GRID_WIDTH * GRID_HEIGHT; i++) {
      cells.push(
        <div key={i} className="w-full h-full bg-slate-800/50 rounded-xl border border-slate-700/30"></div>
      );
    }
    return cells;
  };

  const draggingTile = board.find(t => t.id === draggingTileId);

  return (
    <div 
      ref={boardRef}
      className={`relative w-full max-w-md aspect-square mx-auto mt-4 p-2 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 select-none transition-transform ${shake ? 'animate-shake-soft' : ''}`}
      style={{ touchAction: 'none', overscrollBehavior: 'none' }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Grid Background */}
      <div className="grid grid-cols-6 grid-rows-6 gap-0 w-full h-full absolute inset-0 p-2 z-0 pointer-events-none">
        {renderGridBackground()}
      </div>

      {/* Tiles Layer - Now managed by Framer Motion Physics in Tile.tsx */}
      <div className="relative w-full h-full z-10">
        {board.map((tile) => (
          <Tile
            key={tile.id}
            tile={tile}
            isSelected={selectedTileId === tile.id}
            isDragging={draggingTileId === tile.id}
            onPointerDown={handlePointerDown}
          />
        ))}
      </div>

      {/* Dragging Ghost (Visual Feedback for Dragging) */}
      {draggingTile && (
          <div 
             className="fixed w-24 h-24 z-50 pointer-events-none"
             style={{ 
                 left: dragPos.x, 
                 top: dragPos.y,
                 transform: 'translate(-50%, -50%)' 
             }}
          >
              <div className="w-full h-full flex items-center justify-center text-7xl drop-shadow-2xl scale-125">
                  {draggingTile.image ? (
                     <img src={draggingTile.image} alt="ghost" className="w-full h-full object-contain" />
                  ) : (
                     draggingTile.emoji
                  )}
              </div>
          </div>
      )}

      {/* Floating Damage Text Layer */}
      <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden rounded-2xl">
         {floatingTexts.map(ft => (
             <div 
                key={ft.id}
                className="absolute text-2xl font-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] animate-float-text"
                style={{
                    left: `${(ft.x + 0.5) * (100/GRID_WIDTH)}%`,
                    top: `${(ft.y + 0.5) * (100/GRID_HEIGHT)}%`,
                    color: ft.color,
                    transform: 'translate(-50%, -50%)'
                }}
             >
                 {ft.text}
             </div>
         ))}
      </div>
      
      <style>{`
        @keyframes float-text {
            0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
            20% { transform: translate(-50%, -100%) scale(1.5); opacity: 1; }
            100% { transform: translate(-50%, -300%) scale(1); opacity: 0; }
        }
        .animate-float-text {
            animation: float-text 1s ease-out forwards;
        }
        @keyframes shake-soft {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-3px) rotate(-1deg); }
            75% { transform: translateX(3px) rotate(1deg); }
        }
        .animate-shake-soft {
            animation: shake-soft 0.3s ease-in-out infinite;
        }
      `}</style>

      {isProcessing && (
         <div className="absolute inset-0 z-20 bg-transparent cursor-wait" />
      )}
    </div>
  );
};

export default Board;