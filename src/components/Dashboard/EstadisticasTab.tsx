"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  Calendar,
  Clock,
  Target,
  BookOpen,
  Download,
  Filter,
  RefreshCw,
} from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { supabase } from "@/utils/supabase";
import {
  formatearFecha,
  obtenerFechaHoy,
  obtenerGradosUnicos,
  obtenerRangoFecha, // NUEVA función
} from "@/utils/helpers";
import { Alumno, Asistencia } from "@/types";

// Componente para gráfico de barras simple
function SimpleBarChart({
  data,
  title,
  color = "blue",
}: {
  data: Array<{ label: string; value: number; total?: number }>;
  title: string;
  color?: "blue" | "green" | "red" | "purple" | "yellow";
}) {
  const maxValue = Math.max(...data.map((d) => d.total || d.value));

  const colorClasses: Record<string, string> = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
    yellow: "bg-yellow-500",
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">{title}</h4>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">{item.label}</span>
              <span className="text-gray-600">
                {item.total ? `${item.value}/${item.total}` : item.value}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${colorClasses[color]} transition-all duration-500`}
                style={{
                  width: `${
                    maxValue > 0
                      ? ((item.total || item.value) / maxValue) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente para métricas clave
function MetricCard({
  title,
  value,
  trend,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  trend?: { value: number; isUp: boolean };
  icon: React.ElementType;
  color: "blue" | "green" | "red" | "purple" | "yellow";
}) {
  const colorClasses: Record<
    string,
    { bg: string; icon: string; text: string }
  > = {
    blue: { bg: "bg-blue-50", icon: "text-blue-600", text: "text-blue-600" },
    green: {
      bg: "bg-green-50",
      icon: "text-green-600",
      text: "text-green-600",
    },
    red: { bg: "bg-red-50", icon: "text-red-600", text: "text-red-600" },
    purple: {
      bg: "bg-purple-50",
      icon: "text-purple-600",
      text: "text-purple-600",
    },
    yellow: {
      bg: "bg-yellow-50",
      icon: "text-yellow-600",
      text: "text-yellow-600",
    },
  };

  const colors = colorClasses[color];

  return (
    <div className={`${colors.bg} rounded-lg p-6 border border-gray-200`}>
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg ${colors.bg}`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{title}</p>
          {trend && (
            <p
              className={`text-xs mt-1 ${
                trend.isUp ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.isUp ? "↗" : "↘"} {trend.value}%
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EstadisticasTab() {
  const {
    alumnos,
    asistencias: asistenciasHoy,
    estadisticas: estadisticasGenerales,
  } = useDashboard();

  // CORREGIDO: Inicialización de fechas usando la función corregida
  const [fechaInicio, setFechaInicio] = useState(() => {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const year = inicioMes.getFullYear();
    const month = String(inicioMes.getMonth() + 1).padStart(2, "0");
    const day = String(inicioMes.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

  const [fechaFin, setFechaFin] = useState(obtenerFechaHoy());
  const [asistenciasRango, setAsistenciasRango] = useState<
    (Asistencia & { alumno: Alumno })[]
  >([]);
  const [loading, setLoading] = useState(false);

  // CORREGIDO: Función para cargar asistencias del rango seleccionado
  const cargarAsistenciasRango = async () => {
    setLoading(true);
    try {
      // Usar obtenerRangoFecha para fechaInicio y fechaFin
      const rangoInicio = obtenerRangoFecha(fechaInicio);
      const rangoFin = obtenerRangoFecha(fechaFin);

      console.log(
        "Cargando estadísticas del",
        rangoInicio.inicio,
        "al",
        rangoFin.fin
      ); // Para debug

      const { data, error } = await supabase
        .from("asistencias")
        .select(
          `
          *,
          alumno:alumnos(*)
        `
        )
        .gte("hora", rangoInicio.inicio)
        .lte("hora", rangoFin.fin)
        .order("hora", { ascending: false });

      if (error) throw error;
      setAsistenciasRango(data || []);
    } catch (error) {
      console.error("Error al cargar asistencias:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAsistenciasRango();
  }, [fechaInicio, fechaFin]);

  // Estadísticas del rango seleccionado
  const estadisticasRango = useMemo(() => {
    const totalRegistros = asistenciasRango.length;
    const entradas = asistenciasRango.filter(
      (a) => a.tipo === "entrada"
    ).length;
    const salidas = asistenciasRango.filter((a) => a.tipo === "salida").length;
    const alumnosConAsistencia = new Set(
      asistenciasRango.map((a) => a.id_alumno)
    ).size;
    const porcentajeAsistencia =
      alumnos.length > 0
        ? Math.round((alumnosConAsistencia / alumnos.length) * 100)
        : 0;

    return {
      totalRegistros,
      entradas,
      salidas,
      alumnosConAsistencia,
      porcentajeAsistencia,
      alumnosSinAsistencia: alumnos.length - alumnosConAsistencia,
    };
  }, [asistenciasRango, alumnos]);

  // Estadísticas por grado
  const estadisticasPorGrado = useMemo(() => {
    const gradosUnicos = obtenerGradosUnicos(alumnos);

    return gradosUnicos
      .map((grado) => {
        const alumnosDelGrado = alumnos.filter((a) => a.grado === grado);
        const asistenciasDelGrado = asistenciasRango.filter(
          (a) => a.alumno?.grado === grado
        );
        const alumnosConAsistencia = new Set(
          asistenciasDelGrado.map((a) => a.id_alumno)
        ).size;

        return {
          label: `${grado}° Grado`,
          value: alumnosConAsistencia,
          total: alumnosDelGrado.length,
          porcentaje:
            alumnosDelGrado.length > 0
              ? Math.round(
                  (alumnosConAsistencia / alumnosDelGrado.length) * 100
                )
              : 0,
        };
      })
      .sort((a, b) => parseInt(a.label) - parseInt(b.label));
  }, [alumnos, asistenciasRango]);

  // CORREGIDO: Estadísticas por día (últimos 7 días)
  const estadisticasPorDia = useMemo(() => {
    const dias = [];
    const hoy = new Date();

    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() - i);

      // CORREGIDO: Crear fecha string de forma consistente
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, "0");
      const day = String(fecha.getDate()).padStart(2, "0");
      const fechaStr = `${year}-${month}-${day}`;

      const asistenciasDia = asistenciasRango.filter((a) => {
        const asistenciaFecha = new Date(a.hora);
        const asistenciaYear = asistenciaFecha.getFullYear();
        const asistenciaMonth = String(asistenciaFecha.getMonth() + 1).padStart(
          2,
          "0"
        );
        const asistenciaDay = String(asistenciaFecha.getDate()).padStart(
          2,
          "0"
        );
        const asistenciaFechaStr = `${asistenciaYear}-${asistenciaMonth}-${asistenciaDay}`;

        return asistenciaFechaStr === fechaStr;
      });

      const alumnosUnicos = new Set(asistenciasDia.map((a) => a.id_alumno))
        .size;

      dias.push({
        label: fecha.toLocaleDateString("es-ES", {
          weekday: "short",
          day: "numeric",
        }),
        value: alumnosUnicos,
        total: alumnos.length,
      });
    }

    return dias;
  }, [asistenciasRango, alumnos]);

  // Horarios pico
  const horariosPico = useMemo(() => {
    const horasPorHora: Record<number, number> = {};

    asistenciasRango.forEach((asistencia) => {
      const hora = new Date(asistencia.hora).getHours();
      horasPorHora[hora] = (horasPorHora[hora] || 0) + 1;
    });

    return Object.entries(horasPorHora)
      .map(([hora, cantidad]) => ({
        label: `${hora}:00`,
        value: cantidad as number,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [asistenciasRango]);

  // Top alumnos más puntuales
  const alumnosPuntuales = useMemo(() => {
    const asistenciasPorAlumno: Record<
      string,
      { alumno: Alumno; entradas: number; salidas: number }
    > = {};

    asistenciasRango.forEach((asistencia) => {
      if (!asistenciasPorAlumno[asistencia.id_alumno]) {
        asistenciasPorAlumno[asistencia.id_alumno] = {
          alumno: asistencia.alumno!,
          entradas: 0,
          salidas: 0,
        };
      }

      if (asistencia.tipo === "entrada") {
        asistenciasPorAlumno[asistencia.id_alumno].entradas++;
      } else {
        asistenciasPorAlumno[asistencia.id_alumno].salidas++;
      }
    });

    return Object.values(asistenciasPorAlumno)
      .map((data) => ({
        label: `${data.alumno?.nombres} ${data.alumno?.apellidos}`,
        value: data.entradas + data.salidas,
        grado: `${data.alumno?.grado}°-${data.alumno?.seccion}`,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [asistenciasRango]);

  const exportarReporte = () => {
    const datos = {
      periodo: `${formatearFecha(fechaInicio)} - ${formatearFecha(fechaFin)}`,
      estadisticasGenerales: estadisticasRango,
      estadisticasPorGrado,
      horariosPico,
      alumnosPuntuales,
    };

    const jsonContent = JSON.stringify(datos, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte_asistencia_${fechaInicio}_${fechaFin}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Estadísticas de Asistencia
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Análisis detallado de asistencia del {formatearFecha(fechaInicio)}{" "}
              al {formatearFecha(fechaFin)}
            </p>
          </div>

          {/* Botones - solo en desktop inicialmente */}
          <div className="hidden sm:flex items-center space-x-3">
            <button
              onClick={cargarAsistenciasRango}
              disabled={loading}
              className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Actualizar
            </button>
            <button
              onClick={exportarReporte}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>

        {/* Botones móviles */}
        <div className="flex sm:hidden flex-col gap-2">
          <button
            onClick={cargarAsistenciasRango}
            disabled={loading}
            className="flex items-center justify-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Actualizar
          </button>
          <button
            onClick={exportarReporte}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Filtros de fecha */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">
              Período de análisis:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha inicial
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha final
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFechaInicio(obtenerFechaHoy());
                  setFechaFin(obtenerFechaHoy());
                }}
                className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Solo Hoy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Registros"
          value={estadisticasRango.totalRegistros}
          icon={BarChart3}
          color="blue"
        />
        <MetricCard
          title="Alumnos con Asistencia"
          value={`${estadisticasRango.alumnosConAsistencia}/${alumnos.length}`}
          trend={{
            value: estadisticasRango.porcentajeAsistencia,
            isUp: estadisticasRango.porcentajeAsistencia >= 80,
          }}
          icon={Users}
          color="green"
        />
        <MetricCard
          title="% Asistencia"
          value={`${estadisticasRango.porcentajeAsistencia}%`}
          icon={Target}
          color={estadisticasRango.porcentajeAsistencia >= 80 ? "green" : "red"}
        />
        <MetricCard
          title="Entradas/Salidas"
          value={`${estadisticasRango.entradas}/${estadisticasRango.salidas}`}
          icon={Clock}
          color="purple"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart
          data={estadisticasPorGrado}
          title="Asistencia por Grado"
          color="blue"
        />

        <SimpleBarChart
          data={estadisticasPorDia}
          title="Tendencia Semanal"
          color="green"
        />

        <SimpleBarChart
          data={horariosPico}
          title="Horarios con Más Actividad"
          color="purple"
        />

        <SimpleBarChart
          data={alumnosPuntuales}
          title="Alumnos Más Puntuales"
          color="yellow"
        />
      </div>

      {/* Resumen detallado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Resumen del Período
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Días analizados:</span>
              <span className="font-medium">
                {Math.ceil(
                  (new Date(fechaFin).getTime() -
                    new Date(fechaInicio).getTime()) /
                    (1000 * 60 * 60 * 24)
                ) + 1}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Promedio diario:</span>
              <span className="font-medium">
                {Math.round(
                  estadisticasRango.totalRegistros /
                    Math.max(
                      1,
                      Math.ceil(
                        (new Date(fechaFin).getTime() -
                          new Date(fechaInicio).getTime()) /
                          (1000 * 60 * 60 * 24)
                      ) + 1
                    )
                )}{" "}
                registros
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estudiantes activos:</span>
              <span className="font-medium">
                {estadisticasRango.alumnosConAsistencia} de {alumnos.length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Análisis por Tipo
          </h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Entradas</span>
                <span className="font-medium">
                  {estadisticasRango.entradas}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${
                      (estadisticasRango.entradas /
                        Math.max(1, estadisticasRango.totalRegistros)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Salidas</span>
                <span className="font-medium">{estadisticasRango.salidas}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${
                      (estadisticasRango.salidas /
                        Math.max(1, estadisticasRango.totalRegistros)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recomendaciones */}
      {estadisticasRango.porcentajeAsistencia < 80 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-6"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <BookOpen className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <h4 className="text-lg font-medium text-yellow-800 mb-2">
                Recomendaciones para Mejorar la Asistencia
              </h4>
              <ul className="text-yellow-700 space-y-1 text-sm">
                <li>• Implementar recordatorios automáticos para padres</li>
                <li>• Revisar horarios y políticas de asistencia</li>
                <li>• Identificar patrones en los datos de ausencias</li>
                <li>• Considerar incentivos para mejorar la puntualidad</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
