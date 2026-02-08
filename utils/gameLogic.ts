import { TileData, GRID_WIDTH, GRID_HEIGHT, Boss, ElementType } from "../types";
import { INTERFERENCE_RULES } from "../constants";

export interface MatchGroup {
  ids: string[];
  type: string;
  center: { x: number, y: number };
  direction: 'horizontal' | 'vertical'; 
  idsToDestroy?: string[]; 
}

export interface MatchResult {
  groups: MatchGroup[];
  allMatchedIds: string[];
  extraDestroyedIds: string[];
}

let globalUniqueCounter = 0;
const generateId = (prefix: string = 't') => {
  globalUniqueCounter++;
  return `${prefix}_${Date.now()}_${globalUniqueCounter}`;
};

export const createBoard = (team: Boss[]): TileData[] => {
  const board: TileData[] = [];
  for (let x = 0; x < GRID_WIDTH; x++) {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      let monster = team[Math.floor(Math.random() * team.length)];
      
      let attempts = 0;
      while (attempts < 50) {
        let conflict = false;
        if (x >= 2) {
           const left1 = board.find(t => t.x === x - 1 && t.y === y);
           const left2 = board.find(t => t.x === x - 2 && t.y === y);
           if (left1?.monsterId === monster.id && left2?.monsterId === monster.id) conflict = true;
        }
        if (!conflict && y >= 2) {
           const up1 = board.find(t => t.x === x && t.y === y - 1);
           const up2 = board.find(t => t.x === x && t.y === y - 2);
           if (up1?.monsterId === monster.id && up2?.monsterId === monster.id) conflict = true;
        }
        if (!conflict) break;
        monster = team[Math.floor(Math.random() * team.length)];
        attempts++;
      }

      board.push({
        id: generateId(`init_${x}_${y}`),
        monsterId: monster.id,
        type: monster.type,
        emoji: monster.emoji,
        image: monster.image,
        isMatched: false,
        x,
        y,
        status: 'normal'
      });
    }
  }
  return board;
};

export const findMatches = (board: TileData[]): MatchResult => {
  const groups: MatchGroup[] = [];
  const processedSigs = new Set<string>(); 
  
  const globalExtraDestroyedIds = new Set<string>();

  const grid: (TileData | null)[][] = Array(GRID_WIDTH).fill(null).map(() => Array(GRID_HEIGHT).fill(null));
  board.forEach(t => {
      if (t.x >= 0 && t.x < GRID_WIDTH && t.y >= 0 && t.y < GRID_HEIGHT) {
          grid[t.x][t.y] = t;
      }
  });

  // Updated: Ice tiles ARE valid for matching (they trigger unfreeze)
  const isValidTile = (t: TileData | null) => t && t.status !== 'rock' && t.status !== 'steel';

  const getAdjacentRocks = (tile: TileData): string[] => {
      const rockIds: string[] = [];
      const neighbors = [
          {x: tile.x + 1, y: tile.y}, {x: tile.x - 1, y: tile.y},
          {x: tile.x, y: tile.y + 1}, {x: tile.x, y: tile.y - 1}
      ];
      neighbors.forEach(n => {
          if (n.x >= 0 && n.x < GRID_WIDTH && n.y >= 0 && n.y < GRID_HEIGHT) {
              const neighbor = grid[n.x][n.y];
              if (neighbor && neighbor.status === 'rock') {
                  rockIds.push(neighbor.id);
                  globalExtraDestroyedIds.add(neighbor.id);
              }
          }
      });
      return rockIds;
  };

  // 1. SCAN HORIZONTALS
  for (let y = 0; y < GRID_HEIGHT; y++) {
      let matchLen = 1;
      for (let x = 0; x < GRID_WIDTH; x++) {
          const current = grid[x][y];
          const next = (x < GRID_WIDTH - 1) ? grid[x+1][y] : null;

          if (isValidTile(current) && isValidTile(next) && current!.monsterId === next!.monsterId) {
              matchLen++;
          } else {
              if (matchLen >= 3) {
                  const ids: string[] = [];
                  const groupRocks = new Set<string>();
                  
                  for (let k = 0; k < matchLen; k++) {
                      const t = grid[x - k][y];
                      if (t) {
                          ids.push(t.id);
                          const rocks = getAdjacentRocks(t);
                          rocks.forEach(r => groupRocks.add(r));
                      }
                  }
                  
                  const sig = `h|${ids.sort().join('|')}`;
                  if (!processedSigs.has(sig)) {
                      processedSigs.add(sig);
                      const tiles = ids.map(id => board.find(b => b.id === id)!);
                      const sortedTiles = tiles.sort((a,b) => a.x - b.x);
                      
                      groups.push({
                          ids: ids,
                          type: sortedTiles[0].monsterId,
                          center: sortedTiles[Math.floor(sortedTiles.length / 2)],
                          direction: 'horizontal',
                          idsToDestroy: Array.from(groupRocks)
                      });
                  }
              }
              matchLen = 1;
          }
      }
  }

  // 2. SCAN VERTICALS
  for (let x = 0; x < GRID_WIDTH; x++) {
      let matchLen = 1;
      for (let y = 0; y < GRID_HEIGHT; y++) {
          const current = grid[x][y];
          const next = (y < GRID_HEIGHT - 1) ? grid[x][y+1] : null;

          if (isValidTile(current) && isValidTile(next) && current!.monsterId === next!.monsterId) {
              matchLen++;
          } else {
              if (matchLen >= 3) {
                  const ids: string[] = [];
                  const groupRocks = new Set<string>();

                  for (let k = 0; k < matchLen; k++) {
                      const t = grid[x][y - k];
                      if (t) {
                          ids.push(t.id);
                          const rocks = getAdjacentRocks(t);
                          rocks.forEach(r => groupRocks.add(r));
                      }
                  }

                  const sig = `v|${ids.sort().join('|')}`;
                  if (!processedSigs.has(sig)) {
                      processedSigs.add(sig);
                      const tiles = ids.map(id => board.find(b => b.id === id)!);
                      const sortedTiles = tiles.sort((a,b) => a.y - b.y);

                      groups.push({
                          ids: ids,
                          type: sortedTiles[0].monsterId,
                          center: sortedTiles[Math.floor(sortedTiles.length / 2)],
                          direction: 'vertical',
                          idsToDestroy: Array.from(groupRocks)
                      });
                  }
              }
              matchLen = 1;
          }
      }
  }

  const allMatchedIds = Array.from(new Set(groups.flatMap(g => g.ids)));
  return { groups, allMatchedIds, extraDestroyedIds: Array.from(globalExtraDestroyedIds) };
};

export const applyGravity = (
    currentBoard: TileData[], 
    idsToRemove: string[], 
    team: Boss[]
): TileData[] => {
    const nextBoard: TileData[] = [];
    
    for (let x = 0; x < GRID_WIDTH; x++) {
        const colTiles = currentBoard.filter(t => t.x === x);
        let writePtr = GRID_HEIGHT - 1;
        
        for (let readPtr = GRID_HEIGHT - 1; readPtr >= 0; readPtr--) {
            const tile = colTiles.find(t => t.y === readPtr);
            
            // Ice blocks gravity
            if (tile && tile.status === 'ice' && !idsToRemove.includes(tile.id)) {
                nextBoard.push({ ...tile, isMatched: false }); 
                writePtr = readPtr - 1; 
            }
            else if (tile && !idsToRemove.includes(tile.id)) {
                if (writePtr >= 0) {
                    nextBoard.push({
                        ...tile,
                        x: x,
                        y: writePtr,
                        isMatched: false
                    });
                    writePtr--;
                }
            }
        }

        while (writePtr >= 0) {
            const monster = team[Math.floor(Math.random() * team.length)];
            nextBoard.push({
                id: generateId(`spawn_c${x}_${writePtr}`),
                monsterId: monster.id,
                type: monster.type,
                emoji: monster.emoji,
                image: monster.image,
                isMatched: false,
                x: x,
                y: writePtr,
                status: 'normal'
            });
            writePtr--;
        }
    }

    return nextBoard;
};

export const applyInterference = (board: TileData[], enemyType: ElementType): TileData[] => {
    let type: 'rock' | 'steel' | 'ice' | 'random' = INTERFERENCE_RULES[enemyType] || 'random';
    
    if (type === 'random') {
        const types: ('rock' | 'steel' | 'ice')[] = ['rock', 'steel', 'ice'];
        type = types[Math.floor(Math.random() * types.length)];
    }

    const targets = board.filter(t => t.status === 'normal');
    if (targets.length === 0) return board;

    const count = Math.min(targets.length, Math.floor(Math.random() * 4) + 3);
    
    const shuffled = targets.sort(() => 0.5 - Math.random());
    const affected = new Set(shuffled.slice(0, count).map(t => t.id));

    return board.map(t => {
        if (affected.has(t.id)) {
            const newId = `${t.id}_int_${Date.now()}`;
            
            if (type === 'ice') {
                return {
                    ...t,
                    id: newId,
                    status: 'ice'
                };
            }
            return {
                ...t,
                id: newId,
                status: type as 'rock' | 'steel',
                statusLife: type === 'steel' ? 5 : undefined,
                monsterId: `obstacle_${type}`,
                emoji: type === 'rock' ? '🪨' : '⚙️',
                image: undefined 
            };
        }
        return t;
    });
};

export const hasPossibleMoves = (board: TileData[]): boolean => {
    const grid: (TileData | null)[][] = Array(GRID_WIDTH).fill(null).map(() => Array(GRID_HEIGHT).fill(null));
    board.forEach(t => {
        // Ice blocks swaps
        if (t.status === 'normal') {
            grid[t.x][t.y] = t;
        }
    });

    for (let x = 0; x < GRID_WIDTH; x++) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            const current = grid[x][y];
            if (!current) continue;
            if (x < GRID_WIDTH - 1) {
                const right = grid[x+1][y];
                if (right) {
                    if (checkMatchAt(grid, x, y, right.monsterId) || checkMatchAt(grid, x+1, y, current.monsterId)) return true;
                }
            }
            if (y < GRID_HEIGHT - 1) {
                const down = grid[x][y+1];
                if (down) {
                    if (checkMatchAt(grid, x, y, down.monsterId) || checkMatchAt(grid, x, y+1, current.monsterId)) return true;
                }
            }
        }
    }
    return false;
};

const checkMatchAt = (grid: (TileData | null)[][], x: number, y: number, id: string): boolean => {
    let hCount = 1;
    let i = 1; while (x - i >= 0 && grid[x-i][y]?.monsterId === id) { hCount++; i++; }
    i = 1; while (x + i < GRID_WIDTH && grid[x+i][y]?.monsterId === id) { hCount++; i++; }
    if (hCount >= 3) return true;

    let vCount = 1;
    i = 1; while (y - i >= 0 && grid[x][y-i]?.monsterId === id) { vCount++; i++; }
    i = 1; while (y + i < GRID_HEIGHT && grid[x][y+i]?.monsterId === id) { vCount++; i++; }
    if (vCount >= 3) return true;

    return false;
}