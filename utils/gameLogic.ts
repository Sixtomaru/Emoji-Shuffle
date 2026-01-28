import { TileData, GRID_WIDTH, GRID_HEIGHT, Boss, TileStatus } from "../types";

export interface MatchGroup {
  ids: string[];
  points: number;
  type: string; 
  center: { x: number, y: number };
}

export interface MatchResult {
  groups: MatchGroup[];
  allMatchedIds: string[];
  totalPoints: number;
  clearedObstacles: string[]; // IDs of rocks/ice cleared
}

let globalUniqueCounter = 0;
const generateId = (x: number, prefix: string = '') => {
  globalUniqueCounter++;
  return `${prefix}-${x}-${Date.now()}-${globalUniqueCounter}-${Math.random().toString(36).substring(2, 9)}`;
};

// Create board using the player's team
export const createBoard = (team: Boss[]): TileData[] => {
  const board: TileData[] = [];
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      let monster = team[Math.floor(Math.random() * team.length)];
      
      // Basic check to prevent initial matches
      let attempts = 0;
      while (attempts < 50) {
        let conflict = false;
        if (x >= 2) {
           const left1 = board[y * GRID_WIDTH + (x - 1)];
           const left2 = board[y * GRID_WIDTH + (x - 2)];
           if (left1.monsterId === monster.id && left2.monsterId === monster.id) conflict = true;
        }
        if (!conflict && y >= 2) {
           const up1 = board[(y - 1) * GRID_WIDTH + x];
           const up2 = board[(y - 2) * GRID_WIDTH + x];
           if (up1.monsterId === monster.id && up2.monsterId === monster.id) conflict = true;
        }
        if (!conflict) break;
        monster = team[Math.floor(Math.random() * team.length)];
        attempts++;
      }

      board.push({
        id: generateId(x, 'init'),
        monsterId: monster.id,
        type: monster.type,
        emoji: monster.emoji,
        image: monster.image, // Pass image
        isMatched: false,
        x,
        y,
        status: 'normal'
      });
    }
  }
  return board;
};

export const getTileAt = (board: TileData[], x: number, y: number): TileData | undefined => {
  if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return undefined;
  return board.find((t) => t.x === x && t.y === y);
};

export const findMatches = (board: TileData[]): MatchResult => {
  const groups: MatchGroup[] = [];
  const processedInCurrentPass = new Set<string>(); 
  const clearedObstacles: string[] = [];

  const addGroup = (tiles: TileData[]) => {
    // STRICT RULE: Steel blocks (status === 'steel') CANNOT participate in matches.
    const validTiles = tiles.filter(t => t.status !== 'rock' && t.status !== 'steel');
    
    if (validTiles.length < 3) return;

    const ids = validTiles.map(t => t.id);
    const uniqueIds = ids.filter(id => !processedInCurrentPass.has(id));
    if (uniqueIds.length === 0) return;
    
    uniqueIds.forEach(id => processedInCurrentPass.add(id));
    
    // Check for ADJACENT ROCKS/ICE to break
    validTiles.forEach(t => {
        const neighbors = [
            getTileAt(board, t.x + 1, t.y),
            getTileAt(board, t.x - 1, t.y),
            getTileAt(board, t.x, t.y + 1),
            getTileAt(board, t.x, t.y - 1),
        ];
        neighbors.forEach(n => {
            // Normal matches break adjacent Rocks
            if (n && n.status === 'rock' && !clearedObstacles.includes(n.id)) {
                clearedObstacles.push(n.id);
            }
        });
    });

    groups.push({
      ids: ids,
      type: validTiles[0].monsterId, 
      points: validTiles.length * 100,
      center: { x: validTiles[Math.floor(validTiles.length/2)].x, y: validTiles[Math.floor(validTiles.length/2)].y }
    });
  };

  // Horizontal Scans
  for (let y = 0; y < GRID_HEIGHT; y++) {
    let currentId = null;
    let currentRun: TileData[] = [];
    
    for (let x = 0; x < GRID_WIDTH; x++) {
      const tile = getTileAt(board, x, y);
      const isMatchable = tile && tile.status !== 'rock' && tile.status !== 'steel';
      
      if (isMatchable && tile.monsterId === currentId) {
        currentRun.push(tile);
      } else {
        if (currentRun.length >= 3) addGroup(currentRun);
        currentId = isMatchable ? tile.monsterId : null;
        currentRun = isMatchable ? [tile] : [];
      }
    }
    if (currentRun.length >= 3) addGroup(currentRun);
  }

  // Vertical Scans
  for (let x = 0; x < GRID_WIDTH; x++) {
    let currentId = null;
    let currentRun: TileData[] = [];
    
    for (let y = 0; y < GRID_HEIGHT; y++) {
      const tile = getTileAt(board, x, y);
      const isMatchable = tile && tile.status !== 'rock' && tile.status !== 'steel';

      if (isMatchable && tile.monsterId === currentId) {
        currentRun.push(tile);
      } else {
        if (currentRun.length >= 3) addGroup(currentRun);
        currentId = isMatchable ? tile.monsterId : null;
        currentRun = isMatchable ? [tile] : [];
      }
    }
    if (currentRun.length >= 3) addGroup(currentRun);
  }

  const allMatchedIds = Array.from(new Set([...groups.flatMap(g => g.ids), ...clearedObstacles]));
  
  return {
    groups,
    allMatchedIds,
    totalPoints: 0,
    clearedObstacles
  };
};

export const resolveMatches = (
  board: TileData[],
  matchedIds: string[],
  team: Boss[],
  decreaseSteel: boolean 
): { newBoard: TileData[] } => {
  
  let grid: (TileData | null)[][] = Array(GRID_WIDTH).fill(null).map(() => Array(GRID_HEIGHT).fill(null));

  board.forEach(t => {
      if (matchedIds.includes(t.id)) {
          grid[t.x][t.y] = null;
      } else {
          if (decreaseSteel && t.status === 'steel' && t.statusLife !== undefined) {
              const newLife = t.statusLife - 1;
              if (newLife <= 0) {
                   grid[t.x][t.y] = { ...t, status: 'normal', statusLife: undefined, id: t.id + '_broken' };
              } else {
                   grid[t.x][t.y] = { ...t, statusLife: newLife };
              }
          } else {
              grid[t.x][t.y] = t;
          }
      }
  });

  const finalBoard: TileData[] = [];

  for (let x = 0; x < GRID_WIDTH; x++) {
      const col = grid[x];
      const newCol: (TileData | null)[] = new Array(GRID_HEIGHT).fill(null);
      let writeY = GRID_HEIGHT - 1;
      
      // Ice stays fixed
      for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
          const tile = col[y];
          if (tile && tile.status === 'ice') {
              newCol[y] = { ...tile, x, y }; 
          }
      }

      // Fill non-ice slots
      let targetY = GRID_HEIGHT - 1;
      for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
          if (newCol[targetY] && newCol[targetY]?.status === 'ice') {
              targetY--;
              if (y === targetY + 1) continue; 
          }
          
          if (targetY < 0) break;

          const tile = col[y];

          if (tile && tile.status === 'ice') {
               targetY = y - 1;
          } else if (tile) {
              while (targetY >= 0 && newCol[targetY]?.status === 'ice') {
                  targetY--;
              }
              
              if (targetY >= 0) {
                  newCol[targetY] = { ...tile, x, y: targetY };
                  targetY--;
              }
          }
      }

      // Spawning Logic
      let blocked = false;
      for (let y = 0; y < GRID_HEIGHT; y++) {
          if (newCol[y] && newCol[y]?.status === 'ice') {
              blocked = true;
          }
          
          if (!newCol[y]) {
              if (!blocked) {
                  const monster = team[Math.floor(Math.random() * team.length)];
                  newCol[y] = {
                      id: generateId(x, 'new'),
                      monsterId: monster.id,
                      type: monster.type,
                      emoji: monster.emoji,
                      image: monster.image, // Pass image
                      isMatched: false,
                      x: x,
                      y: y,
                      status: 'normal'
                  };
              }
          }
      }
      
      newCol.forEach(t => {
          if (t) finalBoard.push(t);
      });
  }
  
  return { newBoard: finalBoard };
};

export const applyInterference = (board: TileData[], type: 'rock' | 'ice' | 'steel'): TileData[] => {
    const targets = board.filter(t => t.status === 'normal');
    if (targets.length === 0) return board;

    const count = Math.min(targets.length, Math.floor(Math.random() * 3) + 2);
    const chosenIds = new Set<string>();
    
    for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * targets.length);
        chosenIds.add(targets[idx].id);
        targets.splice(idx, 1);
    }

    return board.map(t => {
        if (chosenIds.has(t.id)) {
            return {
                ...t,
                status: type,
                statusLife: type === 'steel' ? 5 : undefined,
                id: t.id + '_mod' 
            };
        }
        return t;
    });
};
