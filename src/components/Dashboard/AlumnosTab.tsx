"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  QrCode,
  Phone,
  Users,
  BookOpen,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  UserCheck,
  UserX,
  Eye,
  Download,
  X,
  Grid,
  List,
} from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { Alumno } from "@/types";
import {
  filtrarAlumnos,
  obtenerGradosUnicos,
  obtenerSeccionesUnicas,
  obtenerSeccionesPorGrado,
  normalizarNombre,
  obtenerColorEstado,
  obtenerTextoEstado,
  calcularEstadoAsistencia,
  debounce,
} from "@/utils/helpers";
import StudentDetailModal from "./StudentDetailModal";

interface AlumnosTabProps {
  selectedGrade?: number | null;
  selectedSection?: string | null;
}

export default function AlumnosTab({
  selectedGrade,
  selectedSection,
}: AlumnosTabProps) {
  const { alumnos, asistencias, loading, refreshData } = useDashboard();
  const [busqueda, setBusqueda] = useState("");
  const [gradoFiltro, setGradoFiltro] = useState<number | null>(
    selectedGrade || null
  );
  const [seccionFiltro, setSeccionFiltro] = useState<string | null>(
    selectedSection || null
  );
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<Alumno | null>(
    null
  );
  const [mostrarModal, setMostrarModal] = useState(false);
  const [ordenPor, setOrdenPor] = useState<"nombre" | "grado" | "asistencia">(
    "nombre"
  );
  const [ordenAsc, setOrdenAsc] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Actualizar filtros cuando se seleccione desde la navegación
  React.useEffect(() => {
    if (selectedGrade !== undefined) {
      setGradoFiltro(selectedGrade === 0 ? null : selectedGrade);
    }
    if (selectedSection !== undefined) {
      setSeccionFiltro(selectedSection);
    }
  }, [selectedGrade, selectedSection]);

  // Filtrar y ordenar alumnos
  const alumnosFiltrados = useMemo(() => {
    let resultado = filtrarAlumnos(alumnos, {
      busqueda,
      grado: gradoFiltro || undefined,
      seccion: seccionFiltro || undefined,
    });

    // Ordenar
    resultado = resultado.sort((a, b) => {
      let valorA: string | number;
      let valorB: string | number;

      switch (ordenPor) {
        case "nombre":
          valorA = normalizarNombre(a.nombres, a.apellidos);
          valorB = normalizarNombre(b.nombres, b.apellidos);
          break;
        case "grado":
          valorA = `${a.grado}-${a.seccion}`;
          valorB = `${b.grado}-${b.seccion}`;
          break;
        case "asistencia":
          const asistenciasA = asistencias.filter(
            (as) => as.id_alumno === a.id
          );
          const asistenciasB = asistencias.filter(
            (as) => as.id_alumno === b.id
          );
          valorA = calcularEstadoAsistencia(asistenciasA);
          valorB = calcularEstadoAsistencia(asistenciasB);
          break;
        default:
          valorA = a.nombres;
          valorB = b.nombres;
      }

      if (valorA < valorB) return ordenAsc ? -1 : 1;
      if (valorA > valorB) return ordenAsc ? 1 : -1;
      return 0;
    });

    return resultado;
  }, [
    alumnos,
    busqueda,
    gradoFiltro,
    seccionFiltro,
    ordenPor,
    ordenAsc,
    asistencias,
  ]);

  // Búsqueda con debounce
  const debouncedSetBusqueda = useMemo(
    () => debounce((valor: string) => setBusqueda(valor), 300),
    []
  );

  const handleBusquedaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetBusqueda(e.target.value);
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setGradoFiltro(null);
    setSeccionFiltro(null);
  };

  const handleUpdateStudent = (updatedStudent: Alumno) => {
    refreshData(); // Refrescar datos del dashboard
  };

  const handleDeleteStudent = (studentId: string) => {
    refreshData(); // Refrescar datos del dashboard
  };

  const handleViewStudent = (alumno: Alumno) => {
    setAlumnoSeleccionado(alumno);
    setMostrarModal(true);
  };

  const gradosDisponibles = obtenerGradosUnicos(alumnos);
  const seccionesDisponibles = gradoFiltro
    ? obtenerSeccionesPorGrado(alumnos, gradoFiltro)
    : obtenerSeccionesUnicas(alumnos);

  const handleOrdenar = (tipo: "nombre" | "grado" | "asistencia") => {
    if (ordenPor === tipo) {
      setOrdenAsc(!ordenAsc);
    } else {
      setOrdenPor(tipo);
      setOrdenAsc(true);
    }
  };

  // Obtener título dinámico basado en los filtros
  const getTitulo = () => {
    if (gradoFiltro && seccionFiltro) {
      return `${gradoFiltro}° Grado - Sección ${seccionFiltro}`;
    } else if (gradoFiltro) {
      return `${gradoFiltro}° Grado`;
    } else if (busqueda) {
      return `Resultados para: "${busqueda}"`;
    }
    return "Todos los Alumnos";
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3" />
          <div className="h-12 bg-gray-200 rounded" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{getTitulo()}</h2>
            <p className="text-gray-600 text-sm mt-1">
              {alumnosFiltrados.length} de {alumnos.length} alumnos
              {gradoFiltro && ` • ${gradoFiltro}° Grado`}
              {seccionFiltro && ` • Sección ${seccionFiltro}`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Toggle de vista */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-white shadow text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                title="Vista de lista"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white shadow text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                title="Vista de cuadrícula"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>

            {/* Botón nuevo alumno */}
            <button
              onClick={() => window.open("/register", "_blank")}
              className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Nuevo Alumno</span>
              <span className="sm:hidden">Agregar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="space-y-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o código QR..."
              onChange={handleBusquedaChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700 focus:border-transparent"
            />
          </div>

          {/* Controles de filtros */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                <span>Filtros avanzados</span>
                {mostrarFiltros ? (
                  <ChevronUp className="w-4 h-4 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2" />
                )}
              </button>

              {(gradoFiltro || seccionFiltro || busqueda) && (
                <button
                  onClick={limpiarFiltros}
                  className="px-3 py-2 text-red-600 text-sm hover:text-red-700 transition-colors"
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-sm text-gray-500">Ordenar por:</span>
              <select
                value={`${ordenPor}-${ordenAsc ? "asc" : "desc"}`}
                onChange={(e) => {
                  const [tipo, direccion] = e.target.value.split("-");
                  setOrdenPor(tipo as "nombre" | "grado" | "asistencia");
                  setOrdenAsc(direccion === "asc");
                }}
                className="text-sm border text-gray-700 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="nombre-asc">Nombre A-Z</option>
                <option value="nombre-desc">Nombre Z-A</option>
                <option value="grado-asc">Grado ↑</option>
                <option value="grado-desc">Grado ↓</option>
                <option value="asistencia-asc">Asistencia ↑</option>
                <option value="asistencia-desc">Asistencia ↓</option>
              </select>
            </div>
          </div>

          {/* Panel de filtros expandido */}
          <AnimatePresence>
            {mostrarFiltros && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t pt-4 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grado
                    </label>
                    <select
                      value={gradoFiltro || ""}
                      onChange={(e) => {
                        const grado = e.target.value
                          ? Number(e.target.value)
                          : null;
                        setGradoFiltro(grado);
                        setSeccionFiltro(null); // Reset sección al cambiar grado
                      }}
                      className="w-full border text-gray-700 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
                      value={seccionFiltro || ""}
                      onChange={(e) => setSeccionFiltro(e.target.value || null)}
                      className="w-full border text-gray-700 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      disabled={
                        !gradoFiltro && seccionesDisponibles.length === 0
                      }
                    >
                      <option value="">Todas las secciones</option>
                      {seccionesDisponibles.map((seccion) => (
                        <option key={seccion} value={seccion}>
                          Sección {seccion}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Vista de alumnos */}
      {viewMode === "list" ? (
        <StudentsListView
          alumnosFiltrados={alumnosFiltrados}
          asistencias={asistencias}
          ordenPor={ordenPor}
          ordenAsc={ordenAsc}
          handleOrdenar={handleOrdenar}
          onViewStudent={handleViewStudent}
        />
      ) : (
        <StudentsGridView
          alumnosFiltrados={alumnosFiltrados}
          asistencias={asistencias}
          onViewStudent={handleViewStudent}
        />
      )}

      {/* Modal de detalle */}
      <AnimatePresence>
        {alumnoSeleccionado && mostrarModal && (
          <StudentDetailModal
            alumno={alumnoSeleccionado}
            asistencias={asistencias.filter(
              (a) => a.id_alumno === alumnoSeleccionado.id
            )}
            onClose={() => {
              setAlumnoSeleccionado(null);
              setMostrarModal(false);
            }}
            onUpdate={handleUpdateStudent}
            onDelete={handleDeleteStudent}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Vista de lista de estudiantes
function StudentsListView({
  alumnosFiltrados,
  asistencias,
  ordenPor,
  ordenAsc,
  handleOrdenar,
  onViewStudent,
}: {
  alumnosFiltrados: Alumno[];
  asistencias: any[];
  ordenPor: string;
  ordenAsc: boolean;
  handleOrdenar: (tipo: "nombre" | "grado" | "asistencia") => void;
  onViewStudent: (alumno: Alumno) => void;
}) {
  if (alumnosFiltrados.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron alumnos
          </h3>
          <p className="text-gray-500 mb-6">
            Intenta ajustar los filtros de búsqueda o registra nuevos
            estudiantes
          </p>
          <button
            onClick={() => window.open("/register", "_blank")}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Registrar Alumno
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleOrdenar("nombre")}
                  className="flex items-center space-x-1 hover:text-gray-700"
                >
                  <span>Alumno</span>
                  {ordenPor === "nombre" &&
                    (ordenAsc ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    ))}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleOrdenar("grado")}
                  className="flex items-center space-x-1 hover:text-gray-700"
                >
                  <span>Grado/Sección</span>
                  {ordenPor === "grado" &&
                    (ordenAsc ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    ))}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleOrdenar("asistencia")}
                  className="flex items-center space-x-1 hover:text-gray-700"
                >
                  <span>Estado Hoy</span>
                  {ordenPor === "asistencia" &&
                    (ordenAsc ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    ))}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {alumnosFiltrados.map((alumno, index) => (
              <AlumnoRow
                key={alumno.id}
                alumno={alumno}
                asistencias={asistencias.filter(
                  (a) => a.id_alumno === alumno.id
                )}
                index={index}
                onViewStudent={onViewStudent}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Vista de cuadrícula de estudiantes
function StudentsGridView({
  alumnosFiltrados,
  asistencias,
  onViewStudent,
}: {
  alumnosFiltrados: Alumno[];
  asistencias: any[];
  onViewStudent: (alumno: Alumno) => void;
}) {
  if (alumnosFiltrados.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron alumnos
          </h3>
          <p className="text-gray-500 mb-6">
            Intenta ajustar los filtros de búsqueda o registra nuevos
            estudiantes
          </p>
          <button
            onClick={() => window.open("/register", "_blank")}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Registrar Alumno
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {alumnosFiltrados.map((alumno, index) => (
        <StudentCard
          key={alumno.id}
          alumno={alumno}
          asistencias={asistencias.filter((a) => a.id_alumno === alumno.id)}
          index={index}
          onViewStudent={onViewStudent}
        />
      ))}
    </div>
  );
}

// Tarjeta de estudiante para vista de cuadrícula
function StudentCard({
  alumno,
  asistencias,
  index,
  onViewStudent,
}: {
  alumno: Alumno;
  asistencias: any[];
  index: number;
  onViewStudent: (alumno: Alumno) => void;
}) {
  const estado = calcularEstadoAsistencia(asistencias);
  const colores = obtenerColorEstado(estado);
  const entradas = asistencias.filter((a) => a.tipo === "entrada").length;
  const salidas = asistencias.filter((a) => a.tipo === "salida").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onViewStudent(alumno)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {alumno.nombres.charAt(0)}
                {alumno.apellidos.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {normalizarNombre(alumno.nombres, alumno.apellidos)}
              </h3>
              <p className="text-xs text-gray-500 font-mono">
                DNI: {alumno.dni}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colores.bg} ${colores.text} border ${colores.border}`}
          >
            <div className={`w-1.5 h-1.5 ${colores.dot} rounded-full mr-1`} />
            {obtenerTextoEstado(estado)}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-xs text-gray-600">
            <BookOpen className="w-3 h-3 mr-1" />
            {alumno.grado}° - Sección {alumno.seccion}
          </div>

          {alumno.contacto_padres && (
            <div className="flex items-center text-xs text-gray-600">
              <Phone className="w-3 h-3 mr-1" />
              {alumno.contacto_padres}
            </div>
          )}

          <div className="flex justify-between text-xs pt-2 border-t">
            <div className="flex items-center text-green-600">
              <UserCheck className="w-3 h-3 mr-1" />
              {entradas} entradas
            </div>
            <div className="flex items-center text-blue-600">
              <UserX className="w-3 h-3 mr-1" />
              {salidas} salidas
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Componente para cada fila de alumno en la vista de lista
function AlumnoRow({
  alumno,
  asistencias,
  index,
  onViewStudent,
}: {
  alumno: Alumno;
  asistencias: any[];
  index: number;
  onViewStudent: (alumno: Alumno) => void;
}) {
  const estado = calcularEstadoAsistencia(asistencias);
  const colores = obtenerColorEstado(estado);

  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="hover:bg-gray-50 transition-colors"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {alumno.nombres.charAt(0)}
                {alumno.apellidos.charAt(0)}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {normalizarNombre(alumno.nombres, alumno.apellidos)}
            </div>
            <div className="text-sm text-gray-500 font-mono">
              DNI: {alumno.dni}
            </div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <BookOpen className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-900">
            {alumno.grado}° - {alumno.seccion}
          </span>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Phone className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-900">
            {alumno.contacto_padres || "No registrado"}
          </span>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colores.bg} ${colores.text} border ${colores.border}`}
        >
          <div className={`w-2 h-2 ${colores.dot} rounded-full mr-2`} />
          {obtenerTextoEstado(estado)}
        </span>
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewStudent(alumno);
            }}
            className="text-primary hover:text-primary-dark p-1 rounded transition-colors"
            title="Ver detalle completo"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}
