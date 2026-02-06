import React, { useState, useEffect, useCallback, useRef } from 'react';
import Board from './components/Board';
import BossCard from './components/BossCard';
import AttackProjectile from './components/Beam';
import TeamSelector from './components/TeamSelector';
import MainMenu from './components/MainMenu';
import CaptureModal from './components/CaptureModal';
import { GameState, TileData, Boss, FloatingText, ElementType, SkillType, GRID_WIDTH, GRID_HEIGHT, ProjectileData } from './types';
import { createBoard, findMatches, applyGravity, applyInterference, MatchGroup, hasPossibleMoves } from './utils/gameLogic';
import { MONSTER_DB, INITIAL_MOVES, MOVES_PER_LEVEL, TYPE_CHART, getLevelBackground, SECRET_BOSS, TYPE_PROJECTILE_ICONS } from './constants';
import { soundManager } from './utils/sound';
import { Skull, Zap, RotateCcw, X, LogOut, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<GameState['status']>('menu');
  const [level, setLevel] = useState(1);
  const [movesLeft, setMovesLeft] = useState(INITIAL_MOVES);
  const [movesAtStart, setMovesAtStart] = useState(INITIAL_MOVES);
  const [collection, setCollection] = useState<Boss[]>([MONSTER_DB[0], MONSTER_DB[1], MONSTER_DB[2], MONSTER_DB[3]]);
  const [team, setTeam] = useState<Boss[]>([MONSTER_DB[0], MONSTER_DB[1], MONSTER_DB[2], MONSTER_DB[3]]);
  const [isFinalBossMode, setIsFinalBossMode] = useState(false);
  const [levelPlan, setLevelPlan] = useState<Boss[]>([]);
  
  const [nextPreviewEnemy, setNextPreviewEnemy] = useState<Boss>(MONSTER_DB[4]); 
  const [board, setBoard] = useState<TileData[]>([]);
  const [enemy, setEnemy] = useState<Boss>(MONSTER_DB[4]);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  
  // Interference Logic
  const [turnsToInterference, setTurnsToInterference] = useState(3);
  const [bossAttacking, setBossAttacking] = useState(false); 
  const [pendingInterference, setPendingInterference] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [stageCleared, setStageCleared] = useState(false); 
  const [showFinishMessage, setShowFinishMessage] = useState(false);
  const [isResettingBoard, setIsResettingBoard] = useState(false);
  
  const [comboCount, setComboCount] = useState(0);
  const [skillCharges, setSkillCharges] = useState<Record<string, number>>({});
  const [showSkillMenu, setShowSkillMenu] = useState(false);
  
  // --- NEW SKILL ANIMATION STATES ---
  const [skillAnnouncement, setSkillAnnouncement] = useState<string | null>(null);
  const [animatingSkillBoss, setAnimatingSkillBoss] = useState<Boss | null>(null);
  const [highlightedTileIds, setHighlightedTileIds] = useState<string[]>([]);

  const [victoryAnim, setVictoryAnim] = useState(false);
  const [isDefeatedAnim, setIsDefeatedAnim] = useState(false); 
  
  const [bossShake, setBossShake] = useState(false);
  const [boardShake, setBoardShake] = useState(false); 
  const [lastDamage, setLastDamage] = useState<number | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [projectiles, setProjectiles] = useState<ProjectileData[]>([]);
  const [captureCaught, setCaptureCaught] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [hitEffect, setHitEffect] = useState(false); 
  
  const [viewingMonster, setViewingMonster] = useState<Boss | null>(null);
  const [showQuitConfirmation, setShowQuitConfirmation] = useState(false);

  const bossRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  
  const comboRef = useRef(0);
  const boardRefState = useRef<TileData[]>([]); 
  const isEvaluatorBusyRef = useRef(false); 
  const finishTriggeredRef = useRef(false); // Prevents multiple "YA ESTÁ"

  // SAFETY WATCHDOG REF
  const processingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
      boardRefState.current = board;
  }, [board]);
  
  // Resume game loop after finish message disappears
  useEffect(() => {
      if (!showFinishMessage && finishTriggeredRef.current) {
           setTimeout(() => evaluateBoardState(), 100);
      }
  }, [showFinishMessage]);

  // --- EMERGENCY WATCHDOG ---
  // Improved Logic: Only trigger if the game is truly STUCK.
  // We reset the timer every time the board changes or combo increases, ensuring it doesn't interrupt valid long combos.
  useEffect(() => {
      if (isProcessing && !showFinishMessage && !animatingSkillBoss) {
          if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current);
          
          processingTimeoutRef.current = setTimeout(() => {
              console.warn("Safety Watchdog Triggered: Unfreezing board & Resetting State");
              
              // 1. Unfreeze state
              setIsProcessing(false);
              isEvaluatorBusyRef.current = false;
              
              // 2. FORCE UI CLEANUP (Fixes stuck dark screen)
              // Since we determined the game is stuck, we MUST clear visual artifacts.
              setComboCount(0);
              comboRef.current = 0;
              setHighlightedTileIds([]);
              
              // 3. FAILSAFE: If enemy is dead but game stuck, force victory
              if (enemy.currentHp <= 0) {
                   console.warn("Watchdog: Enemy dead, forcing victory sequence.");
                   handleVictorySequence();
              }

          }, 6000); // Increased to 6s to be safe
      } else {
          if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current);
      }
      return () => {
          if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current);
      };
      // CRITICAL: Added 'board' and 'comboCount' to dependencies so the timer resets during active gameplay
  }, [isProcessing, showFinishMessage, animatingSkillBoss, enemy.currentHp, board, comboCount]);

// --- AÑADIR ESTE EFFECT NUEVO ---
  // Esto actúa como un seguro: si el juego te devuelve el control,
  // se asegura al 100% de que la oscuridad desaparezca.
  useEffect(() => {
      if (!isProcessing && (comboCount > 0 || comboRef.current > 0)) {
          setComboCount(0);
          comboRef.current = 0;
          setHighlightedTileIds([]);
      }
  }, [isProcessing, comboCount]);

  const enterFullscreen = () => {
      try {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => console.log(err));
        }
      } catch (e) { console.log("Fullscreen not supported"); }
  };

  const scaleEnemyHp = (baseEnemy: Boss, lvl: number, isFinal: boolean): Boss => {
      let scaledHp = baseEnemy.maxHp;
      if (isFinal) {
          scaledHp = 40000;
      } else if (lvl === 10 || lvl === 20 || lvl === 30) {
          scaledHp = baseEnemy.maxHp; 
      } else {
          scaledHp = 800 + (lvl * 320);
      }
      return { ...baseEnemy, maxHp: scaledHp, currentHp: scaledHp };
  };

  const handleStartArcade = () => {
      enterFullscreen();
      setIsFinalBossMode(false);
      const fixedBossIds = ["m010", "m020", "m030"];
      const nonBosses = MONSTER_DB.filter(m => !fixedBossIds.includes(m.id));
      for (let i = nonBosses.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [nonBosses[i], nonBosses[j]] = [nonBosses[j], nonBosses[i]];
      }
      const plan: Boss[] = [];
      let nonBossIdx = 0;
      for (let i = 1; i <= 30; i++) {
          if (i === 10) plan.push(MONSTER_DB.find(m => m.id === "m010")!);
          else if (i === 20) plan.push(MONSTER_DB.find(m => m.id === "m020")!);
          else if (i === 30) plan.push(MONSTER_DB.find(m => m.id === "m030")!);
          else {
              if (nonBossIdx < nonBosses.length) {
                  plan.push(nonBosses[nonBossIdx]);
                  nonBossIdx++;
              } else {
                  plan.push(nonBosses[0]); 
              }
          }
      }
      setLevelPlan(plan);
      setLevel(1);
      setNextPreviewEnemy(scaleEnemyHp(plan[0], 1, false)); 
      setMovesLeft(INITIAL_MOVES);
      setMovesAtStart(INITIAL_MOVES);
      setAppState('team_select');
      setSkillCharges({});
  };

  const handleStartFinalBoss = () => {
      enterFullscreen();
      setIsFinalBossMode(true);
      const startLvl = 999;
      setLevel(startLvl);
      setNextPreviewEnemy(scaleEnemyHp(SECRET_BOSS, startLvl, true));
      setMovesLeft(20);
      setMovesAtStart(20);
      setAppState('team_select');
      setSkillCharges({});
  }

  const handleOpenGallery = () => {
      enterFullscreen();
      setAppState('gallery');
  };

  const handleQuitToMenu = () => {
      soundManager.playButton();
      setShowQuitConfirmation(true);
  };

  const confirmQuit = () => {
      soundManager.playButton();
      setShowQuitConfirmation(false);
      setAppState('menu');
  };

  const startLevel = () => {
      // 1. Resetear estados visuales CRÍTICOS antes de nada
      setIsDefeatedAnim(false); 
      setVictoryAnim(false);
      setStageCleared(false);
      setShowFinishMessage(false);
      setComboCount(0); // Asegurar que no hay oscuridad
      comboRef.current = 0;
      setSkillAnnouncement(null);
      setAnimatingSkillBoss(null);
      setHighlightedTileIds([]);
      setBossAttacking(false);
      setHitEffect(false);
      
      // 2. Configurar lógica del nivel
      setEnemy(nextPreviewEnemy);
      setMovesAtStart(movesLeft);
      setBoard(createBoard(team));
      setSkillCharges({});
      setTurnsToInterference(Math.floor(Math.random() * 3) + 2); 
      
      // 3. Resetear flags de lógica
      setIsProcessing(false);
      setPendingInterference(false);
      isEvaluatorBusyRef.current = false; 
      finishTriggeredRef.current = false;
      setImgError(false);
      setIsResettingBoard(false);
      
      // 4. Cambiar pantalla
      setAppState('playing');
  };

  const handleCaptureResult = (caught: boolean) => {
      setCaptureCaught(caught);
      if (caught) {
          if (!collection.find(m => m.name === enemy.name)) {
             setCollection(prev => [...prev, { ...enemy, currentHp: enemy.maxHp, id: enemy.id + '_caught_' + Date.now() }]);
          }
          setAppState('captured_info');
      } else {
          advanceLevel();
      }
  };

  const advanceLevel = () => {
      if (isFinalBossMode) {
          soundManager.playWin();
          setAppState('victory'); 
          return;
      }
      if (level >= 30) {
          soundManager.playWin();
          setAppState('victory'); 
      } else {
          const nextLvl = level + 1;
          setLevel(nextLvl);
          const baseEnemy = levelPlan[nextLvl - 1]; 
          setNextPreviewEnemy(scaleEnemyHp(baseEnemy, nextLvl, false));
          setMovesLeft(m => m + MOVES_PER_LEVEL);
          setAppState('team_select');
      }
  };

  const applyDamage = (amount: number) => {
      if (amount <= 0) return;
      setLastDamage(amount);
      setBossShake(true);
      setHitEffect(true); 
      setTimeout(() => { setBossShake(false); setLastDamage(null); setHitEffect(false); }, 200);
      setEnemy(prev => {
          const newHp = Math.max(0, prev.currentHp - amount);
          return { ...prev, currentHp: newHp };
      });
  };

  // --- MAIN GAME LOOP ---
  const evaluateBoardState = async () => {
      if (showFinishMessage) return;
      if (isEvaluatorBusyRef.current) return;
      isEvaluatorBusyRef.current = true;

      try {
          const currentBoard = boardRefState.current;
          const { groups } = findMatches(currentBoard);
          
          // Variable local para rastrear la vida en tiempo real dentro de este ciclo
          let liveHp = enemy.currentHp;

          // -- CASO 1: HAY COINCIDENCIAS --
          if (groups.length > 0) {
              const tileCounts = new Map<string, number>();
              groups.forEach(g => g.ids.forEach(id => tileCounts.set(id, (tileCounts.get(id) || 0) + 1)));
              
              // Lógica de intersecciones (Bombas, T, L)
              const intersectionIds = new Set<string>();
              tileCounts.forEach((count, id) => { if (count > 1) intersectionIds.add(id); });

              const groupsToProcess = [...groups].sort((a, b) => {
                  const aHasIntersect = a.ids.some(id => intersectionIds.has(id));
                  const bHasIntersect = b.ids.some(id => intersectionIds.has(id));
                  if (aHasIntersect && !bHasIntersect) return -1;
                  if (!aHasIntersect && bHasIntersect) return 1;
                  return 0;
              });

              const allIdsForGravity = new Set<string>();
              const accumulatedMatchedIds = new Set<string>(); 
              const accumulatedUnfrozenIds = new Set<string>();

              let localCombo = comboRef.current;

              for (const group of groupsToProcess) {
                if (showFinishMessage) break;

                // Si ya matamos al enemigo en un paso anterior del bucle, paramos efectos visuales innecesarios
                // pero terminamos de procesar el tablero para que caigan las fichas
                const isAlreadyDead = liveHp <= 0;

                const attacker = team.find(m => m.id === group.type);
                const size = group.ids.length; 
                
                // Procesar IDs
                const groupIdsToUnfreeze = new Set<string>();
                group.ids.forEach(id => {
                    const tile = currentBoard.find(t => t.id === id);
                    if (tile?.status === 'ice') {
                        groupIdsToUnfreeze.add(id);
                        accumulatedUnfrozenIds.add(id);
                    } else {
                        allIdsForGravity.add(id);
                    }
                    accumulatedMatchedIds.add(id);
                });
                group.idsToDestroy?.forEach(id => {
                    allIdsForGravity.add(id);
                    accumulatedMatchedIds.add(id);
                });

                // CÁLCULO DE DAÑO
                if (attacker) {
                    setSkillCharges(prev => ({ ...prev, [attacker.id]: Math.min(attacker.skillCost, (prev[attacker.id] || 0) + size) }));
                    
                    const baseAttack = 100;
                    let dmg = baseAttack * (1 + (size - 3) * 0.5);
                    if (TYPE_CHART[attacker.type].includes(enemy.type)) dmg *= 1.5;
                    
                    // Bonus de combo
                    if (localCombo > 20) dmg *= 2;
                    else if (localCombo > 8) dmg *= 1.5;
                    dmg = Math.floor(dmg);

                    // Solo hacemos efectos visuales de daño si el enemigo "sigue vivo" visualmente
                    if (!isAlreadyDead) {
                        const colorMap: Record<string, string> = { 'Fuego': '#ef4444', 'Agua': '#3b82f6', 'Planta': '#22c55e', 'Eléctrico': '#eab308' };
                        const centerTile = group.center; 
                        addFloatingText(centerTile.x, centerTile.y, `${dmg}`, colorMap[attacker.type] || 'white');

                        const projectileCount = 5;
                        for(let i=0; i<projectileCount; i++) {
                            setTimeout(() => {
                                    fireProjectile(centerTile.x, centerTile.y, colorMap[attacker.type] || 'white');
                            }, i * 40);
                        }

                        // Aplicar daño REAL al estado y a la variable local
                        setTimeout(() => {
                                if (dmg > 0) applyDamage(dmg);
                        }, 500 + (projectileCount * 40));
                        
                        liveHp -= dmg; // Actualizamos la variable local para saber que murió AHORA MISMO
                    }
                }
                
                localCombo++;
                comboRef.current = localCombo;
                setComboCount(localCombo);
                soundManager.playMatch(localCombo);
                
                // Actualizar tablero visualmente (Matches)
                setBoard(prev => prev.map(t => {
                    if (accumulatedMatchedIds.has(t.id)) {
                         if (t.status === 'ice') return t;
                         return { ...t, isMatched: true };
                    }
                    if (groupIdsToUnfreeze.has(t.id) || accumulatedUnfrozenIds.has(t.id)) {
                        return { ...t, status: 'normal' };
                    }
                    return t;
                }));

                await new Promise(r => setTimeout(r, 250));
              }
              
              // --- FASE DE CAÍDA (Gravity) ---
              await new Promise(r => setTimeout(r, 200)); 

              const boardWithUnfrozen = currentBoard.map(t => {
                  if (accumulatedUnfrozenIds.has(t.id)) return { ...t, status: 'normal' as const, isMatched: false };
                  return t;
              });

              const boardAfterFall = applyGravity(boardWithUnfrozen, Array.from(allIdsForGravity), team);
              setBoard(boardAfterFall);
              
              // IMPORTANTE: Si liveHp (nuestra variable local) llegó a 0, NO esperamos al siguiente ciclo.
              // Forzamos la verificación de victoria AHORA.
              if (liveHp <= 0) {
                   setTimeout(() => evaluateBoardState(), 100); // Llamada recursiva rápida para que entre en el Caso 2 inmediatamente
              }
              
              return; 
          }

          // -- CASO 2: NO HAY MÁS COINCIDENCIAS (Estado Estable) --

          // VICTORIA CHECK (Usamos liveHp o enemy.currentHp, lo que sea menor)
          const effectiveHp = Math.min(liveHp, enemy.currentHp);
          
          if (effectiveHp <= 0) {
              setComboCount(0); // Apagar luces
              comboRef.current = 0;
              setHighlightedTileIds([]); 

              if (!finishTriggeredRef.current) {
                   finishTriggeredRef.current = true;
                   setShowFinishMessage(true);
                   setTimeout(() => setShowFinishMessage(false), 2000);
              }
              
              await new Promise(r => setTimeout(r, 1000));
              handleVictorySequence();
              return;
          }

          // INTERFERENCIA
          if (pendingInterference && effectiveHp > 0) {
              setPendingInterference(false); 
              setBossAttacking(true);
              soundManager.playThrow();
              
              // Limpiar combo visual antes de interferencia
              setComboCount(0);
              comboRef.current = 0;
              
              setTimeout(() => {
                  const interferedBoard = applyInterference(currentBoard, enemy.type);
                  setBoard(interferedBoard);
                  setBoardShake(true);
                  setTimeout(() => {
                      setBoardShake(false);
                      setBossAttacking(false);
                  }, 300);
              }, 600);
              return;
          }

          // FIN DE TURNO (Devolver control)
          let nextBoard = currentBoard;
          
          if (!hasPossibleMoves(nextBoard)) {
              setIsResettingBoard(true);
              setComboCount(0);
              setTimeout(() => {
                  setBoard(createBoard(team));
                  setIsResettingBoard(false);
                  setIsProcessing(false);
              }, 1000);
          } else {
              // AQUÍ: Si llegamos al final y el enemigo vive, soltamos el control
              setIsProcessing(false);
              // El useEffect que añadimos arriba se encargará de limpiar el comboCount si quedó sucio
          }

          // GAME OVER
          if (movesLeft <= 0 && effectiveHp > 0) {
              setAppState('gameover');
              soundManager.playLose();
          }

      } catch(e) {
          console.error("Board Error:", e);
          setIsProcessing(false);
          setComboCount(0);
      } finally {
          isEvaluatorBusyRef.current = false;
      }
  };

  const handleBoardSettled = () => {
      // Resume loop if board stops moving
      if (isProcessing && !showFinishMessage) {
          evaluateBoardState();
      }
  };

  const handleVictorySequence = async () => {
      // Asegurar limpieza visual una última vez
      setComboCount(0);
      comboRef.current = 0;
      setHighlightedTileIds([]);
      
      setIsDefeatedAnim(true);
      await new Promise(r => setTimeout(r, 1500));
      
      setIsProcessing(false);
      
      if (isFinalBossMode) setAppState('victory');
      else if (collection.some(m => m.name === enemy.name)) advanceLevel();
      else setAppState('capture');
  }

  const handleMove = async (id: string, targetX: number, targetY: number) => {
    if (isProcessing || movesLeft <= 0 || showFinishMessage || enemy.currentHp <= 0) return;

    const sourceTile = board.find(t => t.id === id);
    if (!sourceTile) return;

    if (sourceTile.x === targetX && sourceTile.y === targetY) {
         setSelectedTileId(prev => prev === id ? null : id); 
         return; 
    }

    const targetTile = board.find(t => t.x === targetX && t.y === targetY);
    if (sourceTile.status !== 'normal' || (targetTile && targetTile.status !== 'normal')) return; 
    
    let tempBoard = [...board];
    if (targetTile) {
        tempBoard = tempBoard.map(t => {
            if (t.id === sourceTile.id) return { ...t, x: targetX, y: targetY };
            if (t.id === targetTile.id) return { ...t, x: sourceTile.x, y: sourceTile.y };
            return t;
        });
    } else {
        tempBoard = tempBoard.map(t => t.id === sourceTile.id ? { ...t, x: targetX, y: targetY } : t);
    }

    const { groups } = findMatches(tempBoard);
    
    if (groups.length > 0) {
        soundManager.playSwap();
        setMovesLeft(prev => prev - 1);
        setSelectedTileId(null);
        
        // --- STEEL DECAY LOGIC (IRON BLOCKS) ---
        // Decrement life of all steel blocks by 1 on every valid move
        tempBoard = tempBoard.map(t => {
            if (t.status === 'steel' && t.statusLife !== undefined) {
                const newLife = t.statusLife - 1;
                if (newLife <= 0) {
                    // Break the steel: replace with a random monster from current team
                    const randomMonster = team[Math.floor(Math.random() * team.length)];
                    return {
                        ...t,
                        status: 'normal',
                        statusLife: undefined,
                        monsterId: randomMonster.id,
                        type: randomMonster.type,
                        emoji: randomMonster.emoji,
                        image: randomMonster.image
                    };
                }
                return { ...t, statusLife: newLife };
            }
            return t;
        });

        setBoard(tempBoard);
        setIsProcessing(true); 
        comboRef.current = 0; 
        
        // --- COUNTDOWN INTERFERENCE HERE ---
        // Only on valid moves
        setTurnsToInterference(prev => {
            const next = prev - 1;
            if (next <= 0) {
                setPendingInterference(true);
                // Reset timer for next cycle
                return Math.floor(Math.random() * 3) + 2;
            }
            return next;
        });

    } else {
        setBoard(tempBoard); 
        soundManager.playSwap(); 
        await new Promise(r => setTimeout(r, 250));
        setBoard(board); 
    }
  };

  const executeSkill = async (monster: Boss) => {
     if (skillCharges[monster.id] < monster.skillCost || enemy.currentHp <= 0) return;
     soundManager.playButton();
     setShowSkillMenu(false);
     setSkillCharges(prev => ({...prev, [monster.id]: 0}));
     setIsProcessing(true);
     comboRef.current = 0; // Reset combo counter at start of skill
     soundManager.playBeam();

     // --- STEP 1: SKILL ANNOUNCEMENT (1.8s) ---
     setSkillAnnouncement(`${monster.name} usó ${monster.skillName}`);
     await new Promise(r => setTimeout(r, 1800));
     setSkillAnnouncement(null);

     // --- STEP 2: BIG BOSS ANIMATION (2s - Longer) ---
     setAnimatingSkillBoss(monster);
     await new Promise(r => setTimeout(r, 2000));
     setAnimatingSkillBoss(null);

     // --- STEP 3: LOGIC CALCULATION & HIGHLIGHTING (1s) ---
     let amount = 4;
     if (monster.skillCost >= 14) amount = 5;
     if (monster.skillCost >= 18) amount = 6;
     if (monster.skillCost >= 25) amount = 8;
     
     let newBoard = [...board];
     let physicsTriggered = false;
     let tilesToRemove: string[] = [];
     let highlightedIds: string[] = [];

     if (monster.skillType === 'nuke') {
         // Nuke doesn't target tiles, it just hits the boss
         let dmg = 2000;
         if (monster.skillCost >= 25) dmg = 3500;
         fireProjectile(GRID_WIDTH/2, GRID_HEIGHT/2, 'yellow');
         
         await new Promise(r => setTimeout(r, 600));
         applyDamage(dmg);
         addFloatingText(GRID_WIDTH/2, GRID_HEIGHT/2, `¡${dmg}!`, 'yellow', 2);
         
         // Trigger evaluation to check death
         setTimeout(() => evaluateBoardState(), 400);
         return; 
     } 
     else {
         if (monster.skillType === 'clear_rocks') {
             const rocks = newBoard.filter(t => t.status === 'rock');
             const targets = rocks.sort(() => 0.5 - Math.random()).slice(0, amount);
             targets.forEach(t => tilesToRemove.push(t.id));
             highlightedIds = targets.map(t => t.id);
             if (tilesToRemove.length > 0) physicsTriggered = true;
         } 
         else if (monster.skillType === 'clear_ice') {
             const ice = newBoard.filter(t => t.status === 'ice');
             const targets = ice.sort(() => 0.5 - Math.random()).slice(0, amount);
             if (targets.length > 0) {
                 const targetIds = new Set(targets.map(t => t.id));
                 // For ice, we convert them to normal in board immediately but highlight them
                 highlightedIds = targets.map(t => t.id);
                 newBoard = newBoard.map(t => targetIds.has(t.id) ? { ...t, status: 'normal' } : t);
                 physicsTriggered = true; 
             }
         }
         else if (monster.skillType === 'clear_steel') {
             const steel = newBoard.filter(t => t.status === 'steel');
             const targets = steel.sort(() => 0.5 - Math.random()).slice(0, amount);
             targets.forEach(t => tilesToRemove.push(t.id));
             highlightedIds = targets.map(t => t.id);
             if (tilesToRemove.length > 0) physicsTriggered = true;
         }
         else if (monster.skillType === 'clear_random') {
             const targets = newBoard.sort(() => 0.5 - Math.random()).slice(0, amount);
             targets.forEach(t => tilesToRemove.push(t.id));
             highlightedIds = targets.map(t => t.id);
             if (tilesToRemove.length > 0) physicsTriggered = true;
         }
         else if (monster.skillType === 'clear_self') {
             const selfTiles = newBoard.filter(t => t.monsterId === monster.id && t.status === 'normal');
             const targets = selfTiles.sort(() => 0.5 - Math.random()).slice(0, amount + 1);
             targets.forEach(t => tilesToRemove.push(t.id));
             highlightedIds = targets.map(t => t.id);
             if (tilesToRemove.length > 0) physicsTriggered = true;
         }
         else if (monster.skillType === 'convert_type') {
             const candidates = newBoard.filter(t => t.monsterId !== monster.id && t.status === 'normal');
             const targets = candidates.sort(() => 0.5 - Math.random()).slice(0, amount);
             if (targets.length > 0) {
                 const targetIds = new Set(targets.map(t => t.id));
                 highlightedIds = targets.map(t => t.id);
                 newBoard = newBoard.map(t => targetIds.has(t.id) ? { ...t, monsterId: monster.id, type: monster.type, emoji: monster.emoji, image: monster.image } : t);
                 physicsTriggered = true;
             }
         }
         
         // APPLY BOARD STATE (Visual update before physics)
         setBoard(newBoard);

         // HIGHLIGHT AFFECTED TILES (1s)
         if (highlightedIds.length > 0) {
             setHighlightedTileIds(highlightedIds);
             await new Promise(r => setTimeout(r, 1000));
             setHighlightedTileIds([]);
         }

         // --- STEP 4: EXECUTION (Physics) ---
         if (tilesToRemove.length > 0) {
             // First mark as matched (implode effect if supported or just visual prep)
             setBoard(prev => prev.map(t => tilesToRemove.includes(t.id) ? { ...t, isMatched: true } : t));
             await new Promise(r => setTimeout(r, 300));
             
             // Then apply gravity
             const boardAfterFall = applyGravity(newBoard, tilesToRemove, team);
             setBoard(boardAfterFall);
         } else if (physicsTriggered) {
             // Case: Status changed (e.g. Ice -> Normal) but no removal. 
             // We MUST apply gravity to fill any gaps that might exist below newly normalized tiles.
             const boardAfterFall = applyGravity(newBoard, [], team);
             setBoard(boardAfterFall);
         }
         
         // FORCE RE-EVALUATION to ensure gravity/matches apply even if no tiles were removed (e.g. ice melt)
         setTimeout(() => evaluateBoardState(), 400);
     }
  };

  const addFloatingText = (x: number, y: number, text: string, color: string = 'white', scale: number = 1) => {
      const id = Date.now() + Math.random().toString();
      setFloatingTexts(prev => [...prev, { id, x, y, text, color, scale }]);
      setTimeout(() => setFloatingTexts(prev => prev.filter(ft => ft.id !== id)), 1000);
  };
  
  const fireProjectile = (gridX: number, gridY: number, color: string, icon?: string) => {
      if (boardRef.current) {
          const rect = boardRef.current.getBoundingClientRect();
          const startX = rect.left + (gridX + 0.5) * (rect.width / 6);
          const startY = rect.top + (gridY + 0.5) * (rect.height / 6);
          const targetX = window.innerWidth / 2;
          const targetY = window.innerHeight * 0.22; 
          const id = Date.now() + Math.random().toString();
          setProjectiles(prev => [...prev, { id, startX, startY, targetX, targetY, color, icon, startTime: Date.now() }]);
          setTimeout(() => setProjectiles(prev => prev.filter(p => p.id !== id)), 500); 
      }
  };

  const anySkillReady = team.some(m => (skillCharges[m.id] || 0) >= m.skillCost);

  return (
    <div className={`h-screen w-screen bg-black flex overflow-hidden font-sans select-none text-slate-100 relative`}>
      <div className={`absolute inset-0 z-0 transition-all duration-700 ease-in-out ${getLevelBackground(level, enemy.type)}`}></div>

      {appState === 'menu' && (
          <MainMenu 
            onStartArcade={handleStartArcade} 
            onOpenGallery={handleOpenGallery} 
            collectionSize={collection.length}
            onStartFinalBoss={handleStartFinalBoss}
          />
      )}
      
      <div className="absolute inset-0 pointer-events-none z-[60] overflow-visible">
          {projectiles.map(p => (
              <AttackProjectile 
                key={p.id}
                startX={p.startX}
                startY={p.startY}
                targetX={p.targetX}
                targetY={p.targetY}
                color={p.color}
              />
          ))}
          
          {floatingTexts.map(ft => {
              let left = 0, top = 0;
              if (boardRef.current) {
                  const rect = boardRef.current.getBoundingClientRect();
                  left = rect.left + (ft.x + 0.5) * (rect.width / 6);
                  top = rect.top + (ft.y + 0.5) * (rect.height / 6);
              }
              
              return (
                  <div 
                      key={ft.id}
                      className="absolute font-black text-3xl md:text-4xl damage-float text-shadow-heavy font-sans"
                      style={{
                          left: left,
                          top: top,
                          transform: 'translate(-50%, -50%)',
                          color: ft.color,
                          textShadow: '0 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
                      }}
                  >
                      {ft.text}
                  </div>
              );
          })}
      </div>

      {appState === 'gallery' && (
          <div className="absolute inset-0 z-50 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black p-4 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-white">MONSTEMOJIS</h2>
                  <button onClick={() => { soundManager.playButton(); setAppState('menu'); }} className="bg-slate-700 p-2 rounded-full"><X /></button>
              </div>
              <div className="grid grid-cols-4 gap-2 overflow-y-auto pb-20 no-scrollbar">
                  {collection.map(m => (
                      <div 
                        key={m.id} 
                        onClick={() => { soundManager.playButton(); setViewingMonster(m); }}
                        className="bg-slate-800 p-2 rounded-xl flex flex-col items-center border border-slate-700 active:scale-95 transition-transform"
                      >
                          <div className="w-12 h-12 flex items-center justify-center">
                            {m.image ? <img src={m.image} className="w-full h-full object-contain" /> : <span className="text-3xl">{m.emoji}</span>}
                          </div>
                      </div>
                  ))}
              </div>
              {viewingMonster && (
                  <div className="absolute inset-0 z-[60] bg-black/80 flex items-center justify-center p-4" onClick={() => setViewingMonster(null)}>
                      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-600 max-w-sm w-full relative">
                          <button onClick={() => setViewingMonster(null)} className="absolute top-2 right-2 p-1 bg-slate-700 rounded-full"><X size={16}/></button>
                          <div className="text-center mb-4">
                              <div className="w-40 h-40 mx-auto mb-2 flex items-center justify-center">
                                  {viewingMonster.image ? <img src={viewingMonster.image} className="w-full h-full object-contain" /> : <span className="text-8xl">{viewingMonster.emoji}</span>}
                              </div>
                              <h3 className="text-3xl font-black text-white">{viewingMonster.name}</h3>
                          </div>
                          <p className="text-slate-300 italic text-sm mb-4 text-center">"{viewingMonster.description}"</p>
                      </div>
                  </div>
              )}
          </div>
      )}

      {appState === 'team_select' && (
          <TeamSelector 
            collection={collection} 
            currentTeam={team} 
            onUpdateTeam={setTeam} 
            onStart={startLevel} 
            nextLevel={level}
            nextEnemy={nextPreviewEnemy} 
            movesLeft={movesLeft} 
            onBackToMenu={handleQuitToMenu}
          />
      )}
      
      {appState === 'capture' && (
          <CaptureModal 
             boss={enemy} 
             chance={Math.max(1, 100 - ((Math.max(1, movesAtStart - movesLeft) - 1) * 5))}
             onCaptureEnd={handleCaptureResult}
          />
      )}
      
      {appState === 'captured_info' && (
          <div 
             onClick={() => { soundManager.playButton(); advanceLevel(); }}
             className="absolute inset-0 z-50 bg-indigo-950/95 flex flex-col items-center justify-center p-8 animate-in zoom-in cursor-pointer text-center"
          >
              <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg overflow-y-auto no-scrollbar">
                  <div className="w-48 h-48 mb-6 animate-bounce flex items-center justify-center filter drop-shadow-2xl">
                        {enemy.image && !imgError ? <img src={enemy.image} className="w-full h-full object-contain" /> : <span className="text-9xl">{enemy.emoji}</span>}
                  </div>
                  <h2 className="text-5xl font-black text-white mb-2 tracking-wide text-shadow">{enemy.name}</h2>
                  <div className="bg-white/10 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest text-indigo-200 mb-6 border border-white/20">
                      Tipo: {enemy.type}
                  </div>
                  
                  <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 backdrop-blur w-full mb-4">
                      <p className="text-slate-200 text-lg italic leading-relaxed mb-4">"{enemy.description}"</p>
                      <div className="border-t border-slate-700 pt-4">
                          <span className="text-yellow-400 font-bold uppercase text-xs block mb-1">Habilidad Especial</span>
                          <span className="text-white font-bold text-xl block mb-1">{enemy.skillName}</span>
                          <span className="text-slate-400 text-sm">{enemy.skillDescription}</span>
                      </div>
                  </div>
              </div>
              
              <div className="mt-4 pt-4 w-full border-t border-white/10 animate-pulse">
                  <span className="text-xl font-bold text-white uppercase tracking-widest">Toca para continuar</span>
              </div>
          </div>
      )}

      {appState === 'playing' && (
          <>
            <div className={`flex-1 h-full flex flex-col items-center relative min-w-0 justify-center z-10 w-full max-w-md mx-auto transition-all duration-700`}>
             
                {stageCleared && (
                    <div className="absolute inset-x-0 top-1/3 z-50 flex items-center justify-center pointer-events-none">
                        <div className="bg-yellow-500/90 text-white font-black text-4xl md:text-6xl px-8 py-4 rounded-xl shadow-2xl border-4 border-white transform -rotate-3 animate-bounce drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">
                            ¡SUPERADO!
                        </div>
                    </div>
                )}
                
                {isResettingBoard && (
                     <div className="absolute inset-x-0 top-1/2 z-50 flex items-center justify-center pointer-events-none">
                        <div className="bg-indigo-600/90 text-white font-black text-xl px-4 py-2 rounded-xl shadow-2xl border border-white animate-pulse">
                            SIN MOVIMIENTOS - REINICIANDO
                        </div>
                    </div>
                )}

                <div className="w-full flex justify-between items-center px-4 pt-4 pb-2 z-20">
                    <button 
                        onClick={handleQuitToMenu} 
                        disabled={enemy.currentHp <= 0}
                        className={`
                            bg-red-900/80 p-2 rounded-lg border border-red-700 text-red-200 transition-all
                            ${enemy.currentHp <= 0 ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:bg-red-800'}
                        `}
                    >
                        <LogOut size={18} />
                    </button>

                    <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-600 font-bold flex flex-col items-center">
                        <span className="text-[10px] text-slate-400 uppercase">Turnos</span>
                        <span className={`text-2xl ${movesLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{movesLeft}</span>
                    </div>
                    
                    <div className="relative group">
                        <button 
                            onClick={() => !isProcessing && enemy.currentHp > 0 && (soundManager.playButton(), setShowSkillMenu(!showSkillMenu))}
                            className={`bg-indigo-600 p-3 rounded-full border-2 border-indigo-400 shadow-lg shadow-indigo-500/30 active:scale-95 transition-all ${anySkillReady ? 'animate-bounce' : ''} ${enemy.currentHp <= 0 ? 'opacity-50 grayscale' : ''}`}
                        >
                            <Zap fill="currentColor" />
                        </button>
                        {showSkillMenu && enemy.currentHp > 0 && (
                            <div className="absolute top-14 right-0 bg-slate-800 border border-slate-600 rounded-xl p-2 w-72 shadow-2xl z-50 flex flex-col gap-2 animate-in zoom-in">
                                {team.map(m => {
                                    const charge = skillCharges[m.id] || 0;
                                    const ready = charge >= m.skillCost;
                                    return (
                                        <button 
                                            key={m.id}
                                            disabled={!ready}
                                            onClick={() => executeSkill(m)}
                                            className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all ${ready ? 'bg-indigo-900/50 hover:bg-indigo-800 border border-indigo-500' : 'opacity-50 grayscale'}`}
                                        >
                                            <div className="w-8 h-8 flex items-center justify-center">
                                                {m.image ? <img src={m.image} className="w-full h-full object-contain" /> : <span className="text-xl">{m.emoji}</span>}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs font-bold text-white">{m.skillName}</div>
                                                <div className="w-full h-1.5 bg-slate-900 rounded-full mt-1">
                                                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${Math.min(100, (charge / m.skillCost) * 100)}%` }}></div>
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full max-w-md px-4 mb-2 z-10 relative mx-auto" ref={bossRef}>
                    <BossCard key={enemy.id} boss={enemy} shake={bossShake} damageTaken={lastDamage} isDefeated={isDefeatedAnim} hitEffect={hitEffect} isAttacking={bossAttacking} />
                    
                    {comboCount >= 2 && (
                        <div className="absolute top-1/2 right-6 transform -translate-y-1/2 z-50 flex flex-col items-center animate-in zoom-in duration-300 pointer-events-none">
                            <span className="text-yellow-400 font-bold text-xs italic tracking-widest drop-shadow-md whitespace-nowrap mb-1">
                                {(showFinishMessage || enemy.currentHp <= 0) ? "COMBO EXTRA" : "COMBO"}
                            </span>
                            <span className="text-6xl font-black text-white leading-none drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] font-sans" 
                                style={{
                                    textShadow: '0 0 10px rgba(250,204,21,0.8)'
                                }}>
                                {comboCount}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex-1 w-full relative flex flex-col justify-center items-center z-10" ref={boardRef}>
                    
                    {/* SKILL ANNOUNCEMENT MESSAGE - MOVED INSIDE BOARD CONTAINER FOR CENTERING */}
                    {skillAnnouncement && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[70] bg-black/80 px-8 py-6 rounded-2xl backdrop-blur-md border-2 border-white/30 animate-in zoom-in duration-300 shadow-2xl flex flex-col items-center">
                            <span className="text-white font-black text-2xl md:text-3xl text-center whitespace-nowrap drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                                {skillAnnouncement}
                            </span>
                        </div>
                    )}

                    {/* BIG BOSS ANIMATION OVERLAY */}
                    {animatingSkillBoss && (
                         <div className="absolute inset-0 z-[80] flex items-center justify-center pointer-events-none">
                             <div className="relative animate-grow-fade-rotate">
                                 {/* Spinning Shine Behind */}
                                 <div className="absolute inset-0 -m-10 bg-gradient-to-tr from-yellow-300/50 to-white/0 rounded-full animate-spin-slow blur-xl"></div>
                                 <div className="absolute inset-0 -m-4 border-4 border-white/40 rounded-full animate-ping"></div>

                                 {/* Boss Image */}
                                 <div className="w-48 h-48 md:w-64 md:h-64 flex items-center justify-center filter drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]">
                                     {animatingSkillBoss.image ? (
                                        <img src={animatingSkillBoss.image} alt="Skill" className="w-full h-full object-contain" />
                                     ) : (
                                        <span className="text-9xl">{animatingSkillBoss.emoji}</span>
                                     )}
                                 </div>
                             </div>
                         </div>
                    )}

                    {showFinishMessage && (
                        <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none">
                            <div className="relative transform scale-125 animate-gentle-bounce">
                                <h1 className="text-6xl md:text-7xl font-black tracking-tight text-center text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] stroke-black font-sans">
                                    ¡YA ESTÁ!
                                </h1>
                            </div>
                        </div>
                    )}

                    <div className={`transition-all duration-700 w-full flex justify-center ${showFinishMessage ? 'blur-[2px]' : ''}`}>
                        <Board 
                            board={board} 
                            selectedTileId={selectedTileId} 
                            onMove={handleMove} 
                            isProcessing={isProcessing} 
                            shake={boardShake}
                            isFrozen={showFinishMessage}
                            onBoardSettled={handleBoardSettled}
                            isComboActive={comboCount > 0} 
                            highlightedTileIds={highlightedTileIds}
                        />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes gentle-bounce {
                    0%, 100% { transform: scale(1.25); }
                    50% { transform: scale(1.3); }
                }
                .animate-gentle-bounce {
                    animation: gentle-bounce 2s infinite ease-in-out;
                }
                @keyframes grow-fade-rotate {
                    0% { transform: scale(0.5) rotate(-10deg); opacity: 0; }
                    20% { transform: scale(1.1) rotate(5deg); opacity: 1; }
                    100% { transform: scale(1.5) rotate(10deg); opacity: 0; }
                }
                .animate-grow-fade-rotate {
                    animation: grow-fade-rotate 2s ease-out forwards;
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 3s linear infinite;
                }
            `}</style>
          </>
      )}

      {showQuitConfirmation && (
        <div className="absolute inset-0 z-[70] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-6 rounded-2xl border border-red-500/50 max-w-sm w-full text-center">
                <h3 className="text-2xl font-black text-white mb-4">¿Abandonar?</h3>
                <p className="text-slate-400 mb-6 text-sm">Se perderá el progreso actual.</p>
                <div className="flex gap-4 justify-center">
                    <button onClick={() => setShowQuitConfirmation(false)} className="bg-slate-700 text-white px-6 py-3 rounded-xl font-bold">Cancelar</button>
                    <button onClick={confirmQuit} className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold">Salir</button>
                </div>
            </div>
        </div>
      )}

      {appState === 'victory' && (
          <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center text-center p-8">
              <h1 className="text-6xl mb-4">🏆</h1>
              <h2 className="text-4xl font-black text-yellow-400 mb-4">¡VICTORIA!</h2>
              <button onClick={() => { soundManager.playButton(); setAppState('menu'); }} className="bg-white text-black px-8 py-4 rounded-xl font-bold">Volver al Menú</button>
          </div>
      )}

      {appState === 'gameover' && (
          <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center text-center p-8">
              <Skull size={64} className="text-red-600 mb-4" />
              <h2 className="text-4xl font-black text-white mb-2">GAME OVER</h2>
              <button onClick={() => { soundManager.playButton(); setAppState('menu'); }} className="bg-slate-700 text-white px-8 py-4 rounded-xl font-bold flex gap-2"><RotateCcw /> Volver al Menú</button>
          </div>
      )}
    </div>
  );
};

export default App;