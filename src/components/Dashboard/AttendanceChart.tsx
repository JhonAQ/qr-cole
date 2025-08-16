"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Calendar, RefreshCw } from "lucide-react";

export default function AttendanceChart() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartType, setChartType] = useState("line");
  const [dateRange, setDateRange] = useState("week");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendanceData();
  }, [dateRange]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      // Calcular fecha de inicio según el rango seleccionado
      const endDate = new Date();
      let startDate = new Date();

      if (dateRange === "week") {
        startDate.setDate(endDate.getDate() - 7);
      } else if (dateRange === "month") {
        startDate.setMonth(endDate.getMonth() - 1);
      } else {
        startDate.setDate(endDate.getDate() - 30); // Default a 30 días
      }

      // Consultar asistencias en el rango de fechas
      const { data, error } = await supabase
        .from("asistencias")
        .select("hora, tipo")
        .gte("hora", startDate.toISOString())
        .lte("hora", endDate.toISOString())
        .order("hora", { ascending: true });

      if (error) throw error;

      // Procesar datos para el gráfico
      const processedData = processAttendanceData(
        data,
        startDate,
        endDate,
        dateRange
      );
      setChartData(processedData);
    } catch (error) {
      console.error("Error al cargar datos para gráficos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Procesar datos para el gráfico
  const processAttendanceData = (
    data: any[],
    startDate: Date,
    endDate: Date,
    range: string
  ) => {
    const dateFormat = new Intl.DateTimeFormat("es", {
      month: "short",
      day: "numeric",
      ...(range === "month" ? {} : { weekday: "short" }),
    });

    // Crear un mapa de fechas para el rango completo
    const datesMap: any = {};
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split("T")[0];
      datesMap[dateKey] = {
        date: dateFormat.format(currentDate),
        entradas: 0,
        salidas: 0,
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Contar entradas y salidas por día
    data?.forEach((registro) => {
      const date = new Date(registro.hora);
      const dateKey = date.toISOString().split("T")[0];

      if (datesMap[dateKey]) {
        if (registro.tipo === "entrada") {
          datesMap[dateKey].entradas += 1;
        } else if (registro.tipo === "salida") {
          datesMap[dateKey].salidas += 1;
        }
      }
    });

    // Convertir el mapa a un array para el gráfico
    return Object.values(datesMap);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 h-80 animate-pulse flex flex-col">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="flex-1 bg-gray-100 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Tendencia de Asistencias
        </h3>
        <div className="flex space-x-2">
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setDateRange("week")}
              className={`px-3 py-1 text-sm ${
                dateRange === "week"
                  ? "bg-[#00a3dc] text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setDateRange("month")}
              className={`px-3 py-1 text-sm ${
                dateRange === "month"
                  ? "bg-[#00a3dc] text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Mes
            </button>
          </div>
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setChartType("line")}
              className={`px-3 py-1 text-sm ${
                chartType === "line"
                  ? "bg-[#00a3dc] text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Línea
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`px-3 py-1 text-sm ${
                chartType === "bar"
                  ? "bg-[#00a3dc] text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              Barras
            </button>
          </div>
          <button
            onClick={fetchAttendanceData}
            className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
            title="Actualizar datos"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? (
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="entradas"
                stroke="#00a3dc"
                name="Entradas"
              />
              <Line
                type="monotone"
                dataKey="salidas"
                stroke="#ff9800"
                name="Salidas"
              />
            </LineChart>
          ) : (
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="entradas" fill="#00a3dc" name="Entradas" />
              <Bar dataKey="salidas" fill="#ff9800" name="Salidas" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
