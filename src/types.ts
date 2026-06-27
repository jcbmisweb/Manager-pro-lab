/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SemanalLog {
  ph: number; // Keep for legacy / graphing
  completado: boolean;
  notes?: string; // Support both notes and notas safely
  notas: string;
  fechaRegistro?: string;
  fotos?: string[]; // Array of compressed Base64 images
  parametros?: Record<string, string | number>; // Dynamically track values from Challenge config
}

export interface IESConfig {
  nombre: string;
  logo: string; // Base64 or URL
}

export interface Aula {
  id: string;
  nombre: string;
  profesorId: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: 'admin' | 'profesor' | 'alumno';
  estado: 'activo' | 'bloqueado' | 'suspendido' | 'eliminado';
  aulaId?: string; // For alumnos: which classroom they belong to; for profesores: empty, assignments are done at Aula-level
}

export interface Mensaje {
  id: string;
  emisorId: string;
  receptorId: string;
  proyectoId?: string;
  mensaje: string;
  fecha: string;
  leido: boolean;
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  loggedIn: boolean;
  role?: 'admin' | 'profesor' | 'alumno';
  estado?: 'activo' | 'bloqueado' | 'suspendido' | 'eliminado';
  aulaId?: string;
}

export interface SensorialEvaluation {
  firmeza: number;       // 0 to 5
  uniformidad: number;   // 0 to 5
  acidez: number;        // 0 to 5
  persistencia: number;  // 0 to 5
}

export interface RetoState {
  pesoInicial: number;
  tipoInoculante: string;
  started: boolean;
  fechaInicio: string | null;
  semanas: Record<number, SemanalLog>;
  sensorial: SensorialEvaluation;
  pesoFinal: number | null;
}



export interface KitchenIngredient {
  id: string;
  nombre: string;
  cantidad: string;
  notas?: string;
}

export interface KitchenStep {
  id: string;
  orden: number;
  descripcion: string;
}

export interface KitchenRecipeSheet {
  titulo: string;
  ingredientes: KitchenIngredient[];
  pasos: KitchenStep[];
  mantenimiento?: string;
}

export interface LogbookWeekConfig {
  id: string;
  fase: string;
  semanas: string;
  accionAlumno: string;
  puntoCriticoControl: string;
  requiereFoto: boolean;
  parametrosRegistrar: string[];
}

export interface Challenge {
  id: string;
  code: string;
  name: string;
  emoji: string;
  gradient: string;
  description: string;
  scientificObjective: string;
  sustainableObjective: string;
  investigationVariable: string;
  initialWeightDefault: number;
  inoculantOptions: string[];
  materiaPrimaLabel: string;
  precioMateriaPrimaKilo: number;
  precioComercialKilo: number;
  semanaMax: number;
  phInicialDefault: number;
  phFinalEsperado: number;
  bloque: 'A' | 'B' | 'C';
  isPublished?: boolean;
  insumosBase?: KitchenRecipeSheet[];
  elaboracionPrincipal?: KitchenRecipeSheet;
  cronograma?: LogbookWeekConfig[];
}

export const MODULO_INFO = {
  nombre: "Innovaciones en cocina sostenible",
  curso: "2026/2027",
  nivel: "2º Curso de Cocina y Gastronomía",
  profesor: "Juan Codina Barranco",
  fechas: "1 de septiembre - 31 de agosto"
};

export const CHALLENGES: Challenge[] = [
  {
    id: 'reto-01a',
    code: 'Reto 01',
    name: 'Queso de Anacardos Fermentado con Kéfir de Agua',
    emoji: '🧀',
    gradient: 'from-amber-500 to-orange-600',
    description: 'Alternativa láctea de alta gama utilizando anacardos y un SCOBY casero (kéfir de agua).',
    scientificObjective: 'Lograr una coagulación estable a un pH crítico de 4.4.', // keeping for legacy
    sustainableObjective: 'Crear una alternativa láctea de alta gama utilizando anacardos y un SCOBY casero (kéfir de agua), eliminando la dependencia de cultivos industriales y reduciendo el desperdicio mediante el aprovechamiento de los nódulos excedentes.',
    investigationVariable: 'Comparar la velocidad de acidificación y la estabilidad de la textura del queso utilizando kéfir de agua de 48h frente a un queso elaborado con probióticos comerciales.',
    initialWeightDefault: 400,
    inoculantOptions: ['Kéfir de agua 48h', 'Probióticos comerciales'],
    materiaPrimaLabel: 'Anacardos crudos',
    precioMateriaPrimaKilo: 12.5,
    precioComercialKilo: 28.5,
    semanaMax: 8,
    phInicialDefault: 6.0,
    phFinalEsperado: 4.4,
    bloque: 'A',
    isPublished: false,
    insumosBase: [
      {
        titulo: 'Kéfir de Agua (El Iniciador)',
        ingredientes: [
          { id: 'ing1', nombre: 'Agua filtrada (sin cloro)', cantidad: '1L' },
          { id: 'ing2', nombre: 'Azúcar moreno', cantidad: '60g' },
          { id: 'ing3', nombre: 'Cristales de kéfir', cantidad: '30g' },
          { id: 'ing4', nombre: 'Higos deshidratados', cantidad: '2' },
          { id: 'ing5', nombre: 'Limón', cantidad: 'rodajas', notas: 'Al gusto' }
        ],
        pasos: [
          { id: 'p1', orden: 1, descripcion: 'Diluir el azúcar en un poco de agua caliente y luego añadir el agua fría.' },
          { id: 'p2', orden: 2, descripcion: 'Agregar los cristales de kéfir, los higos y el limón.' },
          { id: 'p3', orden: 3, descripcion: 'Fermentación: Dejar a temperatura ambiente (20-25 °C) durante 48-72 horas en un frasco cubierto con un paño.' },
          { id: 'p4', orden: 4, descripcion: 'Cosecha: Colar con utensilios de plástico o madera (evitar metal) y reservar el líquido para inocular el queso.' }
        ],
        mantenimiento: 'Guardar los granos en agua con un 10% de azúcar en la nevera (máximo 3 semanas).'
      }
    ],
    elaboracionPrincipal: {
      titulo: 'El Queso',
      ingredientes: [
        { id: 'ep1', nombre: 'Anacardos (remojados 8-12h)', cantidad: '400g' },
        { id: 'ep2', nombre: 'Agua filtrada', cantidad: '100ml' },
        { id: 'ep3', nombre: 'Kéfir de Agua activo', cantidad: '30ml (2 cucharadas)' }
      ],
      pasos: [
        { id: 'ep_p1', orden: 1, descripcion: 'Triturar los anacardos con el agua hasta obtener una crema suave (no superar los 42 °C para proteger las bacterias lácticas).' },
        { id: 'ep_p2', orden: 2, descripcion: 'Añadir el kéfir de agua y mezclar brevemente.' },
        { id: 'ep_p3', orden: 3, descripcion: 'Fermentación Primaria: Reposar en un frasco limpio entre 12 y 24 horas a 25-30 °C hasta que el pH sea inferior a 4.5.' },
        { id: 'ep_p4', orden: 4, descripcion: 'Maduración: Salar (2% del peso) y porcionar. Se puede deshidratar a 41 °C durante 20 horas para obtener firmeza.' }
      ]
    },
    cronograma: [
      { id: 'cro1', fase: 'Arranque', semanas: '1', accionAlumno: 'Activar cristales de kéfir e inocular la base de anacardos.', puntoCriticoControl: 'pH < 4.5 (Semáforo Verde)', requiereFoto: true, parametrosRegistrar: ['pH', 'Aspecto'] },
      { id: 'cro2', fase: 'Moldeo', semanas: '2', accionAlumno: 'Porcionar el queso (aprox. 80g) y realizar el secado inicial.', puntoCriticoControl: 'Olor láctico y ausencia de moho.', requiereFoto: true, parametrosRegistrar: ['Olor', 'Aspecto'] },
      { id: 'cro3', fase: 'Maduración', semanas: '3-6', accionAlumno: 'Madurar en frío sobre esterilla, volteando cada 2 días.', puntoCriticoControl: 'Semáforo Amarillo: Vigilar levadura Kahm.', requiereFoto: true, parametrosRegistrar: ['pH', 'Olor', 'Aspecto', 'Temperatura'] },
      { id: 'cro4', fase: 'Afinado', semanas: '7', accionAlumno: 'Evaluación de la textura (firmeza) y persistencia del sabor.', puntoCriticoControl: 'Registro de mermas por evaporación.', requiereFoto: true, parametrosRegistrar: ['Mermas (g)', 'Firmeza'] },
      { id: 'cro5', fase: 'Evidencia', semanas: '8', accionAlumno: 'Presentación PPP y cata comparativa en el aula.', puntoCriticoControl: 'Conclusión Gastronómica: Uso en plato real.', requiereFoto: true, parametrosRegistrar: ['Análisis Sensorial'] }
    ]
  },
  {
    id: 'reto-02',
    code: 'RETO 02',
    name: 'Upcycling de Lactosuero mediante Micelio',
    emoji: '🍄',
    gradient: 'from-emerald-500 to-teal-700',
    description: 'Biorremediación de suero lácteo residual empleando hongos filamentosos para producir biomasa micelial de alto valor nutricional.',
    scientificObjective: 'Consumo acelerado de lactosa y reducción de la Demanda Química de Oxígeno (DQO) en el suero residual superior al 85%.',
    sustainableObjective: 'Transformación de un desecho agroindustrial altamente contaminante de ríos en una micoproteína comestible libre de crueldad.',
    investigationVariable: 'Densidad del inóculo de esporas fúngicas frente al rendimiento de biomasa seca recolectada y retención de humedad.',
    initialWeightDefault: 300,
    inoculantOptions: ['Suspensión de esporas fúngicas al 5%', 'Inóculo micelial en grano de centeno'],
    materiaPrimaLabel: 'Lactosuero crudo desproteinizado',
    precioMateriaPrimaKilo: 2.0,
    precioComercialKilo: 25.0,
    semanaMax: 4,
    phInicialDefault: 6.2,
    phFinalEsperado: 4.8,
    bloque: 'B'
  },
  {
    id: 'reto-03',
    code: 'RETO 03',
    name: 'Bioplástico Compostable de Almidón y Mucílago',
    emoji: '🌾',
    gradient: 'from-indigo-500 to-violet-700',
    description: 'Reticulación molecular de almidón termoplástico mediante adición de hidrocoloides naturales extraídos de subproductos agrícolas.',
    scientificObjective: 'Aumentar la resistencia mecánica y disminuir la tasa de permeabilidad al vapor de agua mediante plastificación dirigida.',
    sustainableObjective: 'Desarrollo de películas biodegradables de descarte rápido (compost casero < 30 días) que reemplacen empaques plásticos fósiles.',
    investigationVariable: 'Porcentaje de mucílago de linaza plastificante vs. resistencia máxima a la tensión y tasa de biodegradación compostable.',
    initialWeightDefault: 100,
    inoculantOptions: ['Mucílago de linaza purificado', 'Mucílago crudo de linaza extraído en frío'],
    materiaPrimaLabel: 'Almidón de yuca / linaza base',
    precioMateriaPrimaKilo: 3.5,
    precioComercialKilo: 15.0,
    semanaMax: 6,
    phInicialDefault: 6.8,
    phFinalEsperado: 5.8,
    bloque: 'C'
  },
  {
    id: 'reto-04',
    code: 'RETO 04',
    name: 'Extractos Antioxidantes de Pulpa de Café',
    emoji: '☕',
    gradient: 'from-rose-500 to-red-700',
    description: 'Biotransformación fúngica o bacteriana en estado sólido para liberar polifenoles y compuestos bioactivos en residuos de beneficio húmedo.',
    scientificObjective: 'Incrementar la biodisponibilidad de ácidos clorogénico y cafeico mediante fermentación controlada.',
    sustainableObjective: 'Evitar la acumulación tóxica de lodos de pulpa de café que acidifican suelos y contaminan cuencas hidrográficas.',
    investigationVariable: 'Tiempo de fermentación sólida (horas) vs. concentración total de compuestos antioxidantes libres en extracto final.',
    initialWeightDefault: 150,
    inoculantOptions: ['Levadura liofilizada industrial', 'Cepa salvaje aislada de café pergamino'],
    materiaPrimaLabel: 'Pulpa de café fresca de descarte',
    precioMateriaPrimaKilo: 5.0,
    precioComercialKilo: 45.0,
    semanaMax: 4,
    phInicialDefault: 4.8,
    phFinalEsperado: 3.8,
    bloque: 'C'
  }
];


export const LOCAL_STORAGE_KEY = 'manager_pro_lab_active_project_id';

export const getInitialStateForChallenge = (challenge: Challenge): RetoState => {
  const semanas: Record<number, SemanalLog> = {};
  
  // Dynamically build the weeks based on the challenge max weeks!
  // Week pH should smoothly slide down from starting pH to expected final pH
  for (let i = 1; i <= challenge.semanaMax; i++) {
    const ratio = (i - 1) / (challenge.semanaMax - 1 || 1);
    const expectedPh = parseFloat((challenge.phInicialDefault - ratio * (challenge.phInicialDefault - challenge.phFinalEsperado)).toFixed(2));
    semanas[i] = {
      ph: expectedPh,
      completado: false,
      notas: ''
    };
  }

  return {
    pesoInicial: challenge.initialWeightDefault,
    tipoInoculante: challenge.inoculantOptions[0],
    started: false,
    fechaInicio: null,
    semanas,
    sensorial: {
      firmeza: 3,
      uniformidad: 3,
      acidez: 3,
      persistencia: 3
    },
    pesoFinal: null
  };
};

export const INITIAL_STATE: RetoState = getInitialStateForChallenge(CHALLENGES[0]);

export interface Project {
  id: string;
  challengeId: string;
  block: 'A' | 'B' | 'C';
  title: string;
  objectives: string[];
  technicalData: Record<string, string>;
  infographicUrl: string;
  status: 'en curso' | 'completado';
}

export interface NotebookEntry {
  id: string;
  projectId: string;
  date: string;
  notes: string;
  photoUrl?: string;
}

