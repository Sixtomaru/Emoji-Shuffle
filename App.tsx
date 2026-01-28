import React, { useState, useEffect, useCallback, useRef } from 'react';
import Board from './components/Board';
import BossCard from './components/BossCard';
import AttackProjectile from './components/Beam';
import TeamSelector from './components/TeamSelector';
import MainMenu from './components/MainMenu';
import CaptureModal from './components/CaptureModal';
import { GameState, TileData, Boss, FloatingText, ElementType, SkillType } from './types';
import { createBoard, findMatches, resolveMatches, applyInterference } from './utils/gameLogic';
import { MONSTER_DB, INITIAL_MOVES, MOVES_PER_LEVEL, TYPE_CHART, getLevelBackground, SECRET_BOSS } from './constants';
import { soundManager } from './utils/sound';
import { Skull, Zap, RotateCcw, X, LogOut } from 'lucide-react';

const App: React.FC = () => {
  // --- Game State ---
  const [appState, setAppState] = useState<GameState['status']>('menu');
  const [level, setLevel] = useState(1);
  const [movesLeft, setMovesLeft] = useState(INITIAL_MOVES);
  const [movesAtStart, setMovesAtStart] = useState(INITIAL_MOVES);
  const [collection, setCollection] = useState<Boss[]>([MONSTER_DB[0], MONSTER_DB[1], MONSTER_DB[2], MONSTER_DB[3]]);
  const [team, setTeam] = useState<Boss[]>([MONSTER_DB[0], MONSTER_DB[1], MONSTER_DB[2], MONSTER_DB[3]]);
  const [isFinalBossMode, setIsFinalBossMode] = useState(false);
  
  // --- Battle State ---
  const [nextPreviewEnemy, setNextPreviewEnemy] = useState<Boss>(MONSTER_DB[4]); // Store the specific enemy for the level
  const [board, setBoard] = useState<TileData[]>([]);
  const [enemy, setEnemy] = useState<Boss>(MONSTER_DB[4]);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [skillCharges, setSkillCharges] = useState<Record<string, number>>({});
  const [showSkillMenu, setShowSkillMenu] = useState(false);
  const [victoryAnim, setVictoryAnim] = useState(false);
  
  // --- Visuals ---
  const [bossShake, setBossShake] = useState(false);
  const [boardShake, setBoardShake] = useState(false); 
  const [lastDamage, setLastDamage] = useState<number | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [projectiles, setProjectiles] = useState<ProjectileData[]>([]);
  const [captureCaught, setCaptureCaught] = useState(false);
  const [hoveredSkillInfo, setHoveredSkillInfo] = useState<{name: string, desc: string} | null>(null);
  const [imgError, setImgError] = useState(false);
  
  // UI States
  const [viewingMonster, setViewingMonster] = useState<Boss | null>(null);
  const [showQuitConfirmation, setShowQuitConfirmation] = useState(false);

  // --- Refs ---
  const bossRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // --- FULLSCREEN HELPER ---
  const enterFullscreen = () => {
      try {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => console.log(err));
        }
      } catch (e) {
          console.log("Fullscreen not supported");
      }
  };

  // --- HELPER: Pick Enemy & Calculate HP ---
  const getScaledEnemy = (lvl: number, isFinal: boolean) => {
      let enemyTemplate: Boss;
      
      if (isFinal) {
          enemyTemplate = SECRET_BOSS;
      } else if (lvl === 10) {
          enemyTemplate = MONSTER_DB.find(m => m.id === "m010")!;
      } else if (lvl === 20) {
          enemyTemplate = MONSTER_DB.find(m => m.id === "m020")!;
      } else if (lvl === 30) {
          enemyTemplate = MONSTER_DB.find(m => m.id === "m030")!;
      } else {
          const nonBosses = MONSTER_DB.filter(m => m.id !== "m010" && m.id !== "m020" && m.id !== "m030");
          enemyTemplate = nonBosses[Math.floor(Math.random() * nonBosses.length)];
      }

      // CALCULATE HP GRADUALLY
      let scaledHp = enemyTemplate.maxHp;
      
      if (isFinal) {
          scaledHp = 50000;
      } else if (lvl === 10 || lvl === 20 || lvl === 30) {
          scaledHp = enemyTemplate.maxHp;
      } else {
          // Formula: Base 800 + (Level * 320)
          scaledHp = 800 + (lvl * 320);
      }

      return { 
          ...enemyTemplate, 
          maxHp: scaledHp,
          currentHp: scaledHp
      };
  };

  // --- Init ---
  const handleStartArcade = () => {
      enterFullscreen();
      setIsFinalBossMode(false);
      const startLvl = 1;
      setLevel(startLvl);
      setNextPreviewEnemy(getScaledEnemy(startLvl, false)); // Set correctly scaled enemy
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
      setNextPreviewEnemy(getScaledEnemy(startLvl, true));
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
      setEnemy(nextPreviewEnemy); // Use the already calculated one
      setMovesAtStart(movesLeft);
      setBoard(createBoard(team));
      setAppState('playing');
      setSkillCharges({});
      setIsProcessing(false);
      setVictoryAnim(false);
      setImgError(false);
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
          // Prepare NEXT level
          const nextLvl = level + 1;
          setLevel(nextLvl);
          // Pick NEXT enemy now and freeze it in state with correct HP
          setNextPreviewEnemy(getScaledEnemy(nextLvl, false));
          
          setMovesLeft(m => m + MOVES_PER_LEVEL);
          setAppState('team_select');
      }
  };

  // --- Core Loop ---
  const processBoard = useCallback(async (currentBoard: TileData[], startLoopCount = 0, isTurnEnd = false) => {
    setIsProcessing(true);
    let processingBoard = currentBoard;
    let keepChecking = true;
    let loopCount = startLoopCount;
    let turnDamage = 0;
    
    // TRACK DEATH LOCALLY to prevent interference logic issues even if state hasn't updated
    let isDead = enemy.currentHp <= 0;
    let accumulatedDamage = 0;

    if (loopCount === 0) await new Promise(r => setTimeout(r, 200));

    while (keepChecking && loopCount < 10) {
      
      const { groups, allMatchedIds, clearedObstacles } = findMatches(processingBoard);
      
      if (allMatchedIds.length > 0) {
        
        // Update combo immediately for UI responsiveness
        if (loopCount > 0) setComboCount(loopCount + 1);

        let comboMultiplier = 1 + (loopCount * 0.2);

        const clearedTypes = new Set(allMatchedIds.map(id => processingBoard.find(t => t.id === id)?.status));
        if (clearedTypes.has('rock')) soundManager.playRockBreak();
        if (clearedTypes.has('ice')) soundManager.playIceBreak();

        for (const group of groups) {
            const size = group.ids.length;
            soundManager.playMatch(loopCount);

            const attacker = team.find(m => m.id === group.type);
            if (attacker) {
                setSkillCharges(prev => {
                    const current = prev[attacker.id] || 0;
                    return {
                        ...prev,
                        [attacker.id]: Math.min(attacker.skillCost, current + group.ids.length)
                    };
                });

                let baseDmg = 100 * size; 
                if (size === 4) baseDmg *= 1.2;
                if (size >= 5) baseDmg *= 1.5;

                let damage = baseDmg;
                const weaknesses = TYPE_CHART[attacker.type];
                if (weaknesses.includes(enemy.type)) damage *= 1.5;
                
                damage = Math.floor(damage * comboMultiplier);
                turnDamage += damage;
                accumulatedDamage += damage;

                const colorMap: Record<string, string> = { 'Fuego': '#ef4444', 'Agua': '#3b82f6', 'Planta': '#22c55e', 'Eléctrico': '#eab308' };
                const fontScale = size >= 5 ? 2.5 : size === 4 ? 1.8 : 1.2;
                addFloatingText(group.center.x, group.center.y, `${damage}`, colorMap[attacker.type] || 'white', fontScale);
                
                fireProjectile(group.center.x, group.center.y, colorMap[attacker.type] || '#ffffff');
            }
        }

        // Apply damage immediately
        applyDamage(turnDamage);
        
        // CHECK DEATH LOCALLY but DO NOT RETURN. Continue combo to look cool.
        if (enemy.currentHp - accumulatedDamage <= 0 && !isDead) {
             isDead = true;
             setVictoryAnim(true);
        }

        const markedBoard = processingBoard.map(t => 
            allMatchedIds.includes(t.id) ? { ...t, isMatched: true } : t
        );
        setBoard(markedBoard);
        
        await new Promise(r => setTimeout(r, 300));

        const shouldDecreaseSteel = isTurnEnd && loopCount === 0;
        const { newBoard } = resolveMatches(processingBoard, allMatchedIds, team, shouldDecreaseSteel);
        
        processingBoard = newBoard;
        setBoard([...processingBoard]); 
        
        await new Promise(r => setTimeout(r, 400));
        loopCount++;
        turnDamage = 0; 
      } else {
        keepChecking = false;
      }
    }

    setComboCount(0);
    setIsProcessing(false);

    // END OF TURN LOGIC
    if (isDead) {
         // Victory Sequence
         setTimeout(() => {
             setVictoryAnim(false);
             if (isFinalBossMode) {
                  setAppState('victory'); 
             } else if (collection.some(m => m.name === enemy.name)) {
                  advanceLevel();
             } else {
                  setAppState('capture');
             }
         }, 1500); // Small delay to let victory sink in
    } else {
         // Enemy Still Alive Logic
         // --- CHECK GAME OVER HERE ---
         if (movesLeft <= 0 && isTurnEnd) {
             setAppState('gameover');
             soundManager.playLose();
             return;
         }

         // Interference Check - ONLY if alive
         const interferenceChance = isFinalBossMode ? 0.7 : 0.4;
         if (isTurnEnd && Math.random() < interferenceChance) {
            setTimeout(() => {
                const type = enemy.type === 'Hielo' ? 'ice' : enemy.type === 'Acero' ? 'steel' : 'rock';
                setBoard(prev => applyInterference(prev, type));
                soundManager.playLose(); 
                
                addFloatingText(2.5, 2.5, "¡INTERFERENCIA!", "#f87171", 2);
                setBossShake(true); 
                setBoardShake(true); 
                setTimeout(() => {
                    setBossShake(false);
                    setBoardShake(false);
                }, 500);
            }, 500);
         }
    }

  }, [team, enemy, collection, isFinalBossMode, movesLeft]); 

  const applyDamage = (amount: number) => {
      if (amount <= 0) return;
      setLastDamage(amount);
      setBossShake(true);
      setTimeout(() => { setBossShake(false); setLastDamage(null); }, 200);

      setEnemy(prev => ({
          ...prev,
          currentHp: Math.max(0, prev.currentHp - amount)
      }));
  };

  const handleSwap = async (id1: string, id2: string) => {
    // LOCK IF DEAD
    if (isProcessing || movesLeft <= 0 || appState !== 'playing' || enemy.currentHp <= 0) return;
    if (id1 === id2) { setSelectedTileId(prev => prev === id1 ? null : id1); return; }

    const t1 = board.find(t => t.id === id1);
    const t2 = board.find(t => t.id === id2);

    if (t1 && t2) {
        if (t1.status === 'rock' || t1.status === 'steel' || t1.status === 'ice' || 
            t2.status === 'rock' || t2.status === 'steel' || t2.status === 'ice') return;

        soundManager.playSwap();
        setIsProcessing(true);
        setSelectedTileId(null);
        setMovesLeft(prev => prev - 1); 

        const tempBoard = board.map(t => {
          if (t.id === t1.id) return { ...t, x: t2.x, y: t2.y };
          if (t.id === t2.id) return { ...t, x: t1.x, y: t1.y };
          return t;
        });
        setBoard(tempBoard);

        const { allMatchedIds } = findMatches(tempBoard);
        if (allMatchedIds.length > 0) {
            await processBoard(tempBoard, 0, true);
        } else {
            await new Promise(r => setTimeout(r, 250));
            const revertedBoard = tempBoard.map(t => {
                if (t.id === t1.id) return { ...t, x: t1.x, y: t1.y };
                if (t.id === t2.id) return { ...t, x: t2.x, y: t2.y };
                return t;
            });
            setBoard(revertedBoard);
            setIsProcessing(false);
            
            // Check loss on invalid move too if it was last move
            if (movesLeft - 1 <= 0 && enemy.currentHp > 0) {
                setAppState('gameover');
                soundManager.playLose();
            }
        }
    }
  };

  const clearPartialObstacles = (currentBoard: TileData[], statusType: 'rock' | 'ice' | 'steel', count: number): TileData[] => {
      const targets = currentBoard.filter(t => t.status === statusType);
      
      if (targets.length > 0) {
          if (statusType === 'rock') soundManager.playRockBreak();
          if (statusType === 'ice') soundManager.playIceBreak();
          if (statusType === 'steel') soundManager.playRockBreak(); 
      }

      const shuffled = targets.sort(() => 0.5 - Math.random());
      const toClear = shuffled.slice(0, count).map(t => t.id);
      
      return currentBoard.map(t => {
          if (toClear.includes(t.id)) {
               return { ...t, status: 'normal' };
          }
          return t;
      });
  };

  const executeSkill = async (monster: Boss) => {
      if (skillCharges[monster.id] < monster.skillCost || enemy.currentHp <= 0) return;
      soundManager.playButton();
      setShowSkillMenu(false);
      setIsProcessing(true);
      setSkillCharges(prev => ({...prev, [monster.id]: 0}));
      setHoveredSkillInfo(null); // Clear any lingering hover info

      soundManager.playBeam();

      let dmg = 0;
      let extraEffect = false;

      switch(monster.skillType) {
          case 'damage_single':
              dmg = 500;
              break;
          case 'damage_aoe':
              dmg = 300; 
              break;
          case 'nuke':
              dmg = 1000;
              break;
          case 'clear_rocks':
              setBoard(prev => clearPartialObstacles(prev, 'rock', 5));
              extraEffect = true;
              break;
          case 'clear_ice':
              setBoard(prev => clearPartialObstacles(prev, 'ice', 5));
              extraEffect = true;
              break;
          case 'clear_steel':
              setBoard(prev => clearPartialObstacles(prev, 'steel', 3));
              extraEffect = true;
              break;
          case 'convert_type':
               setBoard(prev => {
                   const targets = prev.filter(t => t.status === 'normal' && t.monsterId !== monster.id);
                   const chosen = targets.sort(() => 0.5 - Math.random()).slice(0, 5);
                   const ids = chosen.map(t => t.id);
                   return prev.map(t => ids.includes(t.id) ? {...t, monsterId: monster.id, type: monster.type, emoji: monster.emoji, image: monster.image} : t);
               });
               extraEffect = true;
               break;
      }
      
      if (dmg > 0) {
          applyDamage(dmg);
          // Check death from skill
          if (enemy.currentHp - dmg <= 0) {
              setVictoryAnim(true);
              // Allow animation to play
              setTimeout(() => {
                  setVictoryAnim(false);
                  if (isFinalBossMode) {
                        setAppState('victory'); 
                  } else if (collection.some(m => m.name === enemy.name)) {
                        advanceLevel();
                  } else {
                        setAppState('capture');
                  }
                  setIsProcessing(false);
              }, 2000);
              return;
          }
      }
      
      // Removed fixed delays to make it snappy
      if (extraEffect || monster.skillType === 'convert_type') {
          await processBoard(board, 0, false); 
      } else {
          setIsProcessing(false);
      }
  };

  const addFloatingText = (x: number, y: number, text: string, color: string = 'white', scale: number = 1) => {
      const id = Date.now() + Math.random().toString();
      setFloatingTexts(prev => [...prev, { id, x, y, text, color, scale }]);
      setTimeout(() => setFloatingTexts(prev => prev.filter(ft => ft.id !== id)), 1000);
  };
  
  const fireProjectile = (gridX: number, gridY: number, color: string) => {
      if (boardRef.current) {
          const rect = boardRef.current.getBoundingClientRect();
          const startX = rect.left + (gridX + 0.5) * (rect.width / 6);
          const startY = rect.top + (gridY + 0.5) * (rect.height / 6);
          
          const targetX = window.innerWidth / 2;
          const targetY = window.innerHeight * 0.15; 

          const id = Date.now() + Math.random().toString();
          setProjectiles(prev => [...prev, { id, startX, startY, targetX, targetY, color }]);
          setTimeout(() => setProjectiles(prev => prev.filter(p => p.id !== id)), 600);
      }
  };

  const anySkillReady = team.some(m => (skillCharges[m.id] || 0) >= m.skillCost);

  const turnsUsed = Math.max(1, movesAtStart - movesLeft);
  const captureRate = Math.max(1, 100 - ((turnsUsed - 1) * 5));

  return (
    <div className={`h-screen w-screen bg-black flex overflow-hidden font-sans select-none text-slate-100 relative`}>
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${getLevelBackground(level, enemy.type)}`}></div>

      {appState === 'menu' && (
          <MainMenu 
            onStartArcade={handleStartArcade} 
            onOpenGallery={handleOpenGallery} 
            collectionSize={collection.length}
            onStartFinalBoss={handleStartFinalBoss}
          />
      )}

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
                            {m.image ? (
                                <img src={m.image} alt={m.emoji} className="w-full h-full object-contain" />
                            ) : (
                                <span className="text-3xl">{m.emoji}</span>
                            )}
                          </div>
                          <div className="text-xs font-bold text-slate-300 truncate w-full text-center">{m.name}</div>
                      </div>
                  ))}
              </div>
              {/* Gallery Modal */}
              {viewingMonster && (
                  <div className="absolute inset-0 z-[60] bg-black/80 flex items-center justify-center p-4" onClick={() => setViewingMonster(null)}>
                      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-600 max-w-sm w-full relative" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setViewingMonster(null)} className="absolute top-2 right-2 p-1 bg-slate-700 rounded-full"><X size={16}/></button>
                          <div className="text-center mb-4">
                              <div className="w-40 h-40 mx-auto mb-2 animate-bounce flex items-center justify-center">
                                  {viewingMonster.image ? (
                                    <img src={viewingMonster.image} alt={viewingMonster.emoji} className="w-full h-full object-contain" />
                                  ) : (
                                    <span className="text-8xl">{viewingMonster.emoji}</span>
                                  )}
                              </div>
                              <h3 className="text-3xl font-black text-white mb-2 leading-none relative z-10">{viewingMonster.name}</h3>
                              <div className="relative z-0">
                                <span className="text-xs bg-slate-900 px-3 py-1 rounded-full text-slate-400 border border-slate-700 font-bold uppercase tracking-wider">
                                    {viewingMonster.type}
                                </span>
                              </div>
                          </div>
                          <p className="text-slate-300 italic text-sm mb-4 text-center">"{viewingMonster.description}"</p>
                          <div className="bg-indigo-900/30 p-3 rounded-xl border border-indigo-500/30">
                              <h4 className="text-indigo-400 font-bold text-xs uppercase mb-1">Habilidad: {viewingMonster.skillName}</h4>
                              <p className="text-indigo-100 text-xs">{viewingMonster.skillDescription}</p>
                          </div>
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
          />
      )}
      
      {appState === 'capture' && (
          <CaptureModal 
             boss={enemy} 
             chance={captureRate}
             onCaptureEnd={handleCaptureResult}
          />
      )}
      
      {appState === 'captured_info' && (
          // CLICK ANYWHERE TO CONTINUE
          <div 
             onClick={() => { soundManager.playButton(); advanceLevel(); }}
             className="absolute inset-0 z-50 bg-indigo-900/95 flex flex-col items-center justify-center p-8 animate-in zoom-in cursor-pointer"
          >
              <div className="w-40 h-40 mb-4 animate-bounce flex items-center justify-center">
                    {enemy.image && !imgError ? (
                        <img 
                            src={enemy.image} 
                            alt={enemy.emoji} 
                            className="w-full h-full object-contain" 
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <span className="text-9xl">{enemy.emoji}</span>
                    )}
              </div>
              <h2 className="text-4xl font-black text-white mb-2">{enemy.name}</h2>
              <div className="bg-white/10 px-4 py-1 rounded-full text-indigo-200 mb-4 font-mono text-sm">
                  TIPO: {enemy.type.toUpperCase()}
              </div>
              
              <p className="text-indigo-200 italic mb-6 text-center max-w-xs text-sm">"{enemy.description}"</p>
              
              <div className="bg-slate-900 p-6 rounded-2xl border border-indigo-500 max-w-sm w-full mb-8">
                  <h3 className="text-yellow-400 font-bold mb-1">HABILIDAD: {enemy.skillName}</h3>
                  <p className="text-slate-300 text-sm">{enemy.skillDescription}</p>
              </div>
              
              <div className="text-3xl font-black text-white animate-pulse mt-8 border-b-4 border-white pb-1">
                  PULSA PARA CONTINUAR
              </div>
          </div>
      )}

      {appState === 'playing' && (
          <div className="flex-1 h-full flex flex-col items-center relative min-w-0 justify-center z-10 w-full max-w-md mx-auto">
             <div className="w-full flex justify-between items-center px-4 pt-4 pb-2 z-20">
                 <button onClick={handleQuitToMenu} className="bg-red-900/80 p-2 rounded-lg border border-red-700 text-red-200 hover:bg-red-800">
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
                                    <div key={m.id} className="group/item relative">
                                        <button 
                                            disabled={!ready}
                                            onClick={() => executeSkill(m)}
                                            onMouseEnter={() => setHoveredSkillInfo({ name: m.skillName, desc: m.skillDescription })}
                                            onMouseLeave={() => setHoveredSkillInfo(null)}
                                            onTouchStart={() => setHoveredSkillInfo({ name: m.skillName, desc: m.skillDescription })}
                                            onTouchEnd={() => setHoveredSkillInfo(null)}
                                            className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all ${ready ? 'bg-indigo-900/50 hover:bg-indigo-800 border border-indigo-500' : 'opacity-50 grayscale'}`}
                                        >
                                            <div className="w-8 h-8 flex items-center justify-center">
                                                {m.image ? (
                                                    <img src={m.image} alt={m.emoji} className="w-full h-full object-contain" />
                                                ) : (
                                                    <span className="text-xl">{m.emoji}</span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs font-bold text-white">{m.skillName}</div>
                                                <div className="w-full h-1.5 bg-slate-900 rounded-full mt-1">
                                                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${Math.min(100, (charge / m.skillCost) * 100)}%` }}></div>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                 </div>
             </div>

             <div className="w-full px-4 mb-2 z-10" ref={bossRef}>
                <BossCard boss={enemy} shake={bossShake} damageTaken={lastDamage} />
             </div>

             <div className="flex-1 w-full relative flex flex-col justify-center items-center z-10" ref={boardRef}>
                <Board 
                    board={board} 
                    selectedTileId={selectedTileId} 
                    onSwap={handleSwap} 
                    isProcessing={isProcessing} 
                    floatingTexts={floatingTexts} 
                    shake={boardShake}
                />

                {/* Combo UI - Moved Higher */}
                {comboCount > 1 && !victoryAnim && (
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
                        <div className="text-5xl font-black text-yellow-400 drop-shadow-[0_4px_0_rgba(0,0,0,1)] animate-bounce text-center">
                            COMBO<br/>x{comboCount}
                        </div>
                    </div>
                )}
                
                {/* Victory Animation */}
                {victoryAnim && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                        <div className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-orange-600 drop-shadow-[0_10px_0_rgba(0,0,0,0.5)] animate-in zoom-in duration-300">
                            ¡VENCIDO!
                        </div>
                    </div>
                )}

                {/* Skill Hover/Hold Info Overlay */}
                {hoveredSkillInfo && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                        <div className="bg-black/90 backdrop-blur-xl p-8 rounded-3xl border-2 border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.5)] animate-in fade-in zoom-in text-center max-w-[90%] transform scale-110">
                            <h3 className="text-3xl font-black text-yellow-400 mb-4 uppercase drop-shadow-lg">{hoveredSkillInfo.name}</h3>
                            <p className="text-white text-xl font-medium leading-relaxed">{hoveredSkillInfo.desc}</p>
                        </div>
                    </div>
                )}
             </div>
          </div>
      )}

      {/* Quit Confirmation Modal */}
      {showQuitConfirmation && (
        <div className="absolute inset-0 z-[70] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-6 rounded-2xl border border-red-500/50 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95">
                <h3 className="text-2xl font-black text-white mb-2">¿Abandonar?</h3>
                <p className="text-slate-300 mb-6">
                    Conservarás tus Monstemojis capturados, pero tendrás que empezar de nuevo desde la Fase 1.
                </p>
                <div className="flex gap-4 justify-center">
                    <button 
                        onClick={() => setShowQuitConfirmation(false)}
                        className="bg-slate-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-600 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={confirmQuit}
                        className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-500 transition-colors shadow-lg shadow-red-900/20"
                    >
                        Salir
                    </button>
                </div>
            </div>
        </div>
      )}

      {appState === 'victory' && (
          <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center text-center p-8">
              <h1 className="text-6xl mb-4">🏆</h1>
              <h2 className="text-4xl font-black text-yellow-400 mb-4">{isFinalBossMode ? "¡MAESTRO SUPREMO!" : "¡CAMPEÓN!"}</h2>
              <p className="text-slate-300 mb-8">{isFinalBossMode ? "Has derrotado al creador." : "Has superado las 30 fases."}</p>
              <button onClick={() => { soundManager.playButton(); setAppState('menu'); }} className="bg-white text-black px-8 py-4 rounded-xl font-bold">Volver al Menú</button>
          </div>
      )}

      {appState === 'gameover' && (
          <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center text-center p-8">
              <Skull size={64} className="text-red-600 mb-4" />
              <h2 className="text-4xl font-black text-white mb-2">GAME OVER</h2>
              <p className="text-slate-400 mb-8">Te quedaste sin turnos en la fase {level}.</p>
              <button onClick={() => { soundManager.playButton(); setAppState('menu'); }} className="bg-slate-700 text-white px-8 py-4 rounded-xl font-bold flex gap-2"><RotateCcw /> Volver al Menú</button>
          </div>
      )}

      {projectiles.map(p => <AttackProjectile key={p.id} {...p} />)}
    </div>
  );
};

interface ProjectileData {
    id: string;
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
    color: string;
}

export default App;