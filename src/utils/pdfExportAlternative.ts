import jsPDF from 'jspdf';
import { ReportData, EstadisticasReporte } from './reportExports';
import { formatearFecha, formatearHora } from './helpers';

// Alternativa para PDF sin autotable - más confiable
export const exportarAPDFSimple = (data: ReportData, estadisticas: EstadisticasReporte): void => {
  const doc = new jsPDF();
  let yPosition = 20;
  
  // Función helper para agregar texto con salto de línea automático
  const addText = (text: string, x: number, y: number, maxWidth?: number) => {
    if (maxWidth && doc.getTextWidth(text) > maxWidth) {
      const words = text.split(' ');
      let line = '';
      let currentY = y;
      
      for (const word of words) {
        const testLine = line + word + ' ';
        const testWidth = doc.getTextWidth(testLine);
        
        if (testWidth > maxWidth && line !== '') {
          doc.text(line.trim(), x, currentY);
          line = word + ' ';
          currentY += 7;
        } else {
          line = testLine;
        }
      }
      
      if (line.trim()) {
        doc.text(line.trim(), x, currentY);
      }
      
      return currentY + 7;
    } else {
      doc.text(text, x, y);
      return y + 7;
    }
  };
  
  // Encabezado
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('COLEGIO FE Y CIENCIA', 105, yPosition, { align: 'center' });
  yPosition += 10;
  
  doc.setFontSize(14);
  doc.text('REPORTE DE ASISTENCIA ESTUDIANTIL', 105, yPosition, { align: 'center' });
  yPosition += 15;
  
  // Información del reporte
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Período: ${formatearFecha(data.fechaInicio)} - ${formatearFecha(data.fechaFin)}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 20, yPosition);
  yPosition += 7;
  
  // Filtros aplicados
  let filtrosTexto = 'Filtros: ';
  if (data.filtros.grado) filtrosTexto += `Grado ${data.filtros.grado}° `;
  if (data.filtros.seccion) filtrosTexto += `Sección ${data.filtros.seccion} `;
  if (data.filtros.tipo && data.filtros.tipo !== 'todos') filtrosTexto += `Tipo: ${data.filtros.tipo} `;
  if (filtrosTexto === 'Filtros: ') filtrosTexto += 'Ninguno';
  
  doc.text(filtrosTexto, 20, yPosition);
  yPosition += 15;
  
  // Resumen estadístico
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMEN ESTADÍSTICO', 20, yPosition);
  yPosition += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Total de registros: ${estadisticas.totalRegistros}`, 25, yPosition);
  yPosition += 7;
  doc.text(`Alumnos únicos: ${estadisticas.totalAlumnos}`, 25, yPosition);
  yPosition += 7;
  doc.text(`Total entradas: ${estadisticas.totalEntradas}`, 25, yPosition);
  yPosition += 7;
  doc.text(`Total salidas: ${estadisticas.totalSalidas}`, 25, yPosition);
  yPosition += 15;
  
  // Tabla manual de registros (primeros 20 registros)
  doc.setFont('helvetica', 'bold');
  doc.text('REGISTROS DE ASISTENCIA (Primeros 20)', 20, yPosition);
  yPosition += 10;
  
  // Encabezados de tabla
  doc.setFontSize(8);
  doc.text('N°', 20, yPosition);
  doc.text('Fecha', 35, yPosition);
  doc.text('Hora', 70, yPosition);
  doc.text('Alumno', 95, yPosition);
  doc.text('Grado', 140, yPosition);
  doc.text('Tipo', 165, yPosition);
  
  // Línea separadora
  doc.line(20, yPosition + 2, 190, yPosition + 2);
  yPosition += 8;
  
  // Datos de tabla
  doc.setFont('helvetica', 'normal');
  const maxRegistros = Math.min(20, data.asistencias.length);
  
  for (let i = 0; i < maxRegistros; i++) {
    const a = data.asistencias[i];
    
    // Verificar si necesitamos nueva página
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.text((i + 1).toString(), 20, yPosition);
    doc.text(formatearFecha(a.hora), 35, yPosition);
    doc.text(formatearHora(a.hora), 70, yPosition);
    
    // Nombre del alumno (truncado si es muy largo)
    const nombreCompleto = `${a.alumno?.nombres || ''} ${a.alumno?.apellidos || ''}`.trim();
    const nombreTruncado = nombreCompleto.length > 20 ? nombreCompleto.substring(0, 17) + '...' : nombreCompleto;
    doc.text(nombreTruncado, 95, yPosition);
    
    doc.text(`${a.alumno?.grado || ''}°-${a.alumno?.seccion || ''}`, 140, yPosition);
    doc.text(a.tipo === 'entrada' ? 'ENT' : 'SAL', 165, yPosition);
    
    yPosition += 6;
  }
  
  // Nota si hay más registros
  if (data.asistencias.length > 20) {
    yPosition += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(`... y ${data.asistencias.length - 20} registros más. Descarga el Excel para ver todos los datos.`, 20, yPosition);
  }
  
  // Pie de página
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Página ${i} de ${totalPages}`, 105, 290, { align: 'center' });
    doc.text('Sistema de Control de Asistencia - QR Cole', 105, 295, { align: 'center' });
  }
  
  // Generar nombre del archivo
  const fechaInicio = data.fechaInicio.replace(/-/g, '');
  const fechaFin = data.fechaFin.replace(/-/g, '');
  const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
  
  let filtro = '';
  if (data.filtros.grado) filtro += `_G${data.filtros.grado}`;
  if (data.filtros.seccion) filtro += `_S${data.filtros.seccion}`;
  if (data.filtros.tipo && data.filtros.tipo !== 'todos') filtro += `_${data.filtros.tipo.charAt(0).toUpperCase()}`;
  
  const nombreArchivo = `Asistencia_${fechaInicio}_${fechaFin}${filtro}_${timestamp}.pdf`;
  
  // Descargar archivo
  doc.save(nombreArchivo);
};
