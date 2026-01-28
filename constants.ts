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
    'Bicho': ['Planta', 'Psíquico'],
    'Volador': ['Planta', 'Bicho'],
    'Psíquico': [],
    'Hada': ['Dragón']
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
    'Hada': 'bg-rose-200/40 border-rose-300/50'
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
    'Hada': 'bg-rose-400'
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


export const MONSTER_DB: Boss[] = [
    // STARTERS - Removed images to ensure consistency and avoid errors
    { 
        id: "m001", 
        name: "Simiobrasa", 
        emoji: "🐵", 
        type: "Fuego", 
        maxHp: 800, 
        currentHp: 800, 
        description: "Un mono travieso cuya cola siempre está encendida. Le encanta gastar bromas calientes.", 
        skillType: "clear_ice", 
        skillName: "Calor Corporal", 
        skillCost: 8, 
        skillDescription: "Derrite 5 Hielos." 
    },
    { 
        id: "m002", 
        name: "Aquapato", 
        emoji: "🦆", 
        type: "Agua", 
        maxHp: 800, 
        currentHp: 800, 
        description: "Nunca sale de casa sin su flotador favorito. Sueña con cruzar el océano.", 
        skillType: "damage_aoe", 
        skillName: "Ola", 
        skillCost: 10, 
        skillDescription: "Inflige 300 de daño." 
    },
    { 
        id: "m003", 
        name: "Hojaraptor", 
        emoji: "🦕", // Changed from 🦖 to 🦕 to avoid duplicate with T-Rex
        type: "Planta", 
        maxHp: 900, 
        currentHp: 900, 
        description: "Un pequeño dinosaurio que se cree un arbusto.", 
        skillType: "clear_rocks", 
        skillName: "Látigo Cepa", 
        skillCost: 8, 
        skillDescription: "Rompe 5 Rocas." 
    },
    { 
        id: "m004", 
        name: "Chispamouse", 
        emoji: "🐭", 
        type: "Eléctrico", 
        maxHp: 750, 
        currentHp: 750, 
        description: "Almacena tanta electricidad que enciende bombillas cuando estornuda.", 
        skillType: "nuke", 
        skillName: "Rayo", 
        skillCost: 15, 
        skillDescription: "Impacto de 800 daño." 
    },
    
    // LEVEL 1-10
    { id: "m005", name: "Rocaradillo", emoji: "🦔", type: "Tierra", maxHp: 1200, currentHp: 1200, description: "Se hace una bola y rueda colina abajo por pura diversión.", skillType: "clear_steel", skillName: "Terremoto", skillCost: 12, skillDescription: "Rompe 3 Aceros." },
    { id: "m006", name: "Fantasmín", emoji: "👻", type: "Fantasma", maxHp: 1100, currentHp: 1100, description: "Un espíritu tímido que intenta asustar pero solo consigue abrazos.", skillType: "damage_single", skillName: "Susto", skillCost: 6, skillDescription: "Golpe de 250 daño." },
    { id: "m007", name: "Copo", emoji: "❄️", type: "Hielo", maxHp: 1300, currentHp: 1300, description: "Hecho de nieve eterna. Le encantan los granizados.", skillType: "clear_ice", skillName: "Deshielo", skillCost: 9, skillDescription: "Elimina 5 hielos." },
    { id: "m008", name: "Gólem", emoji: "🗿", type: "Roca", maxHp: 2000, currentHp: 2000, description: "Una antigua estatua que cobró vida por aburrimiento.", skillType: "damage_single", skillName: "Lanzarrocas", skillCost: 14, skillDescription: "Golpe de 600 daño." },
    { id: "m009", name: "Electrobird", emoji: "🦅", type: "Eléctrico", maxHp: 1500, currentHp: 1500, description: "Surca las tormentas buscando el rayo perfecto.", skillType: "damage_aoe", skillName: "Trueno", skillCost: 12, skillDescription: "Descarga de 500 daño." },
    { id: "m010", name: "Draco", emoji: "🐉", type: "Dragón", maxHp: 3000, currentHp: 3000, description: "Cree que es temible, pero su rugido suena como un estornudo.", skillType: "nuke", skillName: "Cometa Draco", skillCost: 18, skillDescription: "Impacto de 1500 daño." },
    
    // LEVEL 11-20
    { id: "m011", name: "AceroBot", emoji: "🤖", type: "Acero", maxHp: 3500, currentHp: 3500, description: "Colecciona tornillos brillantes obsesivamente.", skillType: "clear_rocks", skillName: "Taladro", skillCost: 10, skillDescription: "Destruye 6 Rocas." },
    { id: "m012", name: "Magmablob", emoji: "🌋", type: "Fuego", maxHp: 3800, currentHp: 3800, description: "Una masa de lava muy cariñosa que no controla su temperatura.", skillType: "damage_aoe", skillName: "Erupción", skillCost: 15, skillDescription: "Gran daño en área." },
    { id: "m013", name: "Cactus", emoji: "🌵", type: "Planta", maxHp: 3200, currentHp: 3200, description: "Un tipo espinoso con un corazón blando.", skillType: "damage_single", skillName: "Pincho Cañón", skillCost: 8, skillDescription: "Golpe de 400 daño." },
    { id: "m014", name: "Tibucyber", emoji: "🦈", type: "Agua", maxHp: 4000, currentHp: 4000, description: "Navega por las corrientes de Internet y muerde los cables.", skillType: "damage_single", skillName: "Hidrobomba", skillCost: 12, skillDescription: "Golpe de 800 daño." },
    { id: "m015", name: "Ojo Sombra", emoji: "👁️", type: "Fantasma", maxHp: 3600, currentHp: 3600, description: "Campeón mundial de 'el que parpadea pierde'.", skillType: "convert_type", skillName: "Hipnosis", skillCost: 12, skillDescription: "Transforma fichas." },
    { id: "m016", name: "Zombi", emoji: "🧟", type: "Fantasma", maxHp: 4200, currentHp: 4200, description: "Prefiere la pizza fría a los cerebros.", skillType: "damage_single", skillName: "Mordisco", skillCost: 8, skillDescription: "Golpe de 500 daño." },
    { id: "m017", name: "Alien", emoji: "👽", type: "Acero", maxHp: 4500, currentHp: 4500, description: "Vino a la Tierra y se distrajo viendo vídeos de gatitos.", skillType: "nuke", skillName: "Láser", skillCost: 16, skillDescription: "Impacto de 1200 daño." },
    { id: "m018", name: "Kraken", emoji: "🐙", type: "Agua", maxHp: 5000, currentHp: 5000, description: "Solo quiere chocar esos cinco, pero asusta a los marineros.", skillType: "damage_aoe", skillName: "Tinta", skillCost: 14, skillDescription: "Golpe de 600 daño." },
    { id: "m019", name: "Yeti", emoji: "🦍", type: "Hielo", maxHp: 5500, currentHp: 5500, description: "Hace los mejores helados de nieve de todo el Himalaya.", skillType: "clear_ice", skillName: "Puño Hielo", skillCost: 10, skillDescription: "Rompe 6 hielos." },
    { id: "m020", name: "Fénix", emoji: "🦅", type: "Fuego", maxHp: 6000, currentHp: 6000, description: "El rey indiscutible del drama y de las cenizas.", skillType: "damage_aoe", skillName: "Llamarada", skillCost: 18, skillDescription: "Impacto de 1000 daño." },

    // HARD MODE
    { id: "m021", name: "Vampiro", emoji: "🧛", type: "Fantasma", maxHp: 7000, currentHp: 7000, description: "Se queja constantemente del precio del protector solar.", skillType: "damage_single", skillName: "Drenaje", skillCost: 12, skillDescription: "Golpe de 800 daño." },
    { id: "m022", name: "Genio", emoji: "🧞", type: "Eléctrico", maxHp: 7500, currentHp: 7500, description: "Siempre interpreta mal los deseos para divertirse.", skillType: "convert_type", skillName: "Magia", skillCost: 15, skillDescription: "Caos en el tablero." },
    { id: "m023", name: "Oni", emoji: "👹", type: "Roca", maxHp: 8000, currentHp: 8000, description: "Le encantan los duelos justos y los pepinos en vinagre.", skillType: "clear_steel", skillName: "Garrote", skillCost: 14, skillDescription: "Rompe 4 Aceros." },
    { id: "m024", name: "Payaso", emoji: "🤡", type: "Normal", maxHp: 8500, currentHp: 8500, description: "Se ríe de sus propias gracias, lo cual es inquietante.", skillType: "nuke", skillName: "Bomba", skillCost: 20, skillDescription: "Impacto de 2000 daño." },
    { id: "m025", name: "Unicornio", emoji: "🦄", type: "Hielo", maxHp: 9000, currentHp: 9000, description: "Se pasa horas cepillándose la crin arcoíris frente al espejo.", skillType: "clear_rocks", skillName: "Cuerno Mágico", skillCost: 15, skillDescription: "Elimina 8 rocas." },
    { id: "m026", name: "T-Rex", emoji: "🦖", type: "Dragón", maxHp: 10000, currentHp: 10000, description: "El rey de los dinosaurios, aunque tiene problemas para rascarse la espalda.", skillType: "damage_single", skillName: "Mordisco Feroz", skillCost: 15, skillDescription: "Impacto de 1500 daño." },
    { id: "m027", name: "Cthulhu", emoji: "🦑", type: "Agua", maxHp: 12000, currentHp: 12000, description: "Duerme en las profundidades soñando con el caos cósmico.", skillType: "damage_aoe", skillName: "Locura", skillCost: 20, skillDescription: "Impacto de 1500 daño." },
    { id: "m028", name: "Muerte", emoji: "💀", type: "Fantasma", maxHp: 14000, currentHp: 14000, description: "Se toma descansos para jugar a las cartas y comer snacks.", skillType: "nuke", skillName: "Guadaña", skillCost: 25, skillDescription: "Impacto de 3000 daño." },
    { id: "m029", name: "Sol", emoji: "🌞", type: "Fuego", maxHp: 16000, currentHp: 16000, description: "Exige que todo gire literalmente a su alrededor.", skillType: "damage_aoe", skillName: "Supernova", skillCost: 30, skillDescription: "Impacto de 2500 daño." },
    { id: "m030", name: "Rey Slime", emoji: "👑", type: "Normal", maxHp: 20000, currentHp: 20000, description: "Es pegajoso, sabio y un poco molesto.", skillType: "nuke", skillName: "Aplastar", skillCost: 40, skillDescription: "Impacto de 5000 daño." },
];

export const SECRET_BOSS: Boss = {
    id: "m999", 
    name: "Dios Emoji", 
    emoji: "😎", 
    type: "Normal", 
    maxHp: 50000, 
    currentHp: 50000, 
    description: "La entidad suprema del mundo digital.", 
    skillType: "nuke", 
    skillName: "Banhammer", 
    skillCost: 40, 
    skillDescription: "Impacto de 9999 daño."
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
        default: return BG_DEFAULT;
    }
};