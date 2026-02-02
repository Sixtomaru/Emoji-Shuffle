import React, { useRef, useEffect, useState } from 'react';
import { TileData, GRID_WIDTH, GRID_HEIGHT } from '../types';

interface BoardProps {
  board: TileData[];
  selectedTileId: string | null;
  onMove: (id: string, x: number, y: number) => void;
  isProcessing: boolean;
  shake?: boolean;
  isFrozen?: boolean; // New prop to stop physics
}

// Visual State for a tile in the animation loop
interface VisualTile {
    x: number; 
    y: number; 
    scaleX: number; // For squash effect & zoom on spawn
    scaleY: number; // For squash effect & zoom on spawn
    opacity: number;
    rotation: number;
    squashTime: number; // Timestamp when impact started
    isSquashing: boolean;
}

// UPDATED: Using RGBA for transparency (40% opacity for backgrounds)
const CANVAS_THEME: Record<string, { fill: string, border: string }> = {
    'Fuego': { fill: 'rgba(254, 202, 202, 0.4)', border: '#fca5a5' },     
    'Agua': { fill: 'rgba(191, 219, 254, 0.4)', border: '#93c5fd' },     
    'Planta': { fill: 'rgba(187, 247, 208, 0.4)', border: '#86efac' },   
    'Eléctrico': { fill: 'rgba(254, 240, 138, 0.4)', border: '#fde047' }, 
    'Tierra': { fill: 'rgba(254, 215, 170, 0.4)', border: '#fdba74' },   
    'Roca': { fill: 'rgba(214, 211, 209, 0.4)', border: '#a8a29e' },     
    'Hielo': { fill: 'rgba(207, 250, 254, 0.4)', border: '#a5f3fc' },    
    'Acero': { fill: 'rgba(226, 232, 240, 0.4)', border: '#cbd5e1' },    
    'Fantasma': { fill: 'rgba(233, 213, 255, 0.4)', border: '#d8b4fe' }, 
    'Dragón': { fill: 'rgba(199, 210, 254, 0.4)', border: '#a5b4fc' },   
    'Normal': { fill: 'rgba(229, 231, 235, 0.4)', border: '#d1d5db' },   
    'Bicho': { fill: 'rgba(217, 249, 157, 0.4)', border: '#bef264' },    
    'Volador': { fill: 'rgba(186, 230, 253, 0.4)', border: '#7dd3fc' },  
    'Psíquico': { fill: 'rgba(251, 207, 232, 0.4)', border: '#f9a8d4' }, 
    'Hada': { fill: 'rgba(254, 205, 211, 0.4)', border: '#fda4af' }      
};

// Polyfill for round rect drawing
const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
};

const Board: React.FC<BoardProps> = ({ board, selectedTileId, onMove, isProcessing, shake, isFrozen = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const imageCache = useRef<Record<string, HTMLImageElement>>({});
  const animState = useRef<Record<string, VisualTile>>({});
  
  const [dragState, setDragState] = useState<{ id: string, startX: number, startY: number, currX: number, currY: number } | null>(null);

  // Sync board props to animation state
  useEffect(() => {
      const currentAnim = animState.current;
      const newAnim: Record<string, VisualTile> = {};
      
      board.forEach(tile => {
          if (currentAnim[tile.id]) {
              // Existing tile
              newAnim[tile.id] = {
                  ...currentAnim[tile.id],
              };
          } else {
              // New tile logic
              const isSpawn = tile.id.includes('spawn') || tile.id.includes('init');
              
              if (isSpawn) {
                  // SPAWN: Start at target position but scale 0 (ZOOM IN)
                  newAnim[tile.id] = {
                      x: tile.x,
                      y: tile.y, 
                      scaleX: 0, 
                      scaleY: 0,
                      opacity: 1,
                      rotation: 0,
                      squashTime: 0,
                      isSquashing: false
                  };
              } else {
                 // FALLBACK (shouldn't really happen for non-spawns unless explicit fall logic needed)
                  newAnim[tile.id] = {
                      x: tile.x,
                      y: tile.y - 1,
                      scaleX: 1,
                      scaleY: 1,
                      opacity: 1,
                      rotation: 0,
                      squashTime: 0,
                      isSquashing: false
                  };
              }
          }
          
          if (tile.image && !imageCache.current[tile.image]) {
              const img = new Image();
              img.src = tile.image;
              imageCache.current[tile.image] = img;
          }
      });
      
      animState.current = newAnim;
  }, [board]);

  // Main Animation Loop
  useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let animationFrameId: number;

      const render = () => {
          if (!canvas || !containerRef.current) return;
          
          const dpr = window.devicePixelRatio || 1;
          const rect = containerRef.current.getBoundingClientRect();
          
          if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
              canvas.width = rect.width * dpr;
              canvas.height = rect.height * dpr;
              canvas.style.width = `${rect.width}px`;
              canvas.style.height = `${rect.height}px`;
          }

          ctx.resetTransform();
          ctx.scale(dpr, dpr);
          
          let shakeX = 0;
          let shakeY = 0;
          if (shake) {
              const time = Date.now();
              shakeX = Math.sin(time / 10) * 3;
              shakeY = Math.cos(time / 10) * 3;
          }
          ctx.translate(shakeX, shakeY);
          
          ctx.clearRect(0, 0, rect.width, rect.height);

          // 1. Background Grid
          const pSize = rect.width / GRID_WIDTH;
          for (let x = 0; x < GRID_WIDTH; x++) {
              for (let y = 0; y < GRID_HEIGHT; y++) {
                  const px = x * pSize;
                  const py = y * (rect.height / GRID_HEIGHT);
                  
                  ctx.fillStyle = 'rgba(30, 41, 59, 0.4)'; // slate-800
                  ctx.beginPath();
                  drawRoundedRect(ctx, px + 4, py + 4, pSize - 8, pSize - 8, 12);
                  ctx.fill();
                  ctx.lineWidth = 2;
                  ctx.strokeStyle = 'rgba(51, 65, 85, 0.2)';
                  ctx.stroke();
              }
          }

          // 2. Tiles
          const speed = 0.08; // Even slower falling speed
          const now = Date.now();
          
          // Helper Function to Draw a Tile
          const drawTile = (tile: TileData, visual: VisualTile, isDragging: boolean) => {
               if (visual.opacity < 0.01) return;
              
              let drawX = visual.x * pSize;
              let drawY = visual.y * (rect.height / GRID_HEIGHT);

              if (isDragging && dragState) {
                  const r = containerRef.current!.getBoundingClientRect();
                  drawX = (dragState.currX - r.left) - (pSize/2);
                  drawY = (dragState.currY - r.top) - (pSize/2);
              }

              const pad = 6;
              const innerSize = pSize - (pad * 2);

              ctx.save();
              ctx.translate(drawX + pSize/2, drawY + pSize/2);
              
              // Scale Logic
              let currentScaleX = visual.scaleX;
              let currentScaleY = visual.scaleY;
              
              if (isDragging) {
                  currentScaleX = 1.2; // Bigger when dragging
                  currentScaleY = 1.2;
                  ctx.globalAlpha = 0.8; // More transparent when dragging
              } else {
                  ctx.globalAlpha = visual.opacity;
              }

              ctx.scale(currentScaleX, currentScaleY);
              ctx.rotate(visual.rotation);
              ctx.translate(-(drawX + pSize/2), -(drawY + pSize/2));

              // Styles
              let fillColor = '#334155';
              let borderColor = '#475569';
              
              if (tile.status === 'rock') {
                  fillColor = '#44403c'; 
                  borderColor = '#78716c'; 
              } else if (tile.status === 'steel') {
                  fillColor = '#1e293b'; 
                  borderColor = '#94a3b8'; 
              } else {
                  const theme = CANVAS_THEME[tile.type];
                  if (theme) {
                      fillColor = theme.fill;
                      borderColor = theme.border;
                  }
              }

              const cornerRadius = 14;
              const xPos = drawX + pad;
              const yPos = drawY + pad;

              // Shadow (Only if not matched)
              if (!tile.isMatched) {
                  if (isDragging) {
                      // Lifted shadow
                      ctx.fillStyle = 'rgba(0,0,0,0.3)';
                      ctx.beginPath();
                      drawRoundedRect(ctx, xPos + 5, yPos + 15, innerSize, innerSize, cornerRadius);
                      ctx.fill();
                  } else {
                      // Grounded shadow
                      ctx.fillStyle = 'rgba(0,0,0,0.15)';
                      ctx.beginPath();
                      drawRoundedRect(ctx, xPos, yPos + 4, innerSize, innerSize, cornerRadius);
                      ctx.fill();
                  }
              }
              
              // Main Box Fill
              ctx.fillStyle = fillColor;
              ctx.beginPath();
              drawRoundedRect(ctx, xPos, yPos, innerSize, innerSize, cornerRadius);
              ctx.fill();
              
              // Border
              ctx.strokeStyle = selectedTileId === tile.id ? '#facc15' : borderColor;
              ctx.lineWidth = selectedTileId === tile.id ? 4 : 3;
              if (selectedTileId === tile.id) {
                   ctx.shadowColor = 'rgba(250, 204, 21, 0.6)';
                   ctx.shadowBlur = 10;
              }
              ctx.stroke();
              ctx.shadowBlur = 0; 
              ctx.shadowColor = 'transparent';

              // Content
              const centerX = drawX + pSize / 2;
              const centerY = drawY + pSize / 2;

              // Force opaque fill for content to avoid inheriting transparency
              ctx.fillStyle = '#ffffff';

              if (tile.status === 'rock') {
                   ctx.font = `${innerSize * 0.6}px Arial`;
                   ctx.textAlign = 'center';
                   ctx.textBaseline = 'middle';
                   ctx.fillStyle = '#000'; 
                   ctx.fillText("🪨", centerX, centerY + 2);
                   ctx.filter = 'grayscale(100%) contrast(125%)';
                   ctx.fillText("🪨", centerX, centerY);
                   ctx.filter = 'none';
              } else if (tile.status === 'steel') {
                   ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                   ctx.lineWidth = 2;
                   ctx.beginPath();
                   drawRoundedRect(ctx, xPos + 4, yPos + 4, innerSize - 8, innerSize - 8, 8);
                   ctx.stroke();

                   ctx.font = `${innerSize * 0.5}px Arial`;
                   ctx.textAlign = 'center';
                   ctx.textBaseline = 'middle';
                   ctx.fillText("🛡️", centerX, centerY);
                   
                   if (tile.statusLife !== undefined) {
                       ctx.beginPath();
                       ctx.arc(centerX + innerSize/2 - 6, centerY - innerSize/2 + 6, 8, 0, Math.PI * 2);
                       ctx.fillStyle = '#0f172a';
                       ctx.fill();
                       ctx.strokeStyle = '#64748b';
                       ctx.lineWidth = 1;
                       ctx.stroke();
                       ctx.fillStyle = '#fff';
                       ctx.font = 'bold 10px Arial';
                       ctx.fillText(tile.statusLife.toString(), centerX + innerSize/2 - 6, centerY - innerSize/2 + 6);
                   }
              } else {
                  if (tile.image && imageCache.current[tile.image] && imageCache.current[tile.image].complete) {
                       const img = imageCache.current[tile.image];
                       const imgSize = innerSize * 0.85;
                       
                       if (tile.status === 'ice') ctx.globalAlpha = (isDragging ? 0.8 : visual.opacity) * 0.7;
                       
                       ctx.drawImage(img, centerX - imgSize/2, centerY - imgSize/2, imgSize, imgSize);
                       ctx.globalAlpha = isDragging ? 0.8 : visual.opacity; 
                  } else {
                       ctx.font = `${innerSize * 0.6}px "Fredoka", Arial`; 
                       ctx.textAlign = 'center';
                       ctx.textBaseline = 'middle';
                       ctx.fillStyle = '#ffffff'; // Ensure emoji is opaque
                       ctx.fillText(tile.emoji, centerX, centerY + (innerSize * 0.05));
                  }

                  if (tile.status === 'ice') {
                      ctx.fillStyle = 'rgba(165, 243, 252, 0.3)';
                      ctx.beginPath();
                      drawRoundedRect(ctx, xPos, yPos, innerSize, innerSize, cornerRadius);
                      ctx.fill();
                      
                      ctx.strokeStyle = 'rgba(34, 211, 238, 0.8)';
                      ctx.lineWidth = 3;
                      ctx.stroke();
                      
                      ctx.font = '14px Arial';
                      ctx.fillText("❄️", xPos + innerSize - 8, yPos + 12);
                      
                      ctx.fillStyle = 'rgba(255,255,255,0.4)';
                      ctx.beginPath();
                      ctx.moveTo(xPos + 10, yPos + innerSize - 5);
                      ctx.lineTo(xPos + innerSize - 5, yPos + 10);
                      ctx.lineTo(xPos + innerSize - 5, yPos + 20);
                      ctx.lineTo(xPos + 20, yPos + innerSize - 5);
                      ctx.fill();
                  }
              }

              ctx.restore();
          };

          // --- SEPARATE RENDER PASSES ---
          // 1. Update Physics & Draw ALL Non-Dragged Tiles
          let draggedTileData: { tile: TileData, visual: VisualTile } | null = null;

          board.forEach(tile => {
              const visual = animState.current[tile.id];
              if (!visual) return;
              
              const isDragging = dragState?.id === tile.id;

              // PHYSICS
              if (!isDragging && !isFrozen) {
                  // Y Movement
                  const diffY = tile.y - visual.y;
                  if (Math.abs(diffY) <= speed) {
                      // IMPACT
                      if (visual.y !== tile.y && Math.abs(diffY) > 0.01) {
                          if (!visual.isSquashing) {
                              visual.isSquashing = true;
                              visual.squashTime = now;
                          }
                      }
                      visual.y = tile.y;
                  } else {
                      visual.y += Math.sign(diffY) * speed;
                      visual.isSquashing = false;
                  }
                  
                  // X Movement
                  const diffX = tile.x - visual.x;
                  if (Math.abs(diffX) <= speed) visual.x = tile.x;
                  else visual.x += Math.sign(diffX) * speed;

                  // Animation Tweens
                  // ZOOM IN SPAWN EFFECT
                  if (visual.scaleX < 1 && !tile.isMatched) {
                      visual.scaleX += 0.1;
                      visual.scaleY += 0.1;
                      if (visual.scaleX > 1) { visual.scaleX = 1; visual.scaleY = 1; }
                  }
                  // SQUASH EFFECT
                  else if (visual.isSquashing) {
                      const elapsed = now - visual.squashTime;
                      const duration = 200; 
                      if (elapsed < duration) {
                          const t = elapsed / duration;
                          const intensity = 0.15; 
                          const factor = Math.sin(t * Math.PI); 
                          visual.scaleX = 1 + (factor * intensity);      
                          visual.scaleY = 1 - (factor * intensity * 0.8); 
                      } else {
                          visual.scaleX = 1;
                          visual.scaleY = 1;
                          visual.isSquashing = false;
                      }
                  } else {
                      visual.scaleX += (1 - visual.scaleX) * 0.2;
                      visual.scaleY += (1 - visual.scaleY) * 0.2;
                  }

                  if (tile.isMatched) {
                      visual.scaleX *= 0.8;
                      visual.scaleY *= 0.8;
                      visual.opacity *= 0.8;
                      visual.rotation += 0.2;
                  } else {
                      if (selectedTileId === tile.id) {
                          const pulse = 1 + Math.sin(now / 100) * 0.05;
                          visual.scaleX = pulse;
                          visual.scaleY = pulse;
                      }
                      visual.opacity = 1;
                      visual.rotation = 0;
                  }
              }

              // RENDER LOGIC
              if (isDragging) {
                  draggedTileData = { tile, visual };
              } else {
                  drawTile(tile, visual, false);
              }
          });

          // 2. Draw Dragged Tile (Top Z-Index)
          if (draggedTileData) {
              drawTile(draggedTileData.tile, draggedTileData.visual, true);
          }

          animationFrameId = requestAnimationFrame(render);
      };

      render();
      return () => cancelAnimationFrame(animationFrameId);
  }, [board, selectedTileId, dragState, shake, isFrozen]);

  // Input Handling
  const handlePointerDown = (e: React.PointerEvent) => {
      if (isProcessing || isFrozen || !containerRef.current) return;
      e.preventDefault();
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const gridX = Math.floor((x / rect.width) * GRID_WIDTH);
      const gridY = Math.floor((y / rect.height) * GRID_HEIGHT);

      const tile = board.find(t => t.x === gridX && t.y === gridY);
      
      if (tile && tile.status === 'normal') {
          setDragState({
              id: tile.id,
              startX: e.clientX,
              startY: e.clientY,
              currX: e.clientX,
              currY: e.clientY
          });
          const target = e.target as Element;
          target.setPointerCapture(e.pointerId);
      }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
      if (!dragState) return;
      e.preventDefault();
      setDragState(prev => prev ? ({ ...prev, currX: e.clientX, currY: e.clientY }) : null);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
      if (!dragState) return;
      e.preventDefault();
      
      const dist = Math.hypot(e.clientX - dragState.startX, e.clientY - dragState.startY);
      
      if (dist < 10) {
          const tile = board.find(t => t.id === dragState.id);
          if (tile) onMove(tile.id, tile.x, tile.y);
      } 
      else if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const gridX = Math.floor((x / rect.width) * GRID_WIDTH);
          const gridY = Math.floor((y / rect.height) * GRID_HEIGHT);
          
          if (gridX >= 0 && gridX < GRID_WIDTH && gridY >= 0 && gridY < GRID_HEIGHT) {
              onMove(dragState.id, gridX, gridY);
          }
      }

      setDragState(null);
  };

  return (
    <div 
        ref={containerRef}
        className="relative w-full max-w-md aspect-square mx-auto mt-4 rounded-2xl shadow-2xl overflow-hidden bg-slate-900 border border-slate-700"
        style={{ touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
    >
        <canvas 
            ref={canvasRef}
            className="block w-full h-full"
        />
        {isProcessing && <div className="absolute inset-0 bg-transparent cursor-wait z-50"></div>}
    </div>
  );
};

export default Board;