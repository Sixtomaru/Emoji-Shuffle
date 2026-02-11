import React, { useRef, useEffect, useState } from 'react';
import { TileData, GRID_WIDTH, GRID_HEIGHT, TileStatus } from '../types';

interface BoardProps {
  board: TileData[];
  selectedTileId: string | null;
  onMove: (id: string, x: number, y: number) => void;
  isProcessing: boolean;
  shake?: boolean;
  isFrozen?: boolean;
  onBoardSettled?: () => void;
  isComboActive?: boolean;
  highlightedTileIds?: string[]; // NEW PROP
}

interface VisualTile {
    x: number; 
    y: number; 
    scaleX: number;
    scaleY: number;
    opacity: number;
    rotation: number;
    status: TileStatus; // Store status to detect changes
    interferenceStartTime?: number; 
    matchStartTime?: number;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
    type: 'dust' | 'snow' | 'spark';
}

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

const MOVE_SPEED = 0.15; 
const SETTLE_THRESHOLD = 0.05; 

const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
};

const Board: React.FC<BoardProps> = ({ board, selectedTileId, onMove, isProcessing, shake, isFrozen = false, onBoardSettled, isComboActive, highlightedTileIds = [] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const imageCache = useRef<Record<string, HTMLImageElement>>({});
  const animState = useRef<Record<string, VisualTile>>({});
  const particlesRef = useRef<Particle[]>([]);
  
  const isMovingRef = useRef(false);
  const settleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Double Security Timer Ref
  const safetySettlementRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [dragState, setDragState] = useState<{ id: string, startX: number, startY: number, currX: number, currY: number } | null>(null);

  const emitParticles = (x: number, y: number, type: 'rock' | 'ice' | 'steel') => {
      const count = 12;
      for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 0.15 + 0.05;
          let pType: Particle['type'] = 'dust';
          let color = '#a8a29e';

          if (type === 'rock') { pType = 'dust'; color = '#57534e'; }
          if (type === 'ice') { pType = 'snow'; color = '#cffafe'; }
          if (type === 'steel') { pType = 'spark'; color = '#fef08a'; }

          particlesRef.current.push({
              x: x + 0.5,
              y: y + 0.5,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1.0,
              maxLife: 1.0,
              color: color,
              size: Math.random() * 0.15 + 0.05,
              type: pType
          });
      }
  };

  useEffect(() => {
      const currentAnim = animState.current;
      const newAnim: Record<string, VisualTile> = {};
      
      // 1. Detect Removed Tiles (Rocks/Steel destroyed)
      Object.keys(currentAnim).forEach(id => {
          if (!board.find(t => t.id === id)) {
              // Tile was present, now gone. Check if it was an obstacle.
              const prev = currentAnim[id];
              if (prev.status === 'rock' || prev.status === 'steel') {
                   emitParticles(prev.x, prev.y, prev.status);
              }
          }
      });

      // 2. Process current board
      board.forEach(tile => {
          if (currentAnim[tile.id]) {
              const prev = currentAnim[tile.id];
              newAnim[tile.id] = { ...prev, status: tile.status };

              // Detect Ice Break (Ice -> Normal)
              if (prev.status === 'ice' && tile.status === 'normal') {
                  emitParticles(tile.x, tile.y, 'ice');
                  
                  // Visual Trick: Pop slightly up then drop to position
                  newAnim[tile.id].y = tile.y - 0.2; 
                  
                  newAnim[tile.id].matchStartTime = undefined; 
                  newAnim[tile.id].interferenceStartTime = undefined;
                  newAnim[tile.id].scaleX = 1;
                  newAnim[tile.id].scaleY = 1;
                  newAnim[tile.id].opacity = 1;
                  newAnim[tile.id].rotation = 0;
              }
              // Normal match detection
              else if (tile.isMatched && !prev.matchStartTime && tile.status !== 'ice') {
                  // Added extra check tile.status !== 'ice' to double ensure
                  newAnim[tile.id].matchStartTime = Date.now();
              }
          } else {
              // DETECT SPAWN
              const isInterference = tile.id.includes('int');
              const startY = tile.id.includes('spawn') ? -1.5 - (GRID_HEIGHT - tile.y) * 0.5 : tile.y;
              
              if (isInterference) {
                   newAnim[tile.id] = {
                      x: tile.x,
                      y: tile.y, // Start at final position
                      scaleX: 0, 
                      scaleY: 0,
                      opacity: 0,
                      rotation: 0,
                      status: tile.status,
                      interferenceStartTime: Date.now()
                   };
                   // Emit land particles right when they start appearing
                   emitParticles(tile.x, tile.y, tile.status as any);
              } else {
                  newAnim[tile.id] = {
                      x: tile.x,
                      y: startY, 
                      scaleX: 1, 
                      scaleY: 1,
                      opacity: 1,
                      rotation: 0,
                      status: tile.status
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
      if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current);
      
      // RESET SAFETY TIMER ON BOARD CHANGE
      if (safetySettlementRef.current) clearTimeout(safetySettlementRef.current);
      // If we are processing, set a safety timer to force settlement if visual logic gets stuck
      if (isProcessing) {
          safetySettlementRef.current = setTimeout(() => {
              if (onBoardSettled) {
                  // Force settlement
                  onBoardSettled();
              }
          }, 1500); // 1.5s timeout usually enough for any animation
      }

      isMovingRef.current = true; 

  }, [board, isProcessing]); // Added isProcessing dependency to re-arm timer

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
          
          let shakeX = 0; let shakeY = 0;
          if (shake) {
              const time = Date.now();
              shakeX = Math.sin(time / 20) * 5;
              shakeY = Math.cos(time / 20) * 5;
          }
          ctx.translate(shakeX, shakeY);
          
          ctx.clearRect(0, 0, rect.width, rect.height);
          
          if (isComboActive) {
               ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
               ctx.fillRect(0, 0, rect.width, rect.height);
          }

          const pSize = rect.width / GRID_WIDTH;

          // 2. Draw Grid Slots
          for (let x = 0; x < GRID_WIDTH; x++) {
              for (let y = 0; y < GRID_HEIGHT; y++) {
                  const px = x * pSize;
                  const py = y * (rect.height / GRID_HEIGHT);
                  ctx.fillStyle = 'rgba(30, 41, 59, 0.4)'; 
                  ctx.beginPath();
                  drawRoundedRect(ctx, px + 4, py + 4, pSize - 8, pSize - 8, 12);
                  ctx.fill();
              }
          }

          const now = Date.now();
          let globalIsMoving = false; // Tracks actual TILES moving
          let draggedTileData: { tile: TileData, visual: VisualTile } | null = null;
          
          const drawTile = (tile: TileData, visual: VisualTile, isDragging: boolean) => {
              if (visual.opacity < 0.01) return;
              
              let drawX = visual.x * pSize;
              let drawY = visual.y * (rect.height / GRID_HEIGHT);

              // Apply Vibration for settled interference tiles
              if (visual.interferenceStartTime && visual.scaleX >= 1) {
                  const elapsedVibe = now - visual.interferenceStartTime;
                  if (elapsedVibe < 500) {
                       const vibe = Math.sin(now / 30) * 0.03;
                       drawX += vibe * pSize;
                       drawY += (Math.cos(now / 30) * 0.03) * pSize;
                       // Note: Vibration counts as moving, but it self-terminates after 500ms
                       globalIsMoving = true; 
                  }
              }

              if (isDragging && dragState) {
                  const r = containerRef.current!.getBoundingClientRect();
                  drawX = (dragState.currX - r.left) - (pSize/2);
                  drawY = (dragState.currY - r.top) - (pSize/2);
              }

              const pad = 6;
              const innerSize = pSize - (pad * 2);

              ctx.save();
              ctx.translate(drawX + pSize/2, drawY + pSize/2);
              
              let currentScaleX = visual.scaleX;
              let currentScaleY = visual.scaleY;
              
              if (isDragging) {
                  currentScaleX = 1.2;
                  currentScaleY = 1.2;
                  ctx.globalAlpha = 0.9;
              } else {
                  if (isComboActive) {
                      if (tile.isMatched) {
                          ctx.globalAlpha = 1.0; 
                      } else {
                          ctx.globalAlpha = visual.opacity * 0.6; 
                      }
                  } else {
                      ctx.globalAlpha = visual.opacity;
                  }
              }

              ctx.scale(currentScaleX, currentScaleY);
              ctx.rotate(visual.rotation);
              ctx.translate(-(drawX + pSize/2), -(drawY + pSize/2));

              let fillColor = '#334155';
              let borderColor = '#475569';
              
              if (tile.status === 'rock') { fillColor = '#44403c'; borderColor = '#78716c'; }
              else if (tile.status === 'steel') { fillColor = '#1e293b'; borderColor = '#94a3b8'; } // Default fallback
              else {
                  const theme = CANVAS_THEME[tile.type];
                  if (theme) { fillColor = theme.fill; borderColor = theme.border; }
              }

              const cornerRadius = 14;
              const xPos = drawX + pad;
              const yPos = drawY + pad;
              
              // Highlight Border Check
              const isHighlighted = highlightedTileIds.includes(tile.id);

              // --- SPECIAL DRAWING FOR STEEL ---
              if (tile.status === 'steel') {
                  // Metallic Gradient Body
                  const grad = ctx.createLinearGradient(xPos, yPos, xPos + innerSize, yPos + innerSize);
                  grad.addColorStop(0, '#94a3b8');
                  grad.addColorStop(0.5, '#475569');
                  grad.addColorStop(1, '#1e293b');
                  
                  ctx.fillStyle = grad;
                  ctx.beginPath();
                  drawRoundedRect(ctx, xPos, yPos, innerSize, innerSize, cornerRadius);
                  ctx.fill();
                  
                  // Metallic Shine Reflection (Diagonal)
                  ctx.save();
                  ctx.beginPath();
                  drawRoundedRect(ctx, xPos, yPos, innerSize, innerSize, cornerRadius);
                  ctx.clip();
                  
                  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                  ctx.beginPath();
                  ctx.moveTo(xPos - innerSize, yPos + innerSize);
                  ctx.lineTo(xPos + innerSize, yPos - innerSize);
                  ctx.lineTo(xPos + innerSize + 30, yPos - innerSize);
                  ctx.lineTo(xPos - innerSize + 30, yPos + innerSize);
                  ctx.fill();

                  // Highlight top-left
                  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                  ctx.beginPath();
                  ctx.moveTo(xPos, yPos);
                  ctx.lineTo(xPos + innerSize * 0.5, yPos);
                  ctx.lineTo(xPos, yPos + innerSize * 0.5);
                  ctx.fill();
                  ctx.restore();

                  // Inner Bevel Highlight
                  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                  ctx.lineWidth = 2;
                  ctx.beginPath();
                  drawRoundedRect(ctx, xPos + 2, yPos + 2, innerSize - 4, innerSize - 4, cornerRadius);
                  ctx.stroke();

                  // Rivets in Corners
                  ctx.fillStyle = '#cbd5e1';
                  const rivetOffset = 8;
                  const rivetSize = 3;
                  // Top-Left
                  ctx.beginPath(); ctx.arc(xPos + rivetOffset, yPos + rivetOffset, rivetSize, 0, Math.PI*2); ctx.fill();
                  // Top-Right
                  ctx.beginPath(); ctx.arc(xPos + innerSize - rivetOffset, yPos + rivetOffset, rivetSize, 0, Math.PI*2); ctx.fill();
                  // Bottom-Left
                  ctx.beginPath(); ctx.arc(xPos + rivetOffset, yPos + innerSize - rivetOffset, rivetSize, 0, Math.PI*2); ctx.fill();
                  // Bottom-Right
                  ctx.beginPath(); ctx.arc(xPos + innerSize - rivetOffset, yPos + innerSize - rivetOffset, rivetSize, 0, Math.PI*2); ctx.fill();

                  // Border (Highlight capable)
                  if (isHighlighted) {
                       ctx.strokeStyle = '#fff';
                       ctx.lineWidth = 4;
                       ctx.shadowColor = 'white';
                       ctx.shadowBlur = 20;
                  } else {
                       ctx.strokeStyle = '#334155';
                       ctx.lineWidth = 2;
                       ctx.shadowBlur = 0;
                  }
                  
                  ctx.beginPath();
                  drawRoundedRect(ctx, xPos, yPos, innerSize, innerSize, cornerRadius);
                  ctx.stroke();
                  ctx.shadowBlur = 0; 

                  // Center Text for Life
                  if (tile.statusLife !== undefined) {
                       const centerX = drawX + pSize / 2;
                       const centerY = drawY + pSize / 2;
                       
                       ctx.fillStyle = 'rgba(0,0,0,0.5)'; // Text Shadow
                       ctx.font = 'bold 24px Arial';
                       ctx.textAlign = 'center';
                       ctx.textBaseline = 'middle';
                       ctx.fillText(tile.statusLife.toString(), centerX + 1, centerY + 2);

                       ctx.fillStyle = '#334155'; // Dark engraved look
                       ctx.fillText(tile.statusLife.toString(), centerX, centerY);
                  }

              } else {
                  // --- STANDARD TILE DRAWING ---
                  // Shadow
                  if (!tile.isMatched && !isDragging) {
                      ctx.fillStyle = 'rgba(0,0,0,0.2)';
                      ctx.beginPath();
                      drawRoundedRect(ctx, xPos, yPos + 4, innerSize, innerSize, cornerRadius);
                      ctx.fill();
                  }
                  
                  // Body
                  ctx.fillStyle = fillColor;
                  ctx.beginPath();
                  drawRoundedRect(ctx, xPos, yPos, innerSize, innerSize, cornerRadius);
                  ctx.fill();
                  
                  if ((tile.isMatched && isComboActive) || isHighlighted) {
                       ctx.strokeStyle = '#fff';
                       ctx.lineWidth = 4;
                       ctx.shadowColor = 'white';
                       ctx.shadowBlur = isHighlighted ? 20 : 10;
                  } else {
                       ctx.strokeStyle = selectedTileId === tile.id ? '#facc15' : borderColor;
                       ctx.lineWidth = selectedTileId === tile.id ? 4 : 3;
                       if (selectedTileId === tile.id) {
                            ctx.shadowColor = 'rgba(250, 204, 21, 0.6)';
                            ctx.shadowBlur = 10;
                       }
                  }
                  
                  ctx.stroke();
                  ctx.shadowBlur = 0; 
                  ctx.shadowColor = 'transparent';

                  const centerX = drawX + pSize / 2;
                  const centerY = drawY + pSize / 2;
                  ctx.fillStyle = '#ffffff';

                  if (tile.status === 'rock') {
                       ctx.font = `${innerSize * 0.6}px Arial`;
                       ctx.textAlign = 'center';
                       ctx.textBaseline = 'middle';
                       ctx.fillText("🪨", centerX, centerY);
                  } else {
                      if (tile.image && imageCache.current[tile.image] && imageCache.current[tile.image].complete) {
                           const img = imageCache.current[tile.image];
                           const imgSize = innerSize * 0.85;
                           ctx.drawImage(img, centerX - imgSize/2, centerY - imgSize/2, imgSize, imgSize);
                      } else {
                           ctx.font = `${innerSize * 0.6}px "Fredoka", Arial`; 
                           ctx.textAlign = 'center';
                           ctx.textBaseline = 'middle';
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
                      }
                  }
              }
              
              ctx.restore();
          };

          // --- UPDATE LOGIC ---
          board.forEach(tile => {
              const visual = animState.current[tile.id];
              if (!visual) return;
              
              const isDragging = dragState?.id === tile.id;

              if (!isDragging && !isFrozen) {
                  let moving = false;
                  const diffX = tile.x - visual.x;
                  if (Math.abs(diffX) > 0.01) { visual.x += Math.sign(diffX) * 0.25; moving = true; } 
                  else { visual.x = tile.x; }

                  const diffY = tile.y - visual.y;
                  if (Math.abs(diffY) > SETTLE_THRESHOLD) {
                      if (Math.abs(diffY) <= MOVE_SPEED) { visual.y = tile.y; } 
                      else { visual.y += Math.sign(diffY) * MOVE_SPEED; }
                      moving = true;
                  } else {
                      if (visual.y !== tile.y) { visual.y = tile.y; visual.scaleX = 1.35; visual.scaleY = 0.75; }
                  }
                  
                  // Zoom-in / Fade-in logic for new obstacles or spawns
                  if (visual.scaleX < 1 && !tile.isMatched) {
                      visual.scaleX += 0.1;
                      visual.scaleY += 0.1;
                      visual.opacity += 0.1;
                      if (visual.scaleX > 1) visual.scaleX = 1;
                      if (visual.opacity > 1) visual.opacity = 1;
                      moving = true; 
                  }

                  if (moving) globalIsMoving = true;

                  if (tile.isMatched && tile.status !== 'ice') {
                      // NEW MATCH ANIMATION: Pop -> Shrink
                      if (!visual.matchStartTime) visual.matchStartTime = Date.now();
                      const elapsed = Date.now() - visual.matchStartTime;
                      
                      // Phase 1: Pop (0-150ms)
                      if (elapsed < 150) {
                           const progress = elapsed / 150;
                           visual.scaleX = 1 + (progress * 0.3); // Grow to 1.3
                           visual.scaleY = 1 + (progress * 0.3);
                           visual.rotation = 0;
                           visual.opacity = 1;
                      } 
                      // Phase 2: Shrink (150ms-400ms)
                      else {
                           const progress = Math.min(1, (elapsed - 150) / 250);
                           visual.scaleX = 1.3 - (progress * 1.3); // Shrink to 0
                           visual.scaleY = 1.3 - (progress * 1.3);
                           visual.opacity = 1 - progress;
                      }
                  } else {
                      // Return to normal
                      if (Math.abs(visual.scaleX - 1) > 0.01) {
                          visual.scaleX += (1 - visual.scaleX) * 0.2; 
                          visual.scaleY += (1 - visual.scaleY) * 0.2;
                      } else { visual.scaleX = 1; visual.scaleY = 1; }
                      visual.opacity = Math.min(1, visual.opacity + 0.1); 
                      visual.rotation = 0;
                  }
              }
              
              if (isDragging) {
                  draggedTileData = { tile, visual };
              } else {
                  drawTile(tile, visual, false);
              }
          });

          if (draggedTileData) drawTile(draggedTileData.tile, draggedTileData.visual, true);
          
          if (particlesRef.current.length > 0) {
              // Particles update, but they do NOT set globalIsMoving to true anymore.
              // This fixes the freeze where long particles prevented game logic from proceeding.
              for (let i = particlesRef.current.length - 1; i >= 0; i--) {
                  const p = particlesRef.current[i];
                  p.x += p.vx;
                  p.y += p.vy;
                  p.vy += 0.005; // Gravity
                  p.life -= 0.02;

                  if (p.life <= 0) {
                      particlesRef.current.splice(i, 1);
                  } else {
                      const screenX = p.x * pSize;
                      const screenY = p.y * (rect.height / GRID_HEIGHT);
                      const sizePx = p.size * pSize;

                      ctx.fillStyle = p.color;
                      ctx.globalAlpha = p.life;
                      ctx.beginPath();
                      if (p.type === 'snow') {
                           ctx.arc(screenX, screenY, sizePx/2, 0, Math.PI * 2);
                      } else if (p.type === 'spark') {
                           ctx.rect(screenX, screenY, sizePx/3, sizePx);
                      } else {
                           ctx.rect(screenX, screenY, sizePx, sizePx);
                      }
                      ctx.fill();
                      ctx.globalAlpha = 1;
                  }
              }
          }

          if (isMovingRef.current && !globalIsMoving) {
              if (onBoardSettled && !settleTimeoutRef.current) {
                  settleTimeoutRef.current = setTimeout(() => {
                      if (safetySettlementRef.current) clearTimeout(safetySettlementRef.current); // Clear safety if normal settled triggers
                      onBoardSettled();
                      settleTimeoutRef.current = null;
                  }, 50);
              }
          }
          isMovingRef.current = globalIsMoving;

          animationFrameId = requestAnimationFrame(render);
      };

      render();
      return () => cancelAnimationFrame(animationFrameId);
  }, [board, selectedTileId, dragState, shake, isFrozen, onBoardSettled, isComboActive, highlightedTileIds]);

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
          setDragState({ id: tile.id, startX: e.clientX, startY: e.clientY, currX: e.clientX, currY: e.clientY });
          (e.target as Element).setPointerCapture(e.pointerId);
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
      } else if (containerRef.current) {
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
        <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export default Board;