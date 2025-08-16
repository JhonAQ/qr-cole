import { Alumno, Asistencia, RegistroAsistencia, EstadoAsistencia } from '@/types';

// Formatear fecha para mostrar
export function formatearFecha(fecha: string | Date): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Formatear hora para mostrar
export function formatearHora(fecha: string | Date): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Formatear fecha y hora completa
export function formatearFechaHora(fecha: string | Date): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Obtener fecha actual en formato YYYY-MM-DD
export function obtenerFechaHoy(): string {
  return new Date().toISOString().split('T')[0];
}

// Obtener inicio y fin del día actual
export function obtenerRangoHoy(): { inicio: string; fin: string } {
  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString();
  const fin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59).toISOString();
  return { inicio, fin };
}

// Validar email
export function validarEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validar teléfono (formato básico)
export function validarTelefono(telefono: string): boolean {
  const telefonoRegex = /^[\d\s\-\+\(\)]+$/;
  return telefonoRegex.test(telefono) && telefono.length >= 9;
}

// Generar código QR único
export function generarCodigoQR(nombres: string, apellidos: string): string {
  const timestamp = Date.now().toString(36);
  const nombreHash = btoa(`${nombres}${apellidos}`).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
  return `QR-${nombreHash}-${timestamp}`.toUpperCase();
}

// Calcular estado de asistencia de un alumno
export function calcularEstadoAsistencia(asistencias: Asistencia[]): EstadoAsistencia {
  if (asistencias.length === 0) return 'ausente';
  
  const tieneEntrada = asistencias.some(a => a.tipo === 'entrada');
  const tieneSalida = asistencias.some(a => a.tipo === 'salida');
  
  if (tieneEntrada && tieneSalida) return 'presente';
  if (tieneEntrada || tieneSalida) return 'parcial';
  return 'ausente';
}

// Procesar registros de asistencia por alumno
export function procesarRegistrosAsistencia(
  alumnos: Alumno[], 
  asistencias: Asistencia[]
): RegistroAsistencia[] {
  return alumnos.map(alumno => {
    const asistenciasAlumno = asistencias.filter(a => a.id_alumno === alumno.id);
    
    const entradas = asistenciasAlumno.filter(a => a.tipo === 'entrada');
    const salidas = asistenciasAlumno.filter(a => a.tipo === 'salida');
    
    const ultimaEntrada = entradas.length > 0 
      ? entradas.sort((a, b) => new Date(b.hora).getTime() - new Date(a.hora).getTime())[0].hora
      : undefined;
      
    const ultimaSalida = salidas.length > 0 
      ? salidas.sort((a, b) => new Date(b.hora).getTime() - new Date(a.hora).getTime())[0].hora
      : undefined;

    return {
      alumno,
      asistencias: asistenciasAlumno,
      ultimaEntrada,
      ultimaSalida,
      estado: calcularEstadoAsistencia(asistenciasAlumno),
    };
  });
}

// Filtrar alumnos por criterios
export function filtrarAlumnos(
  alumnos: Alumno[],
  filtros: { busqueda?: string; grado?: number; seccion?: string }
): Alumno[] {
  return alumnos.filter(alumno => {
    let cumple = true;

    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      const nombreCompleto = `${alumno.nombres} ${alumno.apellidos}`.toLowerCase();
      cumple = cumple && (
        nombreCompleto.includes(busqueda) ||
        alumno.codigo_qr.toLowerCase().includes(busqueda)
      );
    }

    if (filtros.grado) {
      cumple = cumple && alumno.grado === filtros.grado;
    }

    if (filtros.seccion) {
      cumple = cumple && alumno.seccion === filtros.seccion;
    }

    return cumple;
  });
}

// Obtener grados únicos de la lista de alumnos
export function obtenerGradosUnicos(alumnos: Alumno[]): number[] {
  const grados = new Set(alumnos.map(a => a.grado));
  return Array.from(grados).sort((a, b) => a - b);
}

// Obtener secciones únicas de la lista de alumnos
export function obtenerSeccionesUnicas(alumnos: Alumno[]): string[] {
  const secciones = new Set(alumnos.map(a => a.seccion));
  return Array.from(secciones).sort();
}

// Obtener secciones por grado
export function obtenerSeccionesPorGrado(alumnos: Alumno[], grado: number): string[] {
  const secciones = new Set(
    alumnos
      .filter(a => a.grado === grado)
      .map(a => a.seccion)
  );
  return Array.from(secciones).sort();
}

// Capitalizar primera letra
export function capitalizarPrimera(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

// Normalizar nombre completo
export function normalizarNombre(nombres: string, apellidos: string): string {
  const normalizar = (texto: string) => 
    texto.split(' ')
      .map(palabra => capitalizarPrimera(palabra.trim()))
      .join(' ');
  
  return `${normalizar(apellidos)}, ${normalizar(nombres)}`;
}

// Obtener color por estado de asistencia
export function obtenerColorEstado(estado: EstadoAsistencia): { 
  bg: string; 
  text: string; 
  border: string;
  dot: string;
} {
  switch (estado) {
    case 'presente':
      return {
        bg: 'bg-green-50',
        text: 'text-green-800',
        border: 'border-green-200',
        dot: 'bg-green-500',
      };
    case 'parcial':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        dot: 'bg-yellow-500',
      };
    case 'ausente':
      return {
        bg: 'bg-red-50',
        text: 'text-red-800',
        border: 'border-red-200',
        dot: 'bg-red-500',
      };
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-800',
        border: 'border-gray-200',
        dot: 'bg-gray-500',
      };
  }
}

// Obtener texto por estado de asistencia
export function obtenerTextoEstado(estado: EstadoAsistencia): string {
  switch (estado) {
    case 'presente':
      return 'Presente';
    case 'parcial':
      return 'Parcial';
    case 'ausente':
      return 'Ausente';
    default:
      return 'Desconocido';
  }
}

// Debounce para búsquedas
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
