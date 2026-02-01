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
    // STARTERS
    { 
        id: "m001", 
        name: "Simiobrasa", 
        emoji: "🐵", 
        type: "Fuego", 
        maxHp: 800, 
        currentHp: 800, 
        description: "Un mono con serios problemas de control de ira que intentó hacer una barbacoa y acabó incendiando medio bosque. Ahora busca redención asando malvaviscos.", 
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
        description: "Un pato de goma que cobró vida tras caer en un residuo radiactivo. Tiene miedo al agua profunda y exige llevar siempre manguitos.", 
        skillType: "damage_aoe", 
        skillName: "Ola", 
        skillCost: 10, 
        skillDescription: "Inflige 300 de daño." 
    },
    { 
        id: "m003", 
        name: "Hojaraptor", 
        emoji: "🦕", 
        type: "Planta", 
        maxHp: 900, 
        currentHp: 900, 
        description: "Un dinosaurio vegano extremo que solo come plantas de plástico porque dice que las reales tienen demasiados sentimientos.", 
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
        description: "Roedor adicto a masticar cables de alta tensión. Su factura de la luz es astronómica y brilla en la oscuridad cuando se enfada.", 
        skillType: "nuke", 
        skillName: "Rayo", 
        skillCost: 15, 
        skillDescription: "Impacto de 800 daño." 
    },
    
    // LEVEL 1-10
    { id: "m005", name: "Rocaradillo", emoji: "🦔", type: "Tierra", maxHp: 1200, currentHp: 1200, description: "Descubrió que rodar es más rápido que caminar y ahora se niega a usar sus patas. Sufre mareos constantes pero no lo admite.", skillType: "clear_steel", skillName: "Terremoto", skillCost: 12, skillDescription: "Rompe 3 Aceros." },
    { id: "m006", name: "Fantasmín", emoji: "👻", type: "Fantasma", maxHp: 1100, currentHp: 1100, description: "Un espectro con ansiedad social severa. Intenta asustar a la gente, pero si gritan se pone a llorar y pide perdón.", skillType: "damage_single", skillName: "Susto", skillCost: 6, skillDescription: "Golpe de 250 daño." },
    { id: "m007", name: "Copo", emoji: "❄️", type: "Hielo", maxHp: 1300, currentHp: 1300, description: "Obsesionado con la geometría fractal. Si le dices que un copo de nieve no es perfectamente simétrico, entra en crisis existencial.", skillType: "clear_ice", skillName: "Deshielo", skillCost: 9, skillDescription: "Elimina 5 hielos." },
    { id: "m008", name: "Gólem", emoji: "🗿", type: "Roca", maxHp: 2000, currentHp: 2000, description: "Una estatua de la Isla de Pascua que se cansó de mirar al horizonte y decidió salir a ver mundo, aunque se mueve a 1 km por año.", skillType: "damage_single", skillName: "Lanzarrocas", skillCost: 14, skillDescription: "Golpe de 600 daño." },
    { id: "m009", name: "Electrobird", emoji: "🦅", type: "Eléctrico", maxHp: 1500, currentHp: 1500, description: "Se cree el rey de los cielos, pero en realidad trabaja como repetidor Wi-Fi para una compañía telefónica de bajo coste.", skillType: "damage_aoe", skillName: "Trueno", skillCost: 12, skillDescription: "Descarga de 500 daño." },
    { id: "m010", name: "Draco", emoji: "🐉", type: "Dragón", maxHp: 3000, currentHp: 3000, description: "JEFE: Acumula oro compulsivamente, pero debido a la inflación, ahora solo guarda bitcoins en un disco duro que perdió hace años.", skillType: "nuke", skillName: "Cometa Draco", skillCost: 18, skillDescription: "Impacto de 1500 daño." },
    
    // LEVEL 11-20
    { id: "m011", name: "AceroBot", emoji: "🤖", type: "Acero", maxHp: 3500, currentHp: 3500, description: "Un robot de limpieza que cobró conciencia y decidió que la humanidad es la mancha más difícil de quitar.", skillType: "clear_rocks", skillName: "Taladro", skillCost: 10, skillDescription: "Destruye 6 Rocas." },
    { id: "m012", name: "Magmablob", emoji: "🌋", type: "Fuego", maxHp: 3800, currentHp: 3800, description: "Una montaña con acidez estomacal crónica. Escupe lava cuando se ríe, lo cual hace que sus fiestas sean bastante peligrosas.", skillType: "damage_aoe", skillName: "Erupción", skillCost: 15, skillDescription: "Gran daño en área." },
    { id: "m013", name: "Cactus", emoji: "🌵", type: "Planta", maxHp: 3200, currentHp: 3200, description: "Quiere abrazar a todo el mundo para demostrar su afecto, pero nadie le devuelve el abrazo por razones punzantes y obvias.", skillType: "damage_single", skillName: "Pincho Cañón", skillCost: 8, skillDescription: "Golpe de 400 daño." },
    { id: "m014", name: "Tibucyber", emoji: "🦈", type: "Agua", maxHp: 4000, currentHp: 4000, description: "Un tiburón que aprendió a programar en Python. Hackea barcos pesqueros y transfiere sus fondos a ONGs de conservación marina.", skillType: "damage_single", skillName: "Hidrobomba", skillCost: 12, skillDescription: "Golpe de 800 daño." },
    { id: "m015", name: "Ojo Sombra", emoji: "👁️", type: "Fantasma", maxHp: 3600, currentHp: 3600, description: "Te está mirando. Sí, a ti. Y juzga tus decisiones de vida, especialmente esa camisa que llevas puesta hoy.", skillType: "convert_type", skillName: "Hipnosis", skillCost: 12, skillDescription: "Transforma fichas." },
    { id: "m016", name: "Zombi", emoji: "🧟", type: "Fantasma", maxHp: 4200, currentHp: 4200, description: "Se hizo vegano después de morir. Ahora vaga por el mundo buscando cerebros de coliflor y tofu fermentado.", skillType: "damage_single", skillName: "Mordisco", skillCost: 8, skillDescription: "Golpe de 500 daño." },
    { id: "m017", name: "Alien", emoji: "👽", type: "Acero", maxHp: 4500, currentHp: 4500, description: "Vino a invadir la Tierra pero descubrió TikTok y ahora se pasa el día haciendo bailes virales en su platillo volante.", skillType: "nuke", skillName: "Láser", skillCost: 16, skillDescription: "Impacto de 1200 daño." },
    { id: "m018", name: "Kraken", emoji: "🐙", type: "Agua", maxHp: 5000, currentHp: 5000, description: "Un cefalópodo incomprendido que solo quiere chocar los cinco, pero accidentalmente hunde destructores navales con su entusiasmo.", skillType: "damage_aoe", skillName: "Tinta", skillCost: 14, skillDescription: "Golpe de 600 daño." },
    { id: "m019", name: "Yeti", emoji: "🦍", type: "Hielo", maxHp: 5500, currentHp: 5500, description: "El campeón indiscutible de las escondidas. Lleva 50 años ganando y ya se está aburriendo de que nadie lo encuentre.", skillType: "clear_ice", skillName: "Puño Hielo", skillCost: 10, skillDescription: "Rompe 6 hielos." },
    { id: "m020", name: "Fénix", emoji: "🦅", type: "Fuego", maxHp: 6000, currentHp: 6000, description: "JEFE: Dramático por naturaleza. Cada vez que tiene un mal día se convierte en cenizas solo para llamar la atención y resurgir.", skillType: "damage_aoe", skillName: "Llamarada", skillCost: 18, skillDescription: "Impacto de 1000 daño." },

    // HARD MODE
    { id: "m021", name: "Vampiro", emoji: "🧛", type: "Fantasma", maxHp: 7000, currentHp: 7000, description: "Odia trabajar de noche y tiene déficit de vitamina D. Se pasa el día quejándose del precio de los ataúdes ergonómicos.", skillType: "damage_single", skillName: "Drenaje", skillCost: 12, skillDescription: "Golpe de 800 daño." },
    { id: "m022", name: "Genio", emoji: "🧞", type: "Eléctrico", maxHp: 7500, currentHp: 7500, description: "Un bromista cósmico. Si le pides un deseo, se asegurará de interpretarlo de la forma más literal y molesta posible.", skillType: "convert_type", skillName: "Magia", skillCost: 15, skillDescription: "Caos en el tablero." },
    { id: "m023", name: "Oni", emoji: "👹", type: "Roca", maxHp: 8000, currentHp: 8000, description: "Un demonio japonés que dejó el mal para dedicarse a la crítica gastronómica. Es muy exigente con el punto de sal.", skillType: "clear_steel", skillName: "Garrote", skillCost: 14, skillDescription: "Rompe 4 Aceros." },
    { id: "m024", name: "Payaso", emoji: "🤡", type: "Normal", maxHp: 8500, currentHp: 8500, description: "Se ríe solo en rincones oscuros. Nadie sabe si está contando chistes o planeando la dominación mundial.", skillType: "nuke", skillName: "Bomba", skillCost: 20, skillDescription: "Impacto de 2000 daño." },
    { id: "m025", name: "Unicornio", emoji: "🦄", type: "Hielo", maxHp: 9000, currentHp: 9000, description: "Tan vanidoso que se detiene en mitad de la batalla para arreglarse el flequillo. Su cuerno es en realidad un cucurucho de helado.", skillType: "clear_rocks", skillName: "Cuerno Mágico", skillCost: 15, skillDescription: "Elimina 8 rocas." },
    { id: "m026", name: "T-Rex", emoji: "🦖", type: "Dragón", maxHp: 10000, currentHp: 10000, description: "Está muy enfadado porque no puede abrocharse los zapatos ni aplaudir en los conciertos. Su rabia es comprensible.", skillType: "damage_single", skillName: "Mordisco Feroz", skillCost: 15, skillDescription: "Impacto de 1500 daño." },
    { id: "m027", name: "Cthulhu", emoji: "🦑", type: "Agua", maxHp: 12000, currentHp: 12000, description: "Una deidad primigenia que duerme bajo el mar, pero se despierta de mal humor si los barcos hacen mucho ruido al pasar.", skillType: "damage_aoe", skillName: "Locura", skillCost: 20, skillDescription: "Impacto de 1500 daño." },
    { id: "m028", name: "Muerte", emoji: "💀", type: "Fantasma", maxHp: 14000, currentHp: 14000, description: "Está considerando seriamente jubilarse y abrir una floristería. Dice que está cansada de tanta negatividad laboral.", skillType: "nuke", skillName: "Guadaña", skillCost: 25, skillDescription: "Impacto de 3000 daño." },
    { id: "m029", name: "Sol", emoji: "🌞", type: "Fuego", maxHp: 16000, currentHp: 16000, description: "Tiene un ego tan grande como su masa gravitatoria. Exige que todos los planetas giren a su alrededor literalmente.", skillType: "damage_aoe", skillName: "Supernova", skillCost: 30, skillDescription: "Impacto de 2500 daño." },
    { id: "m030", name: "Rey Slime", emoji: "👑", type: "Normal", maxHp: 20000, currentHp: 20000, description: "JEFE: Una masa gelatinosa con corona que se cree de la realeza. Es pegajoso, huele a chicle de fresa y exige impuestos.", skillType: "nuke", skillName: "Aplastar", skillCost: 40, skillDescription: "Impacto de 5000 daño." },
];

export const SECRET_BOSS: Boss = {
    id: "m999", 
    name: "Dios Emoji", 
    emoji: "😎", 
    type: "Normal", 
    maxHp: 40000, 
    currentHp: 40000, 
    description: "La entidad suprema del mundo digital. Ha visto tu historial de búsqueda y te está juzgando silenciosamente detrás de esas gafas de sol.", 
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