"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  TrendingUp,
  Calendar,
} from "lucide-react";

export default function StatisticsWidget() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    entriesCount: 0,
    exitsCount: 0,
    attendanceRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();

    // Suscripción a cambios en tiempo real para alumnos
    const alumnosSubscription = supabase
      .channel("alumnos-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alumnos" },
        () => {
          fetchStatistics();
        }
      )
      .subscribe();

    // Suscripción a cambios en tiempo real para asistencias
    const asistenciasSubscription = supabase
      .channel("asistencias-changes-stats")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "asistencias" },
        () => {
          fetchStatistics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(alumnosSubscription);
      supabase.removeChannel(asistenciasSubscription);
    };
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      // Obtener fecha actual (inicio y fin del día)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const endOfDayStr = endOfDay.toISOString();

      // 1. Total de alumnos
      const { data: alumnosData, error: alumnosError } = await supabase
        .from("alumnos")
        .select("id", { count: "exact" });

      if (alumnosError) throw alumnosError;

      // 2. Obtener asistencias de hoy
      const { data: asistenciasHoy, error: asistenciasError } = await supabase
        .from("asistencias")
        .select(
          `
          id_alumno,
          tipo,
          hora
        `
        )
        .gte("hora", todayStr)
        .lte("hora", endOfDayStr)
        .order("hora", { ascending: false });

      if (asistenciasError) throw asistenciasError;

      // Procesar datos para obtener estadísticas
      const totalStudents = alumnosData.length || 0;

      // Calcular presentes/ausentes (último registro = entrada)
      const ultimosRegistros: any = {};
      asistenciasHoy?.forEach((registro) => {
        const alumnoId = registro.id_alumno;
        if (
          !ultimosRegistros[alumnoId] ||
          new Date(registro.hora) > new Date(ultimosRegistros[alumnoId].hora)
        ) {
          ultimosRegistros[alumnoId] = registro;
        }
      });

      const presentesToday = Object.values(ultimosRegistros).filter(
        (registro: any) => registro.tipo === "entrada"
      ).length;

      const absentToday = totalStudents - presentesToday;

      // Contar entradas y salidas
      const entriesCount =
        asistenciasHoy?.filter((registro) => registro.tipo === "entrada")
          .length || 0;
      const exitsCount =
        asistenciasHoy?.filter((registro) => registro.tipo === "salida")
          .length || 0;

      // Calcular tasa de asistencia
      const attendanceRate =
        totalStudents > 0
          ? Math.round((presentesToday / totalStudents) * 100)
          : 0;

      setStats({
        totalStudents,
        presentToday: presentesToday,
        absentToday,
        entriesCount,
        exitsCount,
        attendanceRate,
      });
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Alumnos",
      value: stats.totalStudents,
      icon: Users,
      color: "bg-blue-500",
      textColor: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Presentes Hoy",
      value: stats.presentToday,
      icon: UserCheck,
      color: "bg-green-500",
      textColor: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Ausentes Hoy",
      value: stats.absentToday,
      icon: UserX,
      color: "bg-red-500",
      textColor: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      title: "Tasa Asistencia",
      value: `${stats.attendanceRate}%`,
      icon: TrendingUp,
      color: "bg-purple-500",
      textColor: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "Entradas Hoy",
      value: stats.entriesCount,
      icon: Calendar,
      color: "bg-cyan-500",
      textColor: "text-cyan-500",
      bgColor: "bg-cyan-50",
    },
    {
      title: "Salidas Hoy",
      value: stats.exitsCount,
      icon: Clock,
      color: "bg-amber-500",
      textColor: "text-amber-500",
      bgColor: "bg-amber-50",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded-full w-8"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow p-4 border-l-4 transition-transform hover:scale-105"
          style={{ borderLeftColor: stat.color.replace("bg-", "") }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                {stat.title}
              </h3>
              <p className={`text-2xl font-bold ${stat.textColor}`}>
                {stat.value}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
