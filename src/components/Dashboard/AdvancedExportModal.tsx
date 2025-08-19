"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  FileText,
  FileSpreadsheet,
  Calendar,
  Filter,
  Users,
  GraduationCap,
  Clock,
  BarChart3,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Alumno, Asistencia } from "@/types";
import {
  exportarAExcel,
  exportarAPDF,
  exportarACSV,
  calcularEstadisticasReporte,
  obtenerPlantillasFecha,
  ReportData,
} from "@/utils/reportExports";
import { obtenerGradosUnicos } from "@/utils/helpers";

interface AdvancedExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  asistencias: (Asistencia & { alumno: Alumno })[];
  fechaInicio: string;
  fechaFin: string;
  filtrosActuales: {
    grado?: number | null;
    seccion?: string | null;
    tipo?: "entrada" | "salida" | "todos";
  };
}

export default function AdvancedExportModal({
  isOpen,
  onClose,
  asistencias,
  fechaInicio,
  fechaFin,
  filtrosActuales,
}: AdvancedExportModalProps) {
  const [tipoExportacion, setTipoExportacion] = useState<
    "excel" | "pdf" | "csv"
  >("excel");
  const [rangoFecha, setRangoFecha] = useState({
    inicio: fechaInicio,
    fin: fechaFin,
  });
  const [filtros, setFiltros] = useState({
    grado: filtrosActuales.grado || null,
    seccion: filtrosActuales.seccion || null,
    tipo: filtrosActuales.tipo || "todos",
  });
  const [plantillaSeleccionada, setPlantillaSeleccionada] =
    useState<string>("");
  const [exportando, setExportando] = useState(false);
  const [exportExitoso, setExportExitoso] = useState(false);

  const plantillas = obtenerPlantillasFecha();

  // Obtener grados únicos de las asistencias
  const gradosDisponibles = Array.from(
    new Set(asistencias.map((a) => a.alumno?.grado).filter((g) => g))
  ).sort((a, b) => (a || 0) - (b || 0));

  // Filtrar asistencias según criterios seleccionados
  const asistenciasFiltradas = asistencias.filter((a) => {
    // Crear fecha en hora local para evitar problemas de zona horaria
    const fechaAsistencia = new Date(a.hora);
    const fechaLocal = new Date(fechaAsistencia.getFullYear(), fechaAsistencia.getMonth(), fechaAsistencia.getDate());
    
    // Formatear fecha local correctamente
    const year = fechaLocal.getFullYear();
    const month = String(fechaLocal.getMonth() + 1).padStart(2, '0');
    const day = String(fechaLocal.getDate()).padStart(2, '0');
    const fechaStr = `${year}-${month}-${day}`;
    
    const dentroRango = fechaStr >= rangoFecha.inicio && fechaStr <= rangoFecha.fin;
    const matchGrado = !filtros.grado || a.alumno?.grado === filtros.grado;
    const matchSeccion =
      !filtros.seccion || a.alumno?.seccion === filtros.seccion;
    const matchTipo = filtros.tipo === "todos" || a.tipo === filtros.tipo;

    return dentroRango && matchGrado && matchSeccion && matchTipo;
  });

  const estadisticas = calcularEstadisticasReporte({
    asistencias: asistenciasFiltradas,
    fechaInicio: rangoFecha.inicio,
    fechaFin: rangoFecha.fin,
    filtros,
  });

  const handlePlantillaChange = (plantillaKey: string) => {
    setPlantillaSeleccionada(plantillaKey);
    if (plantillaKey && plantillas[plantillaKey as keyof typeof plantillas]) {
      const plantilla = plantillas[plantillaKey as keyof typeof plantillas];
      setRangoFecha({
        inicio: plantilla.fechaInicio,
        fin: plantilla.fechaFin,
      });
    }
  };

  const handleExportar = async () => {
    if (asistenciasFiltradas.length === 0) {
      alert("No hay datos para exportar con los filtros seleccionados.");
      return;
    }

    setExportando(true);

    try {
      const reportData: ReportData = {
        asistencias: asistenciasFiltradas,
        fechaInicio: rangoFecha.inicio,
        fechaFin: rangoFecha.fin,
        filtros,
      };

      switch (tipoExportacion) {
        case "excel":
          exportarAExcel(reportData, estadisticas);
          break;
        case "pdf":
          exportarAPDF(reportData, estadisticas);
          break;
        case "csv":
          exportarACSV(reportData);
          break;
      }

      setExportExitoso(true);
      setTimeout(() => {
        setExportExitoso(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error al exportar:", error);
      alert(
        "Ocurrió un error al exportar el reporte. Por favor, intenta de nuevo."
      );
    } finally {
      setExportando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Exportar Reportes de Asistencia
              </h2>
              <p className="text-gray-600 mt-1">
                Genera reportes profesionales en diferentes formatos
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Tipo de exportación */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Formato de Exportación
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setTipoExportacion("excel")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    tipoExportacion === "excel"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <h4 className="font-semibold text-gray-900">Excel (XLSX)</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Formato completo con estadísticas y múltiples hojas
                  </p>
                </button>

                <button
                  onClick={() => setTipoExportacion("pdf")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    tipoExportacion === "pdf"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-red-300"
                  }`}
                >
                  <FileText className="w-8 h-8 mx-auto mb-2 text-red-600" />
                  <h4 className="font-semibold text-gray-900">PDF</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Reporte oficial listo para imprimir
                  </p>
                </button>

                <button
                  onClick={() => setTipoExportacion("csv")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    tipoExportacion === "csv"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <BarChart3 className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">CSV</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Datos sin procesar para análisis personalizado
                  </p>
                </button>
              </div>
            </div>

            {/* Rango de fechas */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Período de Reporte
              </h3>

              {/* Plantillas predefinidas */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Plantillas rápidas:
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(plantillas).map(([key, plantilla]) => (
                    <button
                      key={key}
                      onClick={() => handlePlantillaChange(key)}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        plantillaSeleccionada === key
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {plantilla.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fechas personalizadas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de inicio
                  </label>
                  <input
                    type="date"
                    value={rangoFecha.inicio}
                    onChange={(e) => {
                      setRangoFecha((prev) => ({
                        ...prev,
                        inicio: e.target.value,
                      }));
                      setPlantillaSeleccionada("");
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de fin
                  </label>
                  <input
                    type="date"
                    value={rangoFecha.fin}
                    onChange={(e) => {
                      setRangoFecha((prev) => ({
                        ...prev,
                        fin: e.target.value,
                      }));
                      setPlantillaSeleccionada("");
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Filtros adicionales */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filtros Adicionales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grado
                  </label>
                  <select
                    value={filtros.grado || ""}
                    onChange={(e) =>
                      setFiltros((prev) => ({
                        ...prev,
                        grado: e.target.value ? parseInt(e.target.value) : null,
                        seccion: null, // Reset sección cuando cambia grado
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todos los grados</option>
                    {gradosDisponibles.map((grado) => (
                      <option key={grado} value={grado}>
                        {grado}° Grado
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sección
                  </label>
                  <select
                    value={filtros.seccion || ""}
                    onChange={(e) =>
                      setFiltros((prev) => ({
                        ...prev,
                        seccion: e.target.value || null,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!filtros.grado}
                  >
                    <option value="">Todas las secciones</option>
                    {filtros.grado &&
                      Array.from(
                        new Set(
                          asistencias
                            .filter((a) => a.alumno?.grado === filtros.grado)
                            .map((a) => a.alumno?.seccion)
                            .filter((s) => s)
                        )
                      )
                        .sort()
                        .map((seccion) => (
                          <option key={seccion} value={seccion}>
                            Sección {seccion}
                          </option>
                        ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de registro
                  </label>
                  <select
                    value={filtros.tipo}
                    onChange={(e) =>
                      setFiltros((prev) => ({
                        ...prev,
                        tipo: e.target.value as "entrada" | "salida" | "todos",
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="todos">Todos</option>
                    <option value="entrada">Solo entradas</option>
                    <option value="salida">Solo salidas</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Previsualización de estadísticas */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Resumen del Reporte
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {estadisticas.totalRegistros}
                  </div>
                  <div className="text-sm text-gray-600">Total registros</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {estadisticas.totalAlumnos}
                  </div>
                  <div className="text-sm text-gray-600">Alumnos únicos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {estadisticas.totalEntradas}
                  </div>
                  <div className="text-sm text-gray-600">Entradas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {estadisticas.totalSalidas}
                  </div>
                  <div className="text-sm text-gray-600">Salidas</div>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-600">
                {asistenciasFiltradas.length === 0 ? (
                  <span className="text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    No hay datos para exportar
                  </span>
                ) : (
                  <span className="text-green-600 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {asistenciasFiltradas.length} registros listos para exportar
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <motion.button
                  onClick={handleExportar}
                  disabled={exportando || asistenciasFiltradas.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  whileTap={{ scale: 0.98 }}
                >
                  {exportando ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Exportando...
                    </>
                  ) : exportExitoso ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      ¡Exportado!
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Exportar {tipoExportacion.toUpperCase()}
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
