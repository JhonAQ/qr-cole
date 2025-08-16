"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Filter,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  UserCheck,
  UserX,
  Users,
  ArrowUpDown,
  RefreshCw,
  FileText,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/utils/supabase";
import { Alumno, Asistencia } from "@/types";
import {
  formatearFecha,
  formatearHora,
  formatearFechaHora,
  obtenerFechaHoy,
  obtenerGradosUnicos,
  obtenerSeccionesUnicas,
  debounce,
} from "@/utils/helpers";

export default function AsistenciaTab() {
  const [asistencias, setAsistencias] = useState<
    (Asistencia & { alumno: Alumno })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [fechaInicio, setFechaInicio] = useState(obtenerFechaHoy());
  const [fechaFin, setFechaFin] = useState(obtenerFechaHoy());
  const [tipoFiltro, setTipoFiltro] = useState<"todos" | "entrada" | "salida">(
    "todos"
  );
  const [gradoFiltro, setGradoFiltro] = useState<number | null>(null);
  const [seccionFiltro, setSeccionFiltro] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [ordenPor, setOrdenPor] = useState<"hora" | "alumno" | "grado">("hora");
  const [ordenAsc, setOrdenAsc] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Cargar asistencias
  const cargarAsistencias = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("asistencias")
        .select(
          `
          *,
          alumno:alumnos(*)
        `
        )
        .gte("hora", `${fechaInicio}T00:00:00`)
        .lte("hora", `${fechaFin}T23:59:59`);

      if (tipoFiltro !== "todos") {
        query = query.eq("tipo", tipoFiltro);
      }

      const { data, error } = await query.order("hora", { ascending: false });

      if (error) throw error;

      let asistenciasFiltradas = data || [];

      // Filtros adicionales en el cliente
      if (busqueda) {
        const busquedaLower = busqueda.toLowerCase();
        asistenciasFiltradas = asistenciasFiltradas.filter(
          (a) =>
            a.alumno?.nombres.toLowerCase().includes(busquedaLower) ||
            a.alumno?.apellidos.toLowerCase().includes(busquedaLower) ||
            a.alumno?.codigo_qr.toLowerCase().includes(busquedaLower)
        );
      }

      if (gradoFiltro) {
        asistenciasFiltradas = asistenciasFiltradas.filter(
          (a) => a.alumno?.grado === gradoFiltro
        );
      }

      if (seccionFiltro) {
        asistenciasFiltradas = asistenciasFiltradas.filter(
          (a) => a.alumno?.seccion === seccionFiltro
        );
      }

      setAsistencias(asistenciasFiltradas);
    } catch (error) {
      console.error("Error al cargar asistencias:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAsistencias();
  }, [fechaInicio, fechaFin, tipoFiltro, gradoFiltro, seccionFiltro]);

  // Búsqueda con debounce
  const debouncedSearch = useMemo(
    () => debounce(() => cargarAsistencias(), 300),
    [fechaInicio, fechaFin, tipoFiltro, gradoFiltro, seccionFiltro]
  );

  useEffect(() => {
    if (busqueda !== "") {
      debouncedSearch();
    } else {
      cargarAsistencias();
    }
  }, [busqueda, debouncedSearch]);

  // Asistencias ordenadas
  const asistenciasOrdenadas = useMemo(() => {
    return [...asistencias].sort((a, b) => {
      let valorA, valorB;

      switch (ordenPor) {
        case "hora":
          valorA = new Date(a.hora).getTime();
          valorB = new Date(b.hora).getTime();
          break;
        case "alumno":
          valorA = `${a.alumno?.apellidos} ${a.alumno?.nombres}`;
          valorB = `${b.alumno?.apellidos} ${b.alumno?.nombres}`;
          break;
        case "grado":
          valorA = `${a.alumno?.grado}-${a.alumno?.seccion}`;
          valorB = `${b.alumno?.grado}-${b.alumno?.seccion}`;
          break;
        default:
          return 0;
      }

      if (valorA < valorB) return ordenAsc ? -1 : 1;
      if (valorA > valorB) return ordenAsc ? 1 : -1;
      return 0;
    });
  }, [asistencias, ordenPor, ordenAsc]);

  // Estadísticas del período
  const estadisticas = useMemo(() => {
    const totalRegistros = asistencias.length;
    const entradas = asistencias.filter((a) => a.tipo === "entrada").length;
    const salidas = asistencias.filter((a) => a.tipo === "salida").length;
    const alumnosUnicos = new Set(asistencias.map((a) => a.id_alumno)).size;

    return {
      totalRegistros,
      entradas,
      salidas,
      alumnosUnicos,
    };
  }, [asistencias]);

  // Obtener opciones para filtros
  const gradosDisponibles = useMemo(() => {
    const grados = new Set(
      asistencias.map((a) => a.alumno?.grado).filter(Boolean)
    );
    return Array.from(grados).sort((a, b) => a - b);
  }, [asistencias]);

  const seccionesDisponibles = useMemo(() => {
    let secciones = asistencias.map((a) => a.alumno?.seccion).filter(Boolean);
    if (gradoFiltro) {
      secciones = asistencias
        .filter((a) => a.alumno?.grado === gradoFiltro)
        .map((a) => a.alumno?.seccion)
        .filter(Boolean);
    }
    return Array.from(new Set(secciones)).sort();
  }, [asistencias, gradoFiltro]);

  const handleOrdenar = (campo: "hora" | "alumno" | "grado") => {
    if (ordenPor === campo) {
      setOrdenAsc(!ordenAsc);
    } else {
      setOrdenPor(campo);
      setOrdenAsc(true);
    }
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setGradoFiltro(null);
    setSeccionFiltro(null);
    setTipoFiltro("todos");
    setFechaInicio(obtenerFechaHoy());
    setFechaFin(obtenerFechaHoy());
  };

  const exportarDatos = () => {
    // Implementar exportación a CSV/Excel
    const csvContent = asistenciasOrdenadas
      .map(
        (a) =>
          `${formatearFechaHora(a.hora)},${a.alumno?.nombres} ${
            a.alumno?.apellidos
          },${a.alumno?.grado}°-${a.alumno?.seccion},${a.tipo}`
      )
      .join("\n");

    const blob = new Blob(
      [`Fecha y Hora,Alumno,Grado-Sección,Tipo\n${csvContent}`],
      { type: "text/csv" }
    );

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `asistencias_${fechaInicio}_${fechaFin}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-32 bg-gray-200 rounded" />
          <div className="space-y-2">
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Historial de Asistencia
          </h2>
          <p className="text-gray-600">
            {asistencias.length} registros encontrados
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => cargarAsistencias()}
            className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Actualizar
          </button>
          <button
            onClick={exportarDatos}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Total Registros
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {estadisticas.totalRegistros}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Entradas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {estadisticas.entradas}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserX className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Salidas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {estadisticas.salidas}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Alumnos Únicos
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {estadisticas.alumnosUnicos}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="space-y-4">
          {/* Controles básicos */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-4 space-y-4 lg:space-y-0">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar alumno
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Nombre, apellido o código QR..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:flex-shrink-0">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha inicio
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha fin
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={tipoFiltro}
                  onChange={(e) =>
                    setTipoFiltro(
                      e.target.value as "todos" | "entrada" | "salida"
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="todos">Todos</option>
                  <option value="entrada">Entradas</option>
                  <option value="salida">Salidas</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setMostrarFiltros(!mostrarFiltros)}
                  className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Más filtros
                  {mostrarFiltros ? (
                    <ChevronUp className="w-4 h-4 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-2" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Filtros expandidos */}
          <AnimatePresence>
            {mostrarFiltros && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grado
                  </label>
                  <select
                    value={gradoFiltro || ""}
                    onChange={(e) => {
                      setGradoFiltro(
                        e.target.value ? Number(e.target.value) : null
                      );
                      setSeccionFiltro(null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sección
                  </label>
                  <select
                    value={seccionFiltro || ""}
                    onChange={(e) => setSeccionFiltro(e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    disabled={seccionesDisponibles.length === 0}
                  >
                    <option value="">Todas las secciones</option>
                    {seccionesDisponibles.map((seccion) => (
                      <option key={seccion} value={seccion}>
                        Sección {seccion}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Acciones de filtro */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-4">
              {(busqueda ||
                gradoFiltro ||
                seccionFiltro ||
                tipoFiltro !== "todos" ||
                fechaInicio !== obtenerFechaHoy() ||
                fechaFin !== obtenerFechaHoy()) && (
                <button
                  onClick={limpiarFiltros}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Ordenar por:</span>
              <select
                value={`${ordenPor}-${ordenAsc ? "asc" : "desc"}`}
                onChange={(e) => {
                  const [campo, direccion] = e.target.value.split("-");
                  setOrdenPor(campo as "hora" | "alumno" | "grado");
                  setOrdenAsc(direccion === "asc");
                }}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="hora-desc">Más reciente</option>
                <option value="hora-asc">Más antiguo</option>
                <option value="alumno-asc">Alumno A-Z</option>
                <option value="alumno-desc">Alumno Z-A</option>
                <option value="grado-asc">Grado ↑</option>
                <option value="grado-desc">Grado ↓</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de asistencias */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {asistenciasOrdenadas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleOrdenar("hora")}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Fecha y Hora</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleOrdenar("alumno")}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Alumno</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleOrdenar("grado")}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Grado/Sección</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {asistenciasOrdenadas.map((asistencia, index) => (
                  <motion.tr
                    key={asistencia.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatearFecha(asistencia.hora)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatearHora(asistencia.hora)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {asistencia.alumno?.nombres.charAt(0)}
                              {asistencia.alumno?.apellidos.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {asistencia.alumno?.nombres}{" "}
                            {asistencia.alumno?.apellidos}
                          </div>
                          <div className="text-sm text-gray-500 font-mono">
                            {asistencia.alumno?.codigo_qr}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {asistencia.alumno?.grado}° -{" "}
                        {asistencia.alumno?.seccion}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {asistencia.tipo === "entrada" ? (
                          <>
                            <UserCheck className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-sm text-green-700 font-medium">
                              Entrada
                            </span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-4 h-4 text-blue-500 mr-2" />
                            <span className="text-sm text-blue-700 font-medium">
                              Salida
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          asistencia.tipo === "entrada"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        Registrado
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron registros
            </h3>
            <p className="text-gray-500">
              No hay asistencias registradas para los filtros seleccionados
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
