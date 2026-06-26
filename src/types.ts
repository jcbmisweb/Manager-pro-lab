/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SemanalLog {
  ph: number;
  completado: boolean;
  notes?: string; // Support both notes and notas safely
  notas: string;
  fechaRegistro?: string;
  fotos?: string[]; // Array of compressed Base64 images
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
    code: 'RETO 01-A',
    name: 'Queso de Soya Biológicamente Acidificado',
    emoji: '🧀',
    gradient: 'from-amber-500 to-orange-600',
    description: 'Sustitución de ácidos químicos por inoculación de bacterias ácido-lácticas en bebida de soya para coagulación biológica controlada.',
    scientificObjective: 'Lograr una coagulación estable a un pH crítico de 4.4 controlando la sinéresis sin adición de sales sintéticas.',
    sustainableObjective: 'Reducción de huella hídrica en un 80% frente al queso tradicional de origen animal y valorización de subproductos lácteos sustitutos.',
    investigationVariable: 'Relación de inóculo de bacterias lácticas frente a la velocidad de acidificación del gel y la firmeza organoléptica final.',
    initialWeightDefault: 200,
    inoculantOptions: ['Re-siembra de lote anterior', 'Cápsula comercial de probióticos'],
    materiaPrimaLabel: 'Granos de soya / Bebida base',
    precioMateriaPrimaKilo: 4.5,
    precioComercialKilo: 18.5,
    semanaMax: 8,
    phInicialDefault: 5.5,
    phFinalEsperado: 4.3,
    bloque: 'A'
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

