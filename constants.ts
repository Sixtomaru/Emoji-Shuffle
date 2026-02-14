import { Boss, ElementType } from "./types";

export const INITIAL_MOVES = 5;
export const MOVES_PER_LEVEL = 5;
export const ANIMATION_DELAY = 300;

export const TYPE_CHART: Record<ElementType, ElementType[]> = {
    'Fuego': ['Planta', 'Hielo', 'Acero', 'Bicho'],
    'Agua': ['Fuego', 'Tierra', 'Roca'],
    'Planta': ['Agua', 'Tierra', 'Roca'],
    'Eléctrico': ['Agua', 'Volador'],
    'Tierra': ['Fuego', 'Eléctrico', 'Roca', 'Acero'],
    'Roca': ['Fuego', 'Hielo', 'Volador', 'Bicho'],
    'Hielo': ['Planta', 'Tierra', 'Volador', 'Dragón'],
    'Acero': ['Hielo', 'Roca', 'Hada'],
    'Fantasma': ['Fantasma', 'Psíquico'],
    'Dragón': ['Dragón'],
    'Normal': [],
    'Bicho': ['Planta', 'Psíquico', 'Siniestro'],
    'Volador': ['Planta', 'Bicho', 'Lucha'],
    'Psíquico': ['Lucha'],
    'Hada': ['Dragón', 'Lucha', 'Siniestro'],
    'Lucha': ['Normal', 'Hielo', 'Roca', 'Acero', 'Siniestro'],
    'Siniestro': ['Fantasma', 'Psíquico']
};

export const TYPE_ICONS: Record<ElementType, string> = {
    'Fuego': '🔥',
    'Agua': '💧',
    'Planta': '🌿',
    'Eléctrico': '⚡',
    'Tierra': '⛰️',
    'Roca': '🪨',
    'Hielo': '❄️',
    'Acero': '🛡️',
    'Fantasma': '👻',
    'Dragón': '🐲',
    'Normal': '⚪',
    'Bicho': '🪲',
    'Volador': '🪶',
    'Psíquico': '🔮',
    'Hada': '✨',
    'Lucha': '🥊',
    'Siniestro': '🌑'
};

// Small icons for the projectile stream
export const TYPE_PROJECTILE_ICONS: Record<ElementType, string> = {
    'Fuego': '🔥',
    'Agua': '💧',
    'Planta': '🍃',
    'Eléctrico': '⚡',
    'Tierra': '🪨',
    'Roca': '🌑',
    'Hielo': '🧊',
    'Acero': '🔩',
    'Fantasma': '🟣',
    'Dragón': '🔥',
    'Normal': '⭐',
    'Bicho': '🦗',
    'Volador': '🌪️',
    'Psíquico': '🌀',
    'Hada': '✨',
    'Lucha': '👊',
    'Siniestro': '🌙'
};

export const TYPE_PASTELS: Record<ElementType, string> = {
    'Fuego': 'bg-red-200/40 border-red-300/50',
    'Agua': 'bg-blue-200/40 border-blue-300/50',
    'Planta': 'bg-green-200/40 border-green-300/50',
    'Eléctrico': 'bg-yellow-100/40 border-yellow-200/50',
    'Tierra': 'bg-orange-200/40 border-orange-300/50',
    'Roca': 'bg-stone-300/40 border-stone-400/50',
    'Hielo': 'bg-cyan-100/40 border-cyan-200/50',
    'Acero': 'bg-slate-300/40 border-slate-400/50',
    'Fantasma': 'bg-purple-200/40 border-purple-300/50',
    'Dragón': 'bg-indigo-300/40 border-indigo-400/50',
    'Normal': 'bg-gray-200/40 border-gray-300/50',
    'Bicho': 'bg-lime-200/40 border-lime-300/50',
    'Volador': 'bg-sky-200/40 border-sky-300/50',
    'Psíquico': 'bg-pink-200/40 border-pink-300/50',
    'Hada': 'bg-rose-200/40 border-rose-300/50',
    'Lucha': 'bg-orange-700/40 border-orange-600/50',
    'Siniestro': 'bg-slate-800/60 border-slate-700/50'
};

export const TYPE_VIVID: Record<ElementType, string> = {
    'Fuego': 'bg-red-500',
    'Agua': 'bg-blue-500',
    'Planta': 'bg-green-500',
    'Eléctrico': 'bg-yellow-500',
    'Tierra': 'bg-amber-600',
    'Roca': 'bg-stone-600',
    'Hielo': 'bg-cyan-500',
    'Acero': 'bg-slate-500',
    'Fantasma': 'bg-purple-600',
    'Dragón': 'bg-indigo-600',
    'Normal': 'bg-slate-400',
    'Bicho': 'bg-lime-500',
    'Volador': 'bg-sky-500',
    'Psíquico': 'bg-pink-500',
    'Hada': 'bg-rose-400',
    'Lucha': 'bg-orange-700',
    'Siniestro': 'bg-gray-900'
};

// Interference Mapping
export const INTERFERENCE_RULES: Record<ElementType, 'rock' | 'steel' | 'ice' | 'random'> = {
    'Fuego': 'rock', 'Tierra': 'rock',
    'Roca': 'steel', 'Acero': 'steel',
    'Hielo': 'ice', 'Psíquico': 'ice', 'Agua': 'ice',
    'Planta': 'rock', 'Eléctrico': 'steel', 'Bicho': 'rock',
    'Fantasma': 'ice', 'Volador': 'rock', 'Hada': 'ice',
    'Normal': 'random', 'Dragón': 'random',
    'Lucha': 'rock', 'Siniestro': 'ice'
};


// --- PREMIUM BACKGROUNDS ---
const BG_DEFAULT = "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black";

const BG_FIRE = "bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-800 via-red-900 to-slate-950";
const BG_WATER = "bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-900 via-blue-900 to-slate-950";
const BG_NATURE = "bg-[conic-gradient(at_top_left,_var(--tw-gradient-stops))] from-lime-900 via-emerald-900 to-slate-950";
const BG_ELECTRIC = "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-900/50 via-slate-900 to-black";
const BG_EARTH = "bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-amber-900 via-stone-900 to-black";
const BG_ICE = "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-800 via-blue-950 to-black";
const BG_GHOST = "bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-900 via-indigo-950 to-slate-950";
const BG_STEEL = "bg-[conic-gradient(at_bottom_right,_var(--tw-gradient-stops))] from-slate-700 via-gray-900 to-black";
const BG_DRAGON = "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-800 via-violet-950 to-black";
const BG_FAIRY = "bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-pink-900 via-rose-950 to-slate-950";
const BG_SKY = "bg-[linear-gradient(to_bottom,_var(--tw-gradient-stops))] from-sky-900 via-blue-950 to-slate-900";
const BG_FIGHT = "bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-orange-900 via-red-950 to-black";
const BG_DARK = "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-slate-950 to-black";


export const MONSTER_DB: Boss[] = [
    // STARTERS
    // Fuego -> Descongela
    { 
        id: "m001", 
        name: "Simiobrasa", 
        emoji: "🐵", 
        type: "Fuego", 
        maxHp: 800, 
        currentHp: 800, 
        description: "Un mono con serios problemas de control de ira que intentó hacer una barbacoa y acabó incendiando medio bosque.", 
        skillType: "clear_ice", 
        skillName: "Calor Corporal", 
        skillCost: 10, 
        skillDescription: "Derrite 4 Hielos." 
    },
    // Agua -> Rompe Rocas
    { 
        id: "m002", 
        name: "Aquapato", 
        emoji: "🦆", 
        type: "Agua", 
        maxHp: 800, 
        currentHp: 800, 
        description: "Un pato de goma que cobró vida tras caer en un residuo radiactivo. Tiene miedo al agua profunda.", 
        skillType: "clear_rocks", 
        skillName: "Chorro Presión", 
        skillCost: 10, 
        skillDescription: "Rompe 4 Rocas." 
    },
    // Planta -> Combo/Convert
    { 
        id: "m003", 
        name: "Hojaraptor", 
        emoji: "🦕", 
        type: "Planta", 
        maxHp: 900, 
        currentHp: 900, 
        description: "Un dinosaurio vegano extremo que solo come plantas de plástico.", 
        skillType: "convert_type", 
        skillName: "Brotes Verdes", 
        skillCost: 15, 
        skillDescription: "Convierte 5 fichas en Hojaraptor." 
    },
    // Eléctrico -> Descongela
    { 
        id: "m004", 
        name: "Chispamouse", 
        emoji: "🐭", 
        type: "Eléctrico", 
        maxHp: 750, 
        currentHp: 750, 
        description: "Roedor adicto a masticar cables de alta tensión. Su factura de la luz es astronómica.", 
        skillType: "clear_ice", 
        skillName: "Cortocircuito", 
        skillCost: 14, 
        skillDescription: "Derrite 6 Hielos." 
    },
    
    // LEVEL 1-10
    // Tierra -> Rompe Acero
    { id: "m005", name: "Rocaradillo", emoji: "🦔", type: "Tierra", maxHp: 1200, currentHp: 1200, description: "Descubrió que rodar es más rápido que caminar y ahora se niega a usar sus patas.", skillType: "clear_steel", skillName: "Terremoto", skillCost: 12, skillDescription: "Rompe 3 Aceros." },
    // Fantasma -> Combo/Nuke
    { id: "m006", name: "Fantasmín", emoji: "👻", type: "Fantasma", maxHp: 1100, currentHp: 1100, description: "Un espectro con ansiedad social severa.", skillType: "nuke", skillName: "Susto Mortal", skillCost: 18, skillDescription: "Daño fijo de 2000." },
    // Hielo -> Rompe Rocas
    { id: "m007", name: "Copo", emoji: "❄️", type: "Hielo", maxHp: 1300, currentHp: 1300, description: "Obsesionado con la geometría fractal.", skillType: "clear_rocks", skillName: "Desprendimiento", skillCost: 12, skillDescription: "Rompe 5 Rocas." },
    // Roca -> Rompe Acero
    { id: "m008", name: "Gólem", emoji: "🗿", type: "Roca", maxHp: 2000, currentHp: 2000, description: "Una estatua de la Isla de Pascua que se cansó de mirar al horizonte.", skillType: "clear_steel", skillName: "Cabezazo", skillCost: 15, skillDescription: "Rompe 4 Aceros." },
    // REPLACED: Electrobird -> Pillo (Volador)
    { id: "m009", name: "Pillo", emoji: "🐦", type: "Volador", maxHp: 1500, currentHp: 1500, description: "Un pájaro cleptómano que colecciona objetos brillantes.", skillType: "clear_ice", skillName: "Aleteo", skillCost: 12, skillDescription: "Derrite 5 Hielos." },
    // Dragón (Boss) -> Random/Any
    { id: "m010", name: "Draco", emoji: "🐉", type: "Dragón", maxHp: 3000, currentHp: 3000, description: "JEFE: Acumula oro compulsivamente.", skillType: "clear_random", skillName: "Caos Dracónico", skillCost: 15, skillDescription: "Elimina 5 casillas al azar." },
    
    // LEVEL 11-20
    // Acero -> Rompe Acero
    { id: "m011", name: "AceroBot", emoji: "🤖", type: "Acero", maxHp: 3500, currentHp: 3500, description: "Un robot de limpieza que cobró conciencia.", skillType: "clear_steel", skillName: "Taladro", skillCost: 18, skillDescription: "Rompe 5 Aceros." },
    // REPLACED: Magmablob -> Kankik (Lucha)
    { id: "m012", name: "Kankik", emoji: "🦘", type: "Lucha", maxHp: 3800, currentHp: 3800, description: "Un canguro boxeador con un gancho de derecha devastador.", skillType: "clear_rocks", skillName: "Puño Dinámico", skillCost: 15, skillDescription: "Rompe 6 Rocas." },
    // Planta -> Convert
    { id: "m013", name: "Cactus", emoji: "🌵", type: "Planta", maxHp: 3200, currentHp: 3200, description: "Quiere abrazar a todo el mundo para demostrar su afecto.", skillType: "convert_type", skillName: "Espinas Amigas", skillCost: 18, skillDescription: "Convierte 6 fichas en Cactus." },
    // REPLACED: Tibucyber -> Trizeta (Psíquico)
    { id: "m014", name: "Trizeta", emoji: "🦥", type: "Psíquico", maxHp: 4000, currentHp: 4000, description: "Se mueve tan lento que ve el futuro.", skillType: "convert_type", skillName: "Premonición", skillCost: 15, skillDescription: "Convierte 5 fichas en Trizeta." },
    // Fantasma -> Combo/Self Clear
    { id: "m015", name: "Ojo Sombra", emoji: "👁️", type: "Fantasma", maxHp: 3600, currentHp: 3600, description: "Te está mirando y juzga tus decisiones.", skillType: "clear_self", skillName: "Desvanecerse", skillCost: 14, skillDescription: "Elimina 6 Ojos Sombra." },
    // REPLACED: Zombi -> Mapatraka (Siniestro)
    { id: "m016", name: "Mapatraka", emoji: "🦝", type: "Siniestro", maxHp: 4200, currentHp: 4200, description: "Un mapache bandido que opera bajo la luz de la luna.", skillType: "clear_random", skillName: "Robo", skillCost: 20, skillDescription: "Elimina 7 casillas al azar." },
    // Acero -> Rompe Acero
    { id: "m017", name: "Alien", emoji: "👽", type: "Acero", maxHp: 4500, currentHp: 4500, description: "Vino a invadir la Tierra pero descubrió TikTok.", skillType: "clear_steel", skillName: "Rayo Tractor", skillCost: 15, skillDescription: "Rompe 4 Aceros." },
    // Agua -> Rompe Rocas
    { id: "m018", name: "Kraken", emoji: "🐙", type: "Agua", maxHp: 5000, currentHp: 5000, description: "Un cefalópodo incomprendido que solo quiere chocar los cinco.", skillType: "clear_rocks", skillName: "Tentáculos", skillCost: 12, skillDescription: "Rompe 5 Rocas." },
    // Hielo -> Rompe Rocas
    { id: "m019", name: "Yeti", emoji: "🦍", type: "Hielo", maxHp: 5500, currentHp: 5500, description: "El campeón indiscutible de las escondidas.", skillType: "clear_rocks", skillName: "Avalancha", skillCost: 15, skillDescription: "Rompe 6 Rocas." },
    // REPLACED: Fénix (Boss) -> Gato (Siniestro)
    { id: "m020", name: "Gato", emoji: "😺", type: "Siniestro", maxHp: 6000, currentHp: 6000, description: "JEFE: Planea la dominación mundial desde su caja de arena.", skillType: "clear_self", skillName: "7 Vidas", skillCost: 15, skillDescription: "Elimina todos los Gatos." },

    // HARD MODE
    // Fantasma -> Convert
    { id: "m021", name: "Vampiro", emoji: "🧛", type: "Fantasma", maxHp: 7000, currentHp: 7000, description: "Odia trabajar de noche y tiene déficit de vitamina D.", skillType: "convert_type", skillName: "Hipnosis", skillCost: 20, skillDescription: "Convierte 7 fichas en Vampiros." },
    // Eléctrico -> Descongela
    { id: "m022", name: "Genio", emoji: "🧞", type: "Eléctrico", maxHp: 7500, currentHp: 7500, description: "Un bromista cósmico.", skillType: "clear_ice", skillName: "Deseo Ardiente", skillCost: 18, skillDescription: "Derrite 7 Hielos." },
    // REPLACED: Oni -> Peñasco (Roca)
    { id: "m023", name: "Peñasco", emoji: "🐗", type: "Roca", maxHp: 8000, currentHp: 8000, description: "Un jabalí tan duro que rompe diamantes.", skillType: "clear_steel", skillName: "Embestida", skillCost: 18, skillDescription: "Rompe 5 Aceros." },
    // Normal -> Random Clear
    { id: "m024", name: "Payaso", emoji: "🤡", type: "Normal", maxHp: 8500, currentHp: 8500, description: "Se ríe solo en rincones oscuros.", skillType: "clear_random", skillName: "Broma Pesada", skillCost: 16, skillDescription: "Elimina 6 casillas al azar." },
    // REPLACED: Unicornio -> Cucujaca (Hada)
    { id: "m025", name: "Cucujaca", emoji: "🦄", type: "Hada", maxHp: 9000, currentHp: 9000, description: "Una leyenda que concede deseos a cambio de zanahorias.", skillType: "clear_rocks", skillName: "Polvo de Hada", skillCost: 18, skillDescription: "Elimina 7 Rocas." },
    // Dragón -> Clear Self
    { id: "m026", name: "T-Rex", emoji: "🦖", type: "Dragón", maxHp: 10000, currentHp: 10000, description: "Está muy enfadado porque no puede abrocharse los zapatos.", skillType: "clear_self", skillName: "Rugido", skillCost: 15, skillDescription: "Elimina 7 T-Rex." },
    // REPLACED: Cthulhu -> Tembleon (Tierra)
    { id: "m027", name: "Tembleon", emoji: "🦁", type: "Tierra", maxHp: 12000, currentHp: 12000, description: "Su rugido puede partir continentes por la mitad.", skillType: "clear_rocks", skillName: "Terremoto", skillCost: 20, skillDescription: "Rompe 8 Rocas." },
    // REPLACED: Muerte -> Bicheto (Bicho)
    { id: "m028", name: "Bicheto", emoji: "🐛", type: "Bicho", maxHp: 14000, currentHp: 14000, description: "Tiene un apetito insaciable por ciudades enteras.", skillType: "nuke", skillName: "Picadura Letal", skillCost: 25, skillDescription: "Daño fijo de 3500." },
    // REPLACED: Sol -> Orange (Fuego)
    { id: "m029", name: "Orange", emoji: "🦧", type: "Fuego", maxHp: 16000, currentHp: 16000, description: "Un orangután con pelaje hecho de plasma solar.", skillType: "clear_ice", skillName: "Llama Solar", skillCost: 25, skillDescription: "Derrite 8 Hielos." },
    // Normal (Boss) -> Convert
    { id: "m030", name: "Rey Slime", emoji: "👑", type: "Normal", maxHp: 20000, currentHp: 20000, description: "JEFE: Una masa gelatinosa con corona.", skillType: "convert_type", skillName: "Real Decreto", skillCost: 25, skillDescription: "Convierte 8 fichas en Rey Slime." },
];

export const SECRET_BOSS: Boss = {
    id: "m999", 
    name: "Dios Emoji", 
    emoji: "😎", 
    type: "Normal", 
    maxHp: 40000, 
    currentHp: 40000, 
    description: "La entidad suprema del mundo digital.", 
    skillType: "clear_random", 
    skillName: "Banhammer", 
    skillCost: 30, 
    skillDescription: "Elimina 10 casillas al azar."
};

export const getLevelBackground = (level: number, type: ElementType): string => {
    switch (type) {
        case 'Fuego': return BG_FIRE;
        case 'Agua': return BG_WATER;
        case 'Planta': 
        case 'Bicho': return BG_NATURE;
        case 'Eléctrico': return BG_ELECTRIC;
        case 'Tierra': 
        case 'Roca': return BG_EARTH;
        case 'Hielo': return BG_ICE;
        case 'Fantasma': 
        case 'Psíquico': return BG_GHOST;
        case 'Acero': return BG_STEEL;
        case 'Dragón': return BG_DRAGON;
        case 'Hada': return BG_FAIRY;
        case 'Volador': return BG_SKY;
        case 'Lucha': return BG_FIGHT;
        case 'Siniestro': return BG_DARK;
        default: return BG_DEFAULT;
    }
};