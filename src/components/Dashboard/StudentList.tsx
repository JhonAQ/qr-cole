"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  UserCheck,
  UserX,
  Download,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function StudentList() {
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [filteredAlumnos, setFilteredAlumnos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [presentesHoy, setPresentesHoy] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterGrado, setFilterGrado] = useState("all");
  const [filterSeccion, setFilterSeccion] = useState("all");
  const [grados, setGrados] = useState<any[]>([]);
  const [secciones, setSecciones] = useState<any[]>([]);

  useEffect(() => {
    fetchAlumnos();
    fetchPresentesHoy();

    // Suscripción a cambios en tiempo real
    const asistenciasSubscription = supabase
      .channel("asistencias-changes-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "asistencias" },
        () => {
          fetchPresentesHoy();
        }
      )
      .subscribe();

    const alumnosSubscription = supabase
      .channel("alumnos-changes-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alumnos" },
        () => {
          fetchAlumnos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(asistenciasSubscription);
      supabase.removeChannel(alumnosSubscription);
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [alumnos, searchTerm, filterStatus, filterGrado, filterSeccion]);

  const fetchAlumnos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("alumnos")
        .select("*")
        .order("apellidos", { ascending: true });

      if (error) throw error;

      setAlumnos(data || []);

      // Extraer grados y secciones únicos para los filtros
      const gradosUnicos = [
        ...new Set(data.map((alumno) => alumno.grado)),
      ].sort((a, b) => a - b);
      const seccionesUnicas = [
        ...new Set(data.map((alumno) => alumno.seccion)),
      ].sort();

      setGrados(gradosUnicos);
      setSecciones(seccionesUnicas);
    } catch (error) {
      console.error("Error al cargar alumnos:", error);
      toast.error("Error al cargar la lista de alumnos");
    } finally {
      setLoading(false);
    }
  };

  const fetchPresentesHoy = async () => {
    try {
      // Obtener la fecha de hoy en formato ISO
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();

      // Obtener los alumnos presentes hoy (última asistencia = entrada)
      const { data, error } = await supabase
        .from("asistencias")
        .select(
          `
          id_alumno,
          tipo,
          hora
        `
        )
        .gte("hora", todayStr)
        .order("hora", { ascending: false });

      if (error) throw error;

      // Filtrar para obtener el último registro de cada alumno
      const ultimosRegistros: any = {};
      data.forEach((registro) => {
        const alumnoId = registro.id_alumno;
        if (
          !ultimosRegistros[alumnoId] ||
          new Date(registro.hora) > new Date(ultimosRegistros[alumnoId].hora)
        ) {
          ultimosRegistros[alumnoId] = registro;
        }
      });

      // Filtrar solo aquellos cuyo último registro es "entrada"
      const presentes = Object.values(ultimosRegistros)
        .filter((registro: any) => registro.tipo === "entrada")
        .map((registro: any) => registro.id_alumno);

      setPresentesHoy(presentes);
    } catch (error) {
      console.error("Error al cargar presentes:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...alumnos];

    // Aplicar búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (alumno) =>
          alumno.nombres.toLowerCase().includes(term) ||
          alumno.apellidos.toLowerCase().includes(term) ||
          `${alumno.nombres} ${alumno.apellidos}`
            .toLowerCase()
            .includes(term) ||
          `${alumno.apellidos} ${alumno.nombres}`.toLowerCase().includes(term)
      );
    }

    // Aplicar filtro de estado
    if (filterStatus !== "all") {
      if (filterStatus === "present") {
        filtered = filtered.filter((alumno) =>
          presentesHoy.includes(alumno.id)
        );
      } else if (filterStatus === "absent") {
        filtered = filtered.filter(
          (alumno) => !presentesHoy.includes(alumno.id)
        );
      }
    }

    // Aplicar filtro de grado
    if (filterGrado !== "all") {
      filtered = filtered.filter(
        (alumno) => alumno.grado === parseInt(filterGrado)
      );
    }

    // Aplicar filtro de sección
    if (filterSeccion !== "all") {
      filtered = filtered.filter((alumno) => alumno.seccion === filterSeccion);
    }

    setFilteredAlumnos(filtered);
  };

  const exportToCSV = () => {
    // Crear datos CSV
    const headers = [
      "Nombres",
      "Apellidos",
      "Grado",
      "Sección",
      "Contacto",
      "Estado",
    ];
    const csvData = [
      headers.join(","),
      ...filteredAlumnos.map((alumno) =>
        [
          alumno.nombres,
          alumno.apellidos,
          alumno.grado,
          alumno.seccion,
          alumno.contacto_padres,
          presentesHoy.includes(alumno.id) ? "Presente" : "Ausente",
        ].join(",")
      ),
    ].join("\n");

    // Crear blob y descargar
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `alumnos_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md">
        <div className="animate-pulse p-6">
          <div className="h-7 bg-gray-200 rounded-md w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded-md w-full mb-6"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4">
                <div className="h-8 bg-gray-200 rounded-md col-span-1"></div>
                <div className="h-8 bg-gray-200 rounded-md col-span-1"></div>
                <div className="h-8 bg-gray-200 rounded-md col-span-1"></div>
                <div className="h-8 bg-gray-200 rounded-md col-span-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Lista de Alumnos
            </h2>
            <p className="text-sm text-gray-500">
              {filteredAlumnos.length} de {alumnos.length} alumnos
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar alumno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a3dc] focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-1">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a3dc] focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="present">Presentes</option>
                <option value="absent">Ausentes</option>
              </select>

              <select
                value={filterGrado}
                onChange={(e) => setFilterGrado(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a3dc] focus:border-transparent"
              >
                <option value="all">Todos los grados</option>
                {grados.map((grado) => (
                  <option key={grado} value={grado}>
                    {grado}° Grado
                  </option>
                ))}
              </select>

              <select
                value={filterSeccion}
                onChange={(e) => setFilterSeccion(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a3dc] focus:border-transparent"
              >
                <option value="all">Todas las secciones</option>
                {secciones.map((seccion) => (
                  <option key={seccion} value={seccion}>
                    Sección {seccion}
                  </option>
                ))}
              </select>

              <button
                onClick={fetchAlumnos}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Actualizar lista"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              <button
                onClick={exportToCSV}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Exportar a CSV"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Alumno
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grado/Sección
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAlumnos.length > 0 ? (
              filteredAlumnos.map((alumno) => (
                <tr key={alumno.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-[#00a3dc]/10 rounded-full flex items-center justify-center">
                        <span className="text-[#00a3dc] font-medium">
                          {alumno.nombres.charAt(0)}
                          {alumno.apellidos.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {alumno.apellidos}, {alumno.nombres}
                        </div>
                        <div className="text-sm text-gray-500">
                          {alumno.codigo_qr}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {alumno.grado}° Grado
                    </div>
                    <div className="text-sm text-gray-500">
                      Sección {alumno.seccion}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {alumno.contacto_padres || "No registrado"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {presentesHoy.includes(alumno.id) ? (
                      <div className="flex items-center">
                        <UserCheck className="w-4 h-4 text-green-500 mr-1" />
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Presente
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <UserX className="w-4 h-4 text-red-500 mr-1" />
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Ausente
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/alumnos/${alumno.id}`}
                      className="text-[#00a3dc] hover:text-[#0080af] mr-3"
                    >
                      Ver
                    </Link>
                    <Link
                      href={`/alumnos/${alumno.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No se encontraron alumnos con los filtros aplicados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {alumnos.length > 10 && (
        <div className="bg-gray-50 px-6 py-3 text-center text-sm text-gray-500">
          Mostrando {filteredAlumnos.length} de {alumnos.length} alumnos
        </div>
      )}
    </div>
  );
}
