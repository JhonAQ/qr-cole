// Tipos principales del sistema
export interface Alumno {
  id: string;
  nombres: string;
  apellidos: string;
  dni: string;
  nombres_apoderado: string;
  codigo_qr: string;
  contacto_padres: string;
  grado: number;
  seccion: string;
}

export interface Asistencia {
  id: string;
  id_alumno: string;
  hora: string;
  tipo: 'entrada' | 'salida';
  alumno?: Alumno;
}

// Tipos para estadísticas
export interface EstadisticasGenerales {
  totalAlumnos: number;
  presentesHoy: number;
  ausentesHoy: number;
  registrosHoy: number;
  porcentajeAsistencia: number;
  totalGrados: number;
}

export interface EstadisticasGrado {
  grado: number;
  seccion: string;
  totalAlumnos: number;
  presentes: number;
  ausentes: number;
  porcentajeAsistencia: number;
}

export interface RegistroAsistencia {
  alumno: Alumno;
  asistencias: Asistencia[];
  ultimaEntrada?: string;
  ultimaSalida?: string;
  estado: 'presente' | 'ausente' | 'parcial';
}

// Tipos para filtros
export interface FiltrosAsistencia {
  fecha?: string;
  grado?: number;
  seccion?: string;
  tipo?: 'entrada' | 'salida' | 'todos';
}

export interface FiltrosAlumnos {
  busqueda?: string;
  grado?: number;
  seccion?: string;
}

// Tipos para modales/formularios
export interface FormularioAlumno {
  nombres: string;
  apellidos: string;
  codigo_qr: string;
  contacto_padres: string;
  grado: number;
  seccion: string;
}

// Tipos para componentes
export interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export type EstadoAsistencia = 'presente' | 'ausente' | 'parcial';
export type TipoAsistencia = 'entrada' | 'salida';

// Interfaces para props de componentes
export interface DashboardContextType {
  alumnos: Alumno[];
  asistencias: Asistencia[];
  estadisticas: EstadisticasGenerales;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}
