import { Boss, ElementType } from "./types";

export const INITIAL_MOVES = 5;
export const MOVES_PER_LEVEL = 5;
export const ANIMATION_DELAY = 300;

export const TYPE_CHART: Record<ElementType, ElementType[]> = {
    'Fuego': ['Planta', 'Hielo', 'Acero', 'Bicho'],
    'Agua': ['Fuego', 'Tierra', 'Roca'],
    'Planta': ['Agua', 'Tierra', 'Roca'],
    'Eléctrico': ['Agua', 'Volador'],
    'Tierra': ['Fuego', 'Eléctrico', 'Roca', 'Acero', 'Veneno'],
    'Roca': ['Fuego', 'Hielo', 'Volador', 'Bicho'],
    'Hielo': ['Planta', 'Tierra', 'Volador', 'Dragón'],
    'Acero': ['Hielo', 'Roca', 'Hada'],
    'Fantasma': ['Fantasma', 'Psíquico'],
    'Dragón': ['Dragón'],
    'Normal': [],
    'Bicho': ['Planta', 'Psíquico', 'Siniestro'],
    'Volador': ['Planta', 'Bicho', 'Lucha'],
    'Psíquico': ['Lucha', 'Veneno'],
    'Hada': ['Dragón', 'Lucha', 'Siniestro'],
    'Lucha': ['Normal', 'Hielo', 'Roca', 'Acero', 'Siniestro'],
    'Siniestro': ['Fantasma', 'Psíquico'],
    'Veneno': ['Planta', 'Hada']
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
    'Siniestro': '⚫',
    'Veneno': '☠️'
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
    'Siniestro': '🌙',
    'Veneno': '🧪'
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
    'Siniestro': 'bg-slate-800/60 border-slate-700/50',
    'Veneno': 'bg-fuchsia-800/40 border-fuchsia-700/50'
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
    'Psíquico': 'bg-rose-400', // Changed to orange-pink/pastel
    'Hada': 'bg-pink-500',     // Changed to standard pink
    'Lucha': 'bg-orange-700',
    'Siniestro': 'bg-gray-900',
    'Veneno': 'bg-fuchsia-900'
};

// Interference Mapping
export const INTERFERENCE_RULES: Record<ElementType, 'rock' | 'steel' | 'ice' | 'random'> = {
    'Fuego': 'rock', 'Tierra': 'rock',
    'Roca': 'steel', 'Acero': 'steel',
    'Hielo': 'ice', 'Psíquico': 'ice', 'Agua': 'ice',
    'Planta': 'rock', 'Eléctrico': 'steel', 'Bicho': 'rock',
    'Fantasma': 'ice', 'Volador': 'rock', 'Hada': 'ice',
    'Normal': 'random', 'Dragón': 'random',
    'Lucha': 'rock', 'Siniestro': 'ice',
    'Veneno': 'random'
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
const BG_POISON = "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-fuchsia-900 via-purple-950 to-black";


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
        description: "Su pelaje emite algunas llamas cuando se emociona, que es casi todo el tiempo. No para de dar la brasa en todo el día, a veces, literalmente.", 
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
        description: "Es tan torpe caminando en tierra, como nadando en agua. Volar tampoco se le da bien. Gracias a los porrazos que se da, ha conseguido una alta resistencia a los golpes.", 
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
        description: "Cuando se oculta entre el follaje es prácticamente invisible. Puede pasar horas ahí sin hacer nada, solo tomando sol: su fuente de alimento. No lo necesita, pero a veces se alimenta a base de plantas, lo cual es algo inquietante.", 
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
        description: "Duerme en sitios altos o aislantes, ya que estar en tierra le va consumiendo la electricidad, y con ello la vida. Muchos establecimientos venden a estos seres como mascota junto a un adaptador para cargar el móvil.", 
        skillType: "clear_ice", 
        skillName: "Cortocircuito", 
        skillCost: 14, 
        skillDescription: "Derrite 6 Hielos." 
    },
    
    // LEVEL 1-10
    // Tierra -> Rompe Acero
    { id: "m005", name: "Rocaradillo", emoji: "🦔", type: "Tierra", maxHp: 1200, currentHp: 1200, description: "Va rodando a todas partes, ya que con sus pequeñas patas tardaría mucho tiempo más en recorrer el mismo camino. Sin embargo, el tiempo que ahorra rodando, lo pierde cuando se le enganchan las púas en los árboles al chocar contra ellos.", skillType: "clear_steel", skillName: "Terremoto", skillCost: 12, skillDescription: "Rompe 3 Aceros." },
    // Fantasma -> Combo/Nuke
    { id: "m006", name: "Whofst", emoji: "🐺", type: "Fantasma", maxHp: 1100, currentHp: 1100, description: "Su cuerpo es etéreo. Solo se materializa los días de luna llena, los cuales aprovecha para marcar territorio y excavar agujeros donde guarda sus cosas, aunque luego nunca recuerda dónde las enterró.", skillType: "nuke", skillName: "Aullido", skillCost: 18, skillDescription: "Daño fijo de 2000." },
    // Nevaska (Hielo)
    { id: "m007", name: "Nevaska", emoji: "🐻‍❄️", type: "Hielo", maxHp: 1300, currentHp: 1300, description: "Solo hace vida normal en invierno, ya que odia el calor; el resto del tiempo estará durmiendo. Con la grasa que acumula al alimentarse, puede vivir sin comer mucho tiempo. Hay personas que han escuchado su potente rugido al haberse despertado por error en pleno verano.", skillType: "clear_rocks", skillName: "Rompehielos", skillCost: 12, skillDescription: "Rompe 5 Rocas." },
    // Moy (Roca)
    { id: "m008", name: "Moy", emoji: "🗿", type: "Roca", maxHp: 2000, currentHp: 2000, description: "Se dice que son inmortales. Les gusta mucho viajar, y aunque su velocidad máxima es de apenas 1 metro al año, tienen mucha paciencia.", skillType: "clear_steel", skillName: "Cabezazo", skillCost: 15, skillDescription: "Rompe 4 Aceros." },
    // Pillo (Volador)
    { id: "m009", name: "Pillo", emoji: "🐦", type: "Volador", maxHp: 1500, currentHp: 1500, description: "Parece inofensivo, pero su canto es tan agudo, que aturde a sus enemigos al instante. Cuentan que, una vez cada mil años, uno de ellos se convierte en Fénix. Es incapaz de volar.", skillType: "clear_ice", skillName: "Aleteo", skillCost: 12, skillDescription: "Derrite 5 Hielos." },
    // Lagarco (Dragón)
    { id: "m010", name: "Lagarco", emoji: "🐉", type: "Dragón", maxHp: 3000, currentHp: 3000, description: "JEFE: Se las da de dragón, pero apenas mide como un lagarto común. Se alimenta principalmente de Cukiwaiis y Bichetos.", skillType: "clear_random", skillName: "Caos Dracónico", skillCost: 15, skillDescription: "Elimina 5 casillas al azar." },
    
    // LEVEL 11-20
    // Robocok (Acero)
    { id: "m011", name: "Robocok", emoji: "🤖", type: "Acero", maxHp: 3500, currentHp: 3500, description: "Robot de cocina con inteligencia artificial que fue adquiriendo conciencia propia. Primero comenzó a revelarse contra los humanos echando sal de más a sus platos. Ahora es una máquina con doble personalidad, puede hacerte un plato exquisito, o intentar matarte con sus útiles de cocina.", skillType: "clear_steel", skillName: "Taladro", skillCost: 18, skillDescription: "Rompe 5 Aceros." },
    // Kankik (Lucha)
    { id: "m012", name: "Kankik", emoji: "🦘", type: "Lucha", maxHp: 3800, currentHp: 3800, description: "Siempre están de mal humor y con ganas de pegarle a algo. Dejan a su cría en un lugar solitario como cebo y se esconden, solo para buscar pelea con quien venga a molestarla.", skillType: "clear_rocks", skillName: "Puño Dinámico", skillCost: 15, skillDescription: "Rompe 6 Rocas." },
    // RENAMED: Muchopincho -> Muchopinccho (Planta)
    { id: "m013", name: "Muchopinccho", emoji: "🌵", type: "Planta", maxHp: 3200, currentHp: 3200, description: "Cuentan que este Monstemoji puede vivir más de un año sin agua. También se dice que reza al Dios Sol, y que de ahí sale su enorme resistencia al calor, aunque, si le alcanzan llamas, se abrasará como cualquier otro ser vivo.", skillType: "convert_type", skillName: "Espinas Amigas", skillCost: 18, skillDescription: "Convierte 6 fichas en Muchopinccho." },
    // Trizeta (Psíquico)
    { id: "m014", name: "Trizeta", emoji: "🦥", type: "Psíquico", maxHp: 4000, currentHp: 4000, description: "Está siempre en su mundo, ensimismado. Se centra tanto en sus propios pensamientos que lo hace todo lentísimo y de manera mecánica. Si te quedas mirándolo mucho tiempo, tienes el riesgo de dormirte.", skillType: "convert_type", skillName: "Premonición", skillCost: 15, skillDescription: "Convierte 5 fichas en Trizeta." },
    // Korovi (Volador)
    { id: "m015", name: "Korovi", emoji: "🐦‍⬛", type: "Volador", maxHp: 3600, currentHp: 3600, description: "Son muy inteligentes. Reúnen todo tipo de objetos brillantes para luego comerciar con humanos.", skillType: "clear_random", skillName: "Viento Negro", skillCost: 14, skillDescription: "Elimina 6 casillas al azar." },
    // Mapatraka (Siniestro)
    { id: "m016", name: "Mapatraka", emoji: "🦝", type: "Siniestro", maxHp: 4200, currentHp: 4200, description: "Van en manada robando todo lo que pueden por la fuerza. Se les ha visto en muchas ocasiones enfrentarse a Korovis por algún objeto.", skillType: "clear_random", skillName: "Robo", skillCost: 20, skillDescription: "Elimina 7 casillas al azar." },
    // Acero -> Rompe Acero
    { id: "m017", name: "Alien", emoji: "👽", type: "Acero", maxHp: 4500, currentHp: 4500, description: "Preocupó al mundo entero con su aparición, pero es bastante simpático. Vino a la Tierra solo de vacaciones, pero al final quedó enganchado a las redes sociales y ver vídeos de gatitos.", skillType: "clear_steel", skillName: "Rayo Tractor", skillCost: 15, skillDescription: "Rompe 4 Aceros." },
    // Deslifoc (Agua)
    { id: "m018", name: "Deslifoc", emoji: "🦭", type: "Agua", maxHp: 5000, currentHp: 5000, description: "Gracias al grosor de su piel, no siente daño alguno a los ataques superficiales. Debe estar alerta en todo momento, incluso cuando duerme, ya que a veces se despierta con un Nevaska intentando devorarlo.", skillType: "clear_rocks", skillName: "Barrigazo", skillCost: 12, skillDescription: "Rompe 5 Rocas." },
    // Frozhop (Hielo)
    { id: "m019", name: "Frozhop", emoji: "🐇", type: "Hielo", maxHp: 5500, currentHp: 5500, description: "Se mueven con saltos y van congelando todo lo que pisan, por lo que es algo normal verlos caminando sobre el agua mientras la congelan a su paso. A veces, por ese motivo, se les complica beber agua. Si ves alguno de color rojo, es porque ese día eligió beber sangre.", skillType: "clear_rocks", skillName: "Salto Helado", skillCost: 15, skillDescription: "Rompe 6 Rocas." },
    // Gato (Siniestro)
    { id: "m020", name: "Gato", emoji: "😺", type: "Siniestro", maxHp: 6000, currentHp: 6000, description: "JEFE: Gato común. Puede estar tranquilo, y de repente correr y subirse por las paredes. Disfruta dejando caer cosas de sitios altos para romperlas. Dicen que pueden ver fantasmas y que tienen personalidad múltiple. Muy siniestro.", skillType: "clear_self", skillName: "7 Vidas", skillCost: 15, skillDescription: "Elimina todos los Gatos." },

    // HARD MODE
    // Fantasma -> Convert
    { id: "m021", name: "Vampiro", emoji: "🧛", type: "Fantasma", maxHp: 7000, currentHp: 7000, description: "Logró integrarse en la sociedad. Trabaja como enfermero y siempre elige turno de noche. A veces bebe a escondidas bolsas de transfusión de sangre. Aún no le han pillado.", skillType: "convert_type", skillName: "Hipnosis", skillCost: 20, skillDescription: "Convierte 7 fichas en Vampiros." },
    // Eléctrico -> Descongela
    { id: "m022", name: "Genio", emoji: "🧞", type: "Eléctrico", maxHp: 7500, currentHp: 7500, description: "Ser legendario que concede deseos. Miente diciendo que solo puede conceder uno, cuando en realidad son tres. Se divierte malinterpretando aposta los deseos de la gente.", skillType: "clear_ice", skillName: "Deseo Ardiente", skillCost: 18, skillDescription: "Derrite 7 Hielos." },
    // Peñasco (Roca)
    { id: "m023", name: "Peñasco", emoji: "🐗", type: "Roca", maxHp: 8000, currentHp: 8000, description: "Es capaz de partir piedras, e incluso acero con la cabeza. Algunos viven cerca de zonas heladas, también parten hielo con la cabeza. Se saludan entre ellos y luchan a cabezazos. Al final de su vida, su cabeza se vuelve tan dura como el diamante.", skillType: "clear_steel", skillName: "Embestida", skillCost: 18, skillDescription: "Rompe 5 Aceros." },
    // Normal -> Random Clear
    { id: "m024", name: "Payaso", emoji: "🤡", type: "Normal", maxHp: 8500, currentHp: 8500, description: "Hace globos con forma de su víctima para atacar y luego los hace estallar con una extraña técnica de budú. Hay gente que le ha visto riéndose de sus propios chistes, lo cual es algo perturbador.", skillType: "clear_random", skillName: "Broma Pesada", skillCost: 16, skillDescription: "Elimina 6 casillas al azar." },
    // Cucujaca (Hada)
    { id: "m025", name: "Cucujaca", emoji: "🦄", type: "Hada", maxHp: 9000, currentHp: 9000, description: "Se desconoce su origen, aunque cuentan que ha sido creado por humanos. Dicen que su cuerno es realmente un helado boca abajo. Huele a chicle de fresa.", skillType: "clear_rocks", skillName: "Polvo de Hada", skillCost: 18, skillDescription: "Elimina 7 Rocas." },
    // Rex-Til (Dragón)
    { id: "m026", name: "Rex-Til", emoji: "🦖", type: "Dragón", maxHp: 10000, currentHp: 10000, description: "Dinosaurio que se caracteriza por su gran tamaño, sus fuertes patas inferiores, y sus inútiles patas superiores. Se alimenta de todo lo que ve, por lo que es complicado tener uno como mascota.", skillType: "clear_self", skillName: "Rugido", skillCost: 15, skillDescription: "Elimina 7 Rex-Tils." },
    // RENAMED: Tembleon -> Tembleón (Tierra)
    { id: "m027", name: "Tembleón", emoji: "🦁", type: "Tierra", maxHp: 12000, currentHp: 12000, description: "Es considerado el rey de la montaña. Los demás Monstemojis tiemblan al verle, ya que es capaz de generar terremotos con su potente rugido, aunque, a veces, con tantas modificaciones del terreno, no sabe volver con su manada.", skillType: "clear_rocks", skillName: "Terremoto", skillCost: 20, skillDescription: "Rompe 8 Rocas." },
    // Bicheto (Bicho)
    { id: "m028", name: "Bicheto", emoji: "🐛", type: "Bicho", maxHp: 14000, currentHp: 14000, description: "Es pequeño, pero tan duro, que sus depredadores lo escupen tras estar varios minutos intentando comérselo sin apenas hacerle un rasguño. Esto ocurre a menudo, lo cual hace que acabe lleno de babas a diario.", skillType: "nuke", skillName: "Picadura Letal", skillCost: 25, skillDescription: "Daño fijo de 3500." },
    // Fénix (Fuego)
    { id: "m029", name: "Fénix", emoji: "🐦‍🔥", type: "Fuego", maxHp: 16000, currentHp: 16000, description: "Ave legendaria que odia a casi toda forma viviente, por eso se fue a vivir al monte. Si se encuentra con alguien, se prende fuego y se hace el muerto.", skillType: "clear_ice", skillName: "Renacer", skillCost: 25, skillDescription: "Derrite 8 Hielos." },
    // Digital Pretzel (Normal)
    { id: "m030", name: "Digital Pretzel", emoji: "🥨", type: "Normal", maxHp: 20000, currentHp: 20000, description: "JEFE: Es pan horneado en forma de lazo con sal. Y digital.", skillType: "convert_type", skillName: "Glaseado", skillCost: 25, skillDescription: "Convierte 8 fichas en Digital Pretzel." },

    // NEW MONSTERS
    // Chupiblad (Bicho)
    { id: "m031", name: "Chupiblad", emoji: "🦟", type: "Bicho", maxHp: 9500, currentHp: 9500, description: "Siempre ataca en grupo para garantizar el alimento, unos distraen, mientras otros comen absorbiendo la sangre de su objetivo. Su mayor debilidad es la luz ultravioleta.", skillType: "clear_self", skillName: "Drenaje", skillCost: 15, skillDescription: "Elimina 7 Chupiblads." },
    // Zespira (Psíquico)
    { id: "m032", name: "Zespira", emoji: "🦓", type: "Psíquico", maxHp: 10500, currentHp: 10500, description: "Pueden mover a su antojo el patrón de rayas de su cuerpo, las usan para hipnotizar a sus enemigos. Deben tener cuidado, ya que no es la primera vez que han quedado inconscientes por verse reflejadas en una superficie.", skillType: "convert_type", skillName: "Ilusión Óptica", skillCost: 18, skillDescription: "Convierte 6 fichas en Zespira." },
    // Piñas (Lucha)
    { id: "m033", name: "Piñas", emoji: "🪅", type: "Lucha", maxHp: 11500, currentHp: 11500, description: "Una piñata que cobró vida después de ser apaleada. Ahora busca devolver los golpes que recibió.", skillType: "clear_random", skillName: "Estallido Dulce", skillCost: 20, skillDescription: "Elimina 8 casillas al azar." },
    // Cukiwaii (Veneno)
    { id: "m034", name: "Cukiwaii", emoji: "🪳", type: "Veneno", maxHp: 13000, currentHp: 13000, description: "Son muy venenosas, las hay incluso radiactivas. Si te rozan, la zona que hizo contacto con ellas se te entumecerá al instante. ¡Algunas, incluso pueden volar!", skillType: "nuke", skillName: "Radiación", skillCost: 22, skillDescription: "Daño fijo de 3000." },
    // Deletéreo (Veneno)
    { id: "m035", name: "Deletéreo", emoji: "🫠", type: "Veneno", maxHp: 15000, currentHp: 15000, description: "Ser de un material corrosivo que controla su densidad a su antojo. Siente un impulso irrefrenable de abrazar y fusionarse con todo.", skillType: "clear_steel", skillName: "Corrosión", skillCost: 18, skillDescription: "Rompe 6 Aceros." },
    // Royally (Hada)
    { id: "m036", name: "Royally", emoji: "🦚", type: "Hada", maxHp: 12000, currentHp: 12000, description: "Cuenta una leyenda que cada una de sus plumas sirve para curar una enfermedad diferente. Son orgullosos y presumidos, hasta tal punto, que ni entre ellos se soportan, dando lugar a que estén casi extintos.", skillType: "convert_type", skillName: "Despliegue", skillCost: 18, skillDescription: "Convierte 6 fichas en Royally." },
];

export const SECRET_BOSS: Boss = {
    id: "m999", 
    name: "Humano", 
    emoji: "👤", 
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
        case 'Veneno': return BG_POISON;
        default: return BG_DEFAULT;
    }
};