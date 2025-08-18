import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Alumno, Asistencia } from '@/types';
import { formatearFecha, formatearHora, formatearFechaHora } from './helpers';

// Tipo extendido para jsPDF con autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => void;
}

export interface ReportData {
  asistencias: (Asistencia & { alumno: Alumno })[];
  fechaInicio: string;
  fechaFin: string;
  filtros: {
    grado?: number | null;
    seccion?: string | null;
    tipo?: 'entrada' | 'salida' | 'todos';
  };
}

export interface EstadisticasReporte {
  totalRegistros: number;
  totalAlumnos: number;
  totalEntradas: number;
  totalSalidas: number;
  porGrado: Record<number, { total: number; alumnos: number; entradas: number; salidas: number }>;
  porFecha: Record<string, { total: number; entradas: number; salidas: number }>;
  alumnosConMasAsistencia: { alumno: Alumno; total: number }[];
  alumnosConMenosAsistencia: { alumno: Alumno; total: number }[];
}

// Calcular estadísticas del reporte
export const calcularEstadisticasReporte = (data: ReportData): EstadisticasReporte => {
  const { asistencias } = data;
  
  const totalRegistros = asistencias.length;
  const totalEntradas = asistencias.filter(a => a.tipo === 'entrada').length;
  const totalSalidas = asistencias.filter(a => a.tipo === 'salida').length;
  
  // Alumnos únicos
  const alumnosUnicos = new Set(asistencias.map(a => a.id_alumno));
  const totalAlumnos = alumnosUnicos.size;
  
  // Estadísticas por grado
  const porGrado: Record<number, { total: number; alumnos: number; entradas: number; salidas: number }> = {};
  
  asistencias.forEach(a => {
    const grado = a.alumno?.grado || 0;
    if (!porGrado[grado]) {
      porGrado[grado] = { total: 0, alumnos: 0, entradas: 0, salidas: 0 };
    }
    porGrado[grado].total++;
    if (a.tipo === 'entrada') porGrado[grado].entradas++;
    if (a.tipo === 'salida') porGrado[grado].salidas++;
  });
  
  // Contar alumnos únicos por grado
  Object.keys(porGrado).forEach(gradoKey => {
    const grado = parseInt(gradoKey);
    const alumnosGrado = new Set(
      asistencias
        .filter(a => a.alumno?.grado === grado)
        .map(a => a.id_alumno)
    );
    porGrado[grado].alumnos = alumnosGrado.size;
  });
  
  // Estadísticas por fecha
  const porFecha: Record<string, { total: number; entradas: number; salidas: number }> = {};
  
  asistencias.forEach(a => {
    const fecha = formatearFecha(a.hora);
    if (!porFecha[fecha]) {
      porFecha[fecha] = { total: 0, entradas: 0, salidas: 0 };
    }
    porFecha[fecha].total++;
    if (a.tipo === 'entrada') porFecha[fecha].entradas++;
    if (a.tipo === 'salida') porFecha[fecha].salidas++;
  });
  
  // Alumnos con más y menos asistencia
  const asistenciaPorAlumno: Record<string, { alumno: Alumno; total: number }> = {};
  
  asistencias.forEach(a => {
    if (a.alumno) {
      if (!asistenciaPorAlumno[a.id_alumno]) {
        asistenciaPorAlumno[a.id_alumno] = { alumno: a.alumno, total: 0 };
      }
      asistenciaPorAlumno[a.id_alumno].total++;
    }
  });
  
  const alumnosOrdenados = Object.values(asistenciaPorAlumno).sort((a, b) => b.total - a.total);
  
  return {
    totalRegistros,
    totalAlumnos,
    totalEntradas,
    totalSalidas,
    porGrado,
    porFecha,
    alumnosConMasAsistencia: alumnosOrdenados.slice(0, 10),
    alumnosConMenosAsistencia: alumnosOrdenados.slice(-10).reverse(),
  };
};

// Exportar a Excel con formato profesional
export const exportarAExcel = (data: ReportData, estadisticas: EstadisticasReporte): void => {
  const workbook = XLSX.utils.book_new();
  
  // Hoja 1: Registros de asistencia
  const registrosData = data.asistencias.map((a, index) => ({
    'N°': index + 1,
    'Fecha': formatearFecha(a.hora),
    'Hora': formatearHora(a.hora),
    'Nombres': a.alumno?.nombres || '',
    'Apellidos': a.alumno?.apellidos || '',
    'DNI': a.alumno?.dni || '',
    'Grado': `${a.alumno?.grado || ''}°`,
    'Sección': a.alumno?.seccion || '',
    'Tipo': a.tipo === 'entrada' ? 'ENTRADA' : 'SALIDA',
    'Apoderado': a.alumno?.nombres_apoderado || '',
    'Contacto': a.alumno?.contacto_padres || '',
  }));
  
  const registrosWS = XLSX.utils.json_to_sheet(registrosData);
  
  // Ajustar ancho de columnas
  const colWidths = [
    { wch: 5 },  // N°
    { wch: 12 }, // Fecha
    { wch: 8 },  // Hora
    { wch: 15 }, // Nombres
    { wch: 15 }, // Apellidos
    { wch: 10 }, // DNI
    { wch: 8 },  // Grado
    { wch: 8 },  // Sección
    { wch: 10 }, // Tipo
    { wch: 20 }, // Apoderado
    { wch: 12 }, // Contacto
  ];
  registrosWS['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(workbook, registrosWS, 'Registros de Asistencia');
  
  // Hoja 2: Resumen estadístico
  const resumenData = [
    ['RESUMEN GENERAL', ''],
    ['Total de registros:', estadisticas.totalRegistros],
    ['Alumnos únicos:', estadisticas.totalAlumnos],
    ['Total entradas:', estadisticas.totalEntradas],
    ['Total salidas:', estadisticas.totalSalidas],
    ['Período:', `${formatearFecha(data.fechaInicio)} - ${formatearFecha(data.fechaFin)}`],
    [''],
    ['ESTADÍSTICAS POR GRADO', ''],
    ['Grado', 'Alumnos', 'Registros', 'Entradas', 'Salidas'],
  ];
  
  Object.keys(estadisticas.porGrado).forEach(grado => {
    const stats = estadisticas.porGrado[parseInt(grado)];
    resumenData.push([
      `${grado}°`,
      stats.alumnos.toString(),
      stats.total.toString(),
      stats.entradas.toString(),
      stats.salidas.toString(),
    ]);
  });
  
  resumenData.push(['']);
  resumenData.push(['TOP 10 - ALUMNOS CON MÁS ASISTENCIA', '']);
  resumenData.push(['Alumno', 'Total Registros']);
  
  estadisticas.alumnosConMasAsistencia.slice(0, 10).forEach(item => {
    resumenData.push([
      `${item.alumno.nombres} ${item.alumno.apellidos}`,
      item.total.toString(),
    ]);
  });
  
  const resumenWS = XLSX.utils.aoa_to_sheet(resumenData);
  resumenWS['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
  
  XLSX.utils.book_append_sheet(workbook, resumenWS, 'Resumen Estadístico');
  
  // Hoja 3: Asistencia por fecha
  const fechasData = [['Fecha', 'Total Registros', 'Entradas', 'Salidas']];
  Object.keys(estadisticas.porFecha).forEach(fecha => {
    const stats = estadisticas.porFecha[fecha];
    fechasData.push([fecha, stats.total.toString(), stats.entradas.toString(), stats.salidas.toString()]);
  });
  
  const fechasWS = XLSX.utils.aoa_to_sheet(fechasData);
  fechasWS['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }];
  
  XLSX.utils.book_append_sheet(workbook, fechasWS, 'Asistencia por Fecha');
  
  // Generar nombre del archivo
  const nombreArchivo = generarNombreArchivo('excel', data);
  
  // Descargar archivo
  XLSX.writeFile(workbook, nombreArchivo);
};

// Exportar a PDF con formato oficial
export const exportarAPDF = (data: ReportData, estadisticas: EstadisticasReporte): void => {
  try {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    
    // Encabezado
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('COLEGIO FE Y CIENCIA', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('REPORTE DE ASISTENCIA ESTUDIANTIL', 105, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Período: ${formatearFecha(data.fechaInicio)} - ${formatearFecha(data.fechaFin)}`, 20, 45);
    doc.text(`Generado: ${formatearFechaHora(new Date().toISOString())}`, 20, 52);
    
    // Filtros aplicados
    let filtrosTexto = 'Filtros: ';
    if (data.filtros.grado) filtrosTexto += `Grado ${data.filtros.grado}° `;
    if (data.filtros.seccion) filtrosTexto += `Sección ${data.filtros.seccion} `;
    if (data.filtros.tipo && data.filtros.tipo !== 'todos') filtrosTexto += `Tipo: ${data.filtros.tipo} `;
    if (filtrosTexto === 'Filtros: ') filtrosTexto += 'Ninguno';
    
    doc.text(filtrosTexto, 20, 59);
    
    // Resumen estadístico
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN ESTADÍSTICO', 20, 75);
    doc.setFont('helvetica', 'normal');
    
    const resumenInfo = [
      `Total de registros: ${estadisticas.totalRegistros}`,
      `Alumnos únicos: ${estadisticas.totalAlumnos}`,
      `Total entradas: ${estadisticas.totalEntradas}`,
      `Total salidas: ${estadisticas.totalSalidas}`,
    ];
    
    resumenInfo.forEach((info, index) => {
      doc.text(info, 25, 85 + (index * 7));
    });
    
    // Tabla de registros
    const tableData = data.asistencias.slice(0, 50).map((a, index) => [
      (index + 1).toString(),
      formatearFecha(a.hora),
      formatearHora(a.hora),
      `${a.alumno?.nombres || ''} ${a.alumno?.apellidos || ''}`.trim(),
      `${a.alumno?.grado || ''}°-${a.alumno?.seccion || ''}`,
      a.tipo === 'entrada' ? 'ENT' : 'SAL',
    ]);
    
    // Verificar si autoTable está disponible
    if (doc.autoTable && typeof doc.autoTable === 'function') {
      doc.autoTable({
        head: [['N°', 'Fecha', 'Hora', 'Alumno', 'Grado-Sec', 'Tipo']],
        body: tableData,
        startY: 120,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 25 },
          2: { cellWidth: 20 },
          3: { cellWidth: 60 },
          4: { cellWidth: 25 },
          5: { cellWidth: 20 },
        },
      });
    } else {
      // Fallback manual si autoTable no está disponible
      let yPos = 120;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      
      // Encabezados
      doc.text('N°', 20, yPos);
      doc.text('Fecha', 35, yPos);
      doc.text('Hora', 70, yPos);
      doc.text('Alumno', 95, yPos);
      doc.text('Grado-Sec', 140, yPos);
      doc.text('Tipo', 165, yPos);
      yPos += 10;
      
      // Datos
      doc.setFont('helvetica', 'normal');
      tableData.slice(0, 20).forEach(row => {
        doc.text(row[0], 20, yPos);
        doc.text(row[1], 35, yPos);
        doc.text(row[2], 70, yPos);
        doc.text(row[3].substring(0, 20), 95, yPos);
        doc.text(row[4], 140, yPos);
        doc.text(row[5], 165, yPos);
        yPos += 6;
      });
    }
    
    // Pie de página
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
      doc.text('Sistema de Control de Asistencia - QR Cole', 105, 295, { align: 'center' });
    }
    
    // Descargar archivo
    const nombreArchivo = generarNombreArchivo('pdf', data);
    doc.save(nombreArchivo);
    
  } catch (error) {
    console.error('Error al generar PDF con autoTable, usando método alternativo:', error);
    // Usar método alternativo sin autoTable
    import('./pdfExportAlternative').then(module => {
      module.exportarAPDFSimple(data, estadisticas);
    });
  }
};

// Exportar CSV mejorado
export const exportarACSV = (data: ReportData): void => {
  const csvContent = data.asistencias
    .map((a, index) => 
      `${index + 1},"${formatearFecha(a.hora)}","${formatearHora(a.hora)}","${a.alumno?.nombres || ''}","${a.alumno?.apellidos || ''}","${a.alumno?.dni || ''}","${a.alumno?.grado || ''}°","${a.alumno?.seccion || ''}","${a.tipo === 'entrada' ? 'ENTRADA' : 'SALIDA'}","${a.alumno?.nombres_apoderado || ''}","${a.alumno?.contacto_padres || ''}"`
    )
    .join('\n');

  const headers = 'N°,Fecha,Hora,Nombres,Apellidos,DNI,Grado,Sección,Tipo,Apoderado,Contacto\n';
  const blob = new Blob([`\uFEFF${headers}${csvContent}`], { 
    type: 'text/csv;charset=utf-8;' 
  });

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = generarNombreArchivo('csv', data);
  a.click();
  window.URL.revokeObjectURL(url);
};

// Generar nombre de archivo consistente
const generarNombreArchivo = (formato: 'excel' | 'pdf' | 'csv', data: ReportData): string => {
  const fechaInicio = data.fechaInicio.replace(/-/g, '');
  const fechaFin = data.fechaFin.replace(/-/g, '');
  const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
  
  let filtro = '';
  if (data.filtros.grado) filtro += `_G${data.filtros.grado}`;
  if (data.filtros.seccion) filtro += `_S${data.filtros.seccion}`;
  if (data.filtros.tipo && data.filtros.tipo !== 'todos') filtro += `_${data.filtros.tipo.charAt(0).toUpperCase()}`;
  
  const extension = formato === 'excel' ? 'xlsx' : formato;
  
  return `Asistencia_${fechaInicio}_${fechaFin}${filtro}_${timestamp}.${extension}`;
};

// Plantillas predefinidas para rangos de fechas
export const obtenerPlantillasFecha = () => {
  const hoy = new Date();
  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);
  
  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate() - hoy.getDay());
  
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  
  const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
  const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
  
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  
  return {
    hoy: {
      label: 'Hoy',
      fechaInicio: formatDate(hoy),
      fechaFin: formatDate(hoy),
    },
    ayer: {
      label: 'Ayer',
      fechaInicio: formatDate(ayer),
      fechaFin: formatDate(ayer),
    },
    estaSemana: {
      label: 'Esta semana',
      fechaInicio: formatDate(inicioSemana),
      fechaFin: formatDate(hoy),
    },
    esteMes: {
      label: 'Este mes',
      fechaInicio: formatDate(inicioMes),
      fechaFin: formatDate(finMes),
    },
    mesAnterior: {
      label: 'Mes anterior',
      fechaInicio: formatDate(inicioMesAnterior),
      fechaFin: formatDate(finMesAnterior),
    },
  };
};
