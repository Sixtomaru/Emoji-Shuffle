import { TileData, GRID_WIDTH, GRID_HEIGHT, Boss } from "../types";

export interface MatchGroup {
  ids: string[];
  type: string;
  center: { x: number, y: number };
  direction: 'horizontal' | 'vertical'; 
}

export interface MatchResult {
  groups: MatchGroup[];
  allMatchedIds: string[];
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
  const processedIds = new Set<string>();

  // Create grid for easy access
  const grid: (TileData | null)[][] = Array(GRID_WIDTH).fill(null).map(() => Array(GRID_HEIGHT).fill(null));
  board.forEach(t => {
      if (t.x >= 0 && t.x < GRID_WIDTH && t.y >= 0 && t.y < GRID_HEIGHT) {
          grid[t.x][t.y] = t;
      }
  });

  const isValidTile = (t: TileData | null) => t && t.status !== 'rock' && t.status !== 'steel';

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
                  for (let k = 0; k < matchLen; k++) {
                      const t = grid[x - k][y];
                      if (t) ids.push(t.id);
                  }
                  
                  // Unique signature for this specific match group
                  const sig = `h|${ids.sort().join('|')}`;
                  if (!processedIds.has(sig)) {
                      processedIds.add(sig);
                      const tiles = ids.map(id => board.find(b => b.id === id)!);
                      const sortedTiles = tiles.sort((a,b) => a.x - b.x);
                      
                      groups.push({
                          ids: ids,
                          type: sortedTiles[0].monsterId,
                          center: sortedTiles[Math.floor(sortedTiles.length / 2)],
                          direction: 'horizontal'
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
                  for (let k = 0; k < matchLen; k++) {
                      const t = grid[x][y - k];
                      if (t) ids.push(t.id);
                  }

                  const sig = `v|${ids.sort().join('|')}`;
                  if (!processedIds.has(sig)) {
                      processedIds.add(sig);
                      const tiles = ids.map(id => board.find(b => b.id === id)!);
                      const sortedTiles = tiles.sort((a,b) => a.y - b.y);

                      groups.push({
                          ids: ids,
                          type: sortedTiles[0].monsterId,
                          center: sortedTiles[Math.floor(sortedTiles.length / 2)],
                          direction: 'vertical'
                      });
                  }
              }
              matchLen = 1;
          }
      }
  }
  
  // Note: We intentionally do NOT merge intersecting groups here anymore.
  // A cross will return 1 Horizontal group AND 1 Vertical group.

  const allMatchedIds = Array.from(new Set(groups.flatMap(g => g.ids)));
  return { groups, allMatchedIds };
};

// --- STABLE GRAVITY (STACK LOGIC) ---
export const applyGravity = (
    currentBoard: TileData[], 
    idsToRemove: string[], 
    team: Boss[]
): TileData[] => {
    const nextBoard: TileData[] = [];

    // Process COLUMN BY COLUMN
    for (let x = 0; x < GRID_WIDTH; x++) {
        // 1. Get tiles in this column that are NOT being removed
        // Sort by Y ascending (0 is top, 5 is bottom) to preserve order
        const existingInCol = currentBoard
            .filter(t => t.x === x && !idsToRemove.includes(t.id))
            .sort((a, b) => a.y - b.y);

        // 2. How many slots do we need to fill?
        const missingCount = GRID_HEIGHT - existingInCol.length;

        // 3. Generate NEW tiles for the TOP slots (0 to missingCount - 1)
        for (let i = 0; i < missingCount; i++) {
            const monster = team[Math.floor(Math.random() * team.length)];
            nextBoard.push({
                id: generateId(`spawn_c${x}_${i}`),
                monsterId: monster.id,
                type: monster.type,
                emoji: monster.emoji,
                image: monster.image,
                isMatched: false,
                x: x,
                y: i, // New tiles start at top
                status: 'normal'
            });
        }

        // 4. Shift EXISTING tiles down (missingCount to GRID_HEIGHT)
        existingInCol.forEach((tile, index) => {
            nextBoard.push({
                ...tile,
                x: x,
                y: missingCount + index, // Shift down
                isMatched: false 
            });
        });
    }

    return nextBoard;
};

export const applyInterference = (board: TileData[], type: 'rock' | 'ice' | 'steel'): TileData[] => {
    const targets = board.filter(t => t.status === 'normal');
    if (targets.length === 0) return board;

    const count = Math.min(targets.length, Math.floor(Math.random() * 3) + 2);
    const shuffled = targets.sort(() => 0.5 - Math.random());
    const affected = new Set(shuffled.slice(0, count).map(t => t.id));

    return board.map(t => {
        if (affected.has(t.id)) {
            return {
                ...t,
                status: type,
                statusLife: type === 'steel' ? 5 : undefined,
                monsterId: `obstacle_${type}`,
                emoji: type === 'rock' ? '🪨' : type === 'ice' ? '🧊' : '⚙️',
            };
        }
        return t;
    });
};