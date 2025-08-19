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

// Obtener fecha actual en formato YYYY-MM-DD (hora local)
export function obtenerFechaHoy(): string {
  const hoy = new Date();
  // Usar getFullYear(), getMonth() y getDate() para evitar problemas de zona horaria
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Convertir fecha YYYY-MM-DD a rango de timestamps para consultas
export function obtenerRangoFechaParaConsulta(fecha: string): { inicio: string; fin: string } {
  // Crear fecha en hora local sin conversión de zona horaria
  const [year, month, day] = fecha.split('-').map(Number);
  
  // Inicio del día (00:00:00.000) en hora local
  const inicioDelDia = new Date(year, month - 1, day, 0, 0, 0, 0);
  
  // Fin del día (23:59:59.999) en hora local  
  const finDelDia = new Date(year, month - 1, day, 23, 59, 59, 999);
  
  return {
    inicio: inicioDelDia.toISOString(),
    fin: finDelDia.toISOString()
  };
}


// Obtener inicio y fin del día actual (mantener para compatibilidad)
export function obtenerRangoHoy(): { inicio: string; fin: string } {
  const hoy = obtenerFechaHoy();
  return obtenerRangoFechaParaConsulta(hoy);
}

// NUEVA FUNCIÓN: Obtener rango de fechas específico para consultas
export function obtenerRangoFecha(fecha: string): { inicio: string; fin: string } {
  const fechaObj = new Date(fecha + 'T00:00:00'); // Evitar conversión de zona horaria
  
  // Inicio del día
  const inicio = new Date(fechaObj.getFullYear(), fechaObj.getMonth(), fechaObj.getDate(), 0, 0, 0, 0);
  
  // Fin del día
  const fin = new Date(fechaObj.getFullYear(), fechaObj.getMonth(), fechaObj.getDate(), 23, 59, 59, 999);
  
  return {
    inicio: inicio.toISOString(),
    fin: fin.toISOString()
  };
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

// Validar DNI peruano (8 dígitos)
export function validarDNI(dni: string): boolean {
  const dniRegex = /^\d{8}$/;
  return dniRegex.test(dni);
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
        alumno.dni.toLowerCase().includes(busqueda) ||
        alumno.nombres_apoderado.toLowerCase().includes(busqueda)
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
