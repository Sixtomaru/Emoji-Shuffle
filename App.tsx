import React, { useState, useEffect, useCallback, useRef } from 'react';
import Board from './components/Board';
import BossCard from './components/BossCard';
import AttackProjectile from './components/Beam';
import TeamSelector from './components/TeamSelector';
import MainMenu from './components/MainMenu';
import CaptureModal from './components/CaptureModal';
import { GameState, TileData, Boss, FloatingText, ElementType, SkillType } from './types';
import { createBoard, findMatches, applyGravity, applyInterference, MatchGroup } from './utils/gameLogic';
import { MONSTER_DB, INITIAL_MOVES, MOVES_PER_LEVEL, TYPE_CHART, getLevelBackground, SECRET_BOSS } from './constants';
import { soundManager } from './utils/sound';
import { Skull, Zap, RotateCcw, X, LogOut, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  // --- Game State ---
  const [appState, setAppState] = useState<GameState['status']>('menu');
  const [level, setLevel] = useState(1);
  const [movesLeft, setMovesLeft] = useState(INITIAL_MOVES);
  const [movesAtStart, setMovesAtStart] = useState(INITIAL_MOVES);
  const [collection, setCollection] = useState<Boss[]>([MONSTER_DB[0], MONSTER_DB[1], MONSTER_DB[2], MONSTER_DB[3]]);
  const [team, setTeam] = useState<Boss[]>([MONSTER_DB[0], MONSTER_DB[1], MONSTER_DB[2], MONSTER_DB[3]]);
  const [isFinalBossMode, setIsFinalBossMode] = useState(false);
  const [levelPlan, setLevelPlan] = useState<Boss[]>([]);
  
  // --- Battle State ---
  const [nextPreviewEnemy, setNextPreviewEnemy] = useState<Boss>(MONSTER_DB[4]); 
  const [board, setBoard] = useState<TileData[]>([]);
  const [enemy, setEnemy] = useState<Boss>(MONSTER_DB[4]);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);
  
  // Lock input during animations
  const [isProcessing, setIsProcessing] = useState(false);
  const [stageCleared, setStageCleared] = useState(false); // New state for overlay
  const [showFinishMessage, setShowFinishMessage] = useState(false); // State for "¡YA ESTÁ!"
  
  const [comboCount, setComboCount] = useState(0);
  const [skillCharges, setSkillCharges] = useState<Record<string, number>>({});
  const [showSkillMenu, setShowSkillMenu] = useState(false);
  const [victoryAnim, setVictoryAnim] = useState(false);
  const [isDefeatedAnim, setIsDefeatedAnim] = useState(false); // Animation state for boss dying
  
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

  const bossRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

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

  const scaleEnemyHp = (baseEnemy: Boss, lvl: number, isFinal: boolean): Boss => {
      let scaledHp = baseEnemy.maxHp;
      if (isFinal) {
          scaledHp = 50000;
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
      setEnemy(nextPreviewEnemy);
      setMovesAtStart(movesLeft);
      setBoard(createBoard(team));
      setAppState('playing');
      setSkillCharges({});
      setIsProcessing(false);
      setVictoryAnim(false);
      setIsDefeatedAnim(false);
      setStageCleared(false);
      setShowFinishMessage(false);
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
      setTimeout(() => { setBossShake(false); setLastDamage(null); }, 200);
      setEnemy(prev => ({ ...prev, currentHp: Math.max(0, prev.currentHp - amount) }));
  };

  // --- LOGIC: PROCESS MATCHES SEQUENTIALLY ---
  const processMatches = async (startBoard: TileData[], startCombo: number, priorityTileId: string | null = null) => {
      let currentBoard = startBoard;
      let combo = startCombo;
      let currentBossHp = enemy.currentHp; 
      let hasWon = currentBossHp <= 0;

      while (true) {
          // 1. Find all matches in current state
          const { groups } = findMatches(currentBoard);
          if (groups.length === 0) break;

          // 2. Sort groups (Horizontal first, then vertical)
          groups.sort((a, b) => {
              // Priority 1: User interact tile
              const aHasPriority = priorityTileId && a.ids.includes(priorityTileId);
              const bHasPriority = priorityTileId && b.ids.includes(priorityTileId);
              if (aHasPriority && !bHasPriority) return -1;
              if (!aHasPriority && bHasPriority) return 1;

              // Priority 2: Horizontal before Vertical
              if (a.direction === 'horizontal' && b.direction === 'vertical') return -1;
              if (a.direction === 'vertical' && b.direction === 'horizontal') return 1;

              return a.center.y - b.center.y;
          });

          // 3. Process ALL groups in the current static board sequentially
          const currentBatchIdsRemoved = new Set<string>();
          
          for (const targetGroup of groups) {
             targetGroup.ids.forEach(id => currentBatchIdsRemoved.add(id));

             // Update Combo UI
             setComboCount(combo);
             
             // Mark as matched visually
             setBoard(prev => prev.map(t => currentBatchIdsRemoved.has(t.id) ? { ...t, isMatched: true } : t));

             // Damage Logic
             const attacker = team.find(m => m.id === targetGroup.type);
             if (attacker) {
                   const size = targetGroup.ids.length; 
                   setSkillCharges(prev => ({ ...prev, [attacker.id]: Math.min(attacker.skillCost, (prev[attacker.id] || 0) + size) }));
                   let dmg = 100 * size;
                   if (size >= 4) dmg *= 1.2;
                   if (size >= 5) dmg *= 1.5;
                   if (TYPE_CHART[attacker.type].includes(enemy.type)) dmg *= 1.5;
                   dmg = Math.floor(dmg * (1 + (combo * 0.2)));
                   
                   const wasAlive = currentBossHp > 0;
                   if (dmg > 0) {
                       currentBossHp = Math.max(0, currentBossHp - dmg);
                       applyDamage(dmg);
                   }
                   
                   if (wasAlive && currentBossHp <= 0) {
                       setShowFinishMessage(true);
                       soundManager.playWin();
                       await new Promise(r => setTimeout(r, 2000));
                       setShowFinishMessage(false);
                       hasWon = true;
                   }

                   const colorMap: Record<string, string> = { 'Fuego': '#ef4444', 'Agua': '#3b82f6', 'Planta': '#22c55e', 'Eléctrico': '#eab308' };
                   const centerTile = targetGroup.center; 
                   
                   setTimeout(() => {
                       addFloatingText(centerTile.x, centerTile.y - 0.5, `${dmg}`, colorMap[attacker.type] || 'white');
                   }, 100);
                   
                   fireProjectile(centerTile.x, centerTile.y, colorMap[attacker.type] || 'white');
             }
             soundManager.playMatch(combo);
             
             await new Promise(r => setTimeout(r, 200));
             
             combo++;
          }

          // 4. Apply Gravity ONCE
          const boardAfterFall = applyGravity(currentBoard, Array.from(currentBatchIdsRemoved), team);
          setBoard(boardAfterFall);
          currentBoard = boardAfterFall;

          await new Promise(r => setTimeout(r, 350));
      }

      if (hasWon) {
          await new Promise(r => setTimeout(r, 2000));
          setIsDefeatedAnim(true);
          await new Promise(r => setTimeout(r, 1500));
          
          setIsProcessing(false);
          setComboCount(0);
          
          if (isFinalBossMode) setAppState('victory');
          else if (collection.some(m => m.name === enemy.name)) advanceLevel();
          else setAppState('capture');
      } 
      else {
          setTimeout(() => setComboCount(0), 1000);
          setIsProcessing(false);
          if (movesLeft <= 0) {
              setAppState('gameover');
              soundManager.playLose();
          }
      }
  };

  const handleMove = async (id: string, targetX: number, targetY: number) => {
    if (isProcessing || movesLeft <= 0 || showFinishMessage || enemy.currentHp <= 0) return;

    const sourceTile = board.find(t => t.id === id);
    if (!sourceTile) return;

    if (sourceTile.x === targetX && sourceTile.y === targetY) {
         setSelectedTileId(prev => prev === id ? null : id); 
         return; 
    }

    const targetTile = board.find(t => t.x === targetX && t.y === targetY);
    
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
        setBoard(tempBoard);
        setIsProcessing(true); 

        await new Promise(r => setTimeout(r, 250));
        
        await processMatches(tempBoard, 1, id);
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

     soundManager.playBeam();
     let dmg = 500;
     if (monster.skillType === 'nuke') dmg = 1000;
     applyDamage(dmg);
     
     if (enemy.currentHp - dmg <= 0) {
        setShowFinishMessage(true);
        soundManager.playWin();
        await new Promise(r => setTimeout(r, 2000));
        setShowFinishMessage(false);
        
        await new Promise(r => setTimeout(r, 2000));
        setIsDefeatedAnim(true);
        await new Promise(r => setTimeout(r, 1500));

        setIsProcessing(false);
        if (isFinalBossMode) setAppState('victory');
        else if (collection.some(m => m.name === enemy.name)) advanceLevel();
        else setAppState('capture');
     } else {
        setTimeout(() => setIsProcessing(false), 500);
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

  return (
    <div className={`h-screen w-screen bg-black flex overflow-hidden font-sans select-none text-slate-100 relative`}>
      {/* Background - Removed Blur from here */}
      <div className={`absolute inset-0 z-0 transition-all duration-700 ease-in-out ${getLevelBackground(level, enemy.type)}`}></div>

      {appState === 'menu' && (
          <MainMenu 
            onStartArcade={handleStartArcade} 
            onOpenGallery={handleOpenGallery} 
            collectionSize={collection.length}
            onStartFinalBoss={handleStartFinalBoss}
          />
      )}

      {/* ... (Gallery and TeamSelect remain same, code elided for brevity if not changed, but must include full file in update) ... */}
      
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
            {/* Game Content Wrapper - REMOVED global blur */}
            <div className={`flex-1 h-full flex flex-col items-center relative min-w-0 justify-center z-10 w-full max-w-md mx-auto transition-all duration-700`}>
             
                {/* SUPERADO OVERLAY */}
                {stageCleared && (
                    <div className="absolute inset-x-0 top-1/3 z-50 flex items-center justify-center pointer-events-none">
                        <div className="bg-yellow-500/90 text-white font-black text-4xl md:text-6xl px-8 py-4 rounded-xl shadow-2xl border-4 border-white transform -rotate-3 animate-bounce drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">
                            ¡SUPERADO!
                        </div>
                    </div>
                )}

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
                    <BossCard boss={enemy} shake={bossShake} damageTaken={lastDamage} isDefeated={isDefeatedAnim} />
                    
                    {/* MODIFIED COMBO UI - Moved inside relative container, pinned to RIGHT */}
                    {comboCount > 0 && (
                        <div className="absolute top-8 right-4 z-50 flex flex-col items-end animate-in zoom-in duration-300 pointer-events-none">
                            <span className="text-yellow-400 font-black text-sm italic tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] whitespace-nowrap" style={{textShadow: '0 0 10px rgba(250,204,21,0.5)'}}>
                                {(showFinishMessage || enemy.currentHp <= 0) ? "COMBO EXTRA" : "COMBO"}
                            </span>
                            <span className="text-6xl font-black text-white leading-none drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]" 
                                style={{
                                    WebkitTextStroke: '2px #ca8a04',
                                    textShadow: '0 0 20px rgba(250,204,21,0.6)'
                                }}>
                                {comboCount}
                            </span>
                        </div>
                    )}
                </div>

                {/* BOARD CONTAINER */}
                <div className="flex-1 w-full relative flex flex-col justify-center items-center z-10" ref={boardRef}>
                    
                    {/* "¡YA ESTÁ!" OVERLAY - MOVED INSIDE BOARD CONTAINER & UNBLURRED */}
                    {showFinishMessage && (
                        <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none">
                            <div className="relative transform scale-125 animate-gentle-bounce">
                                <h1 
                                    className="text-6xl md:text-8xl font-black tracking-tight text-center"
                                    style={{
                                        color: 'transparent',
                                        backgroundImage: 'linear-gradient(to bottom, #fef08a, #84cc16, #eab308)', 
                                        WebkitBackgroundClip: 'text',
                                        backgroundClip: 'text',
                                        WebkitTextStroke: '4px white',
                                        filter: 'drop-shadow(0px 8px 4px rgba(0,0,0,0.6))',
                                    }}
                                >
                                    ¡YA ESTÁ!
                                </h1>
                                <h1 
                                    className="text-6xl md:text-8xl font-black tracking-tight text-center absolute inset-0 z-[-1]"
                                    style={{
                                        WebkitTextStroke: '8px rgba(0,0,0,0.5)',
                                        color: 'transparent',
                                    }}
                                >
                                    ¡YA ESTÁ!
                                </h1>
                            </div>
                        </div>
                    )}

                    {/* BOARD COMPONENT - BLURRED WHEN MESSAGE IS SHOWN */}
                    <div className={`transition-all duration-700 w-full flex justify-center ${showFinishMessage ? 'blur-md' : ''}`}>
                        <Board 
                            board={board} 
                            selectedTileId={selectedTileId} 
                            onMove={handleMove} 
                            isProcessing={isProcessing} 
                            floatingTexts={floatingTexts} 
                            shake={boardShake}
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
            `}</style>
          </>
      )}

      {showQuitConfirmation && (
        <div className="absolute inset-0 z-[70] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-6 rounded-2xl border border-red-500/50 max-w-sm w-full text-center">
                <h3 className="text-2xl font-black text-white mb-4">¿Abandonar?</h3>
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