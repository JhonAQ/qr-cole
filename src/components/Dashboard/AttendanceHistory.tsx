"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";

export default function AttendanceHistory() {
  const [registros, setRegistros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetchRegistros();

    // Suscripción a cambios en tiempo real
    const asistenciasSubscription = supabase
      .channel("asistencias-history-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "asistencias" },
        () => {
          fetchRegistros();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(asistenciasSubscription);
    };
  }, [fecha]);

  const fetchRegistros = async () => {
    try {
      // Convertir la fecha seleccionada a inicio y fin del día
      const fechaInicio = new Date(fecha);
      fechaInicio.setHours(0, 0, 0, 0);

      const fechaFin = new Date(fecha);
      fechaFin.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("asistencias")
        .select(
          `
          *,
          alumnos (
            id,
            nombre,
            apellidos
          )
        `
        )
        .gte("hora", fechaInicio.toISOString())
        .lte("hora", fechaFin.toISOString())
        .order("hora", { ascending: false });

      if (error) throw error;

      setRegistros(data || []);
    } catch (error) {
      console.error("Error al cargar registros:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fecha: any) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return new Date(fecha).toLocaleTimeString("es-ES", options);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Historial de Asistencias
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Total: {registros.length} registros
          </p>
        </div>

        <div>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="border-t border-gray-200">
        {loading ? (
          <div className="p-4 text-center">Cargando registros...</div>
        ) : registros.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No hay registros para esta fecha
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alumno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {registros.map((registro) => (
                <tr key={registro.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatFecha(registro.hora)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {registro.alumnos
                        ? `${registro.alumnos.apellidos}, ${registro.alumnos.nombre}`
                        : "Desconocido"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {registro.tipo === "entrada" ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Entrada
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Salida
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
