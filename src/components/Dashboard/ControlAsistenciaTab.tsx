"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import {
  Clock,
  AlertTriangle,
  Users,
  UserX,
  MessageCircle,
  Settings,
  Shield,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Filter,
  Calendar,
  Download,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Alumno, Asistencia } from "@/types";
import {
  obtenerFechaHoy,
  obtenerRangoHoy,
  formatearHora,
  obtenerGradosUnicos,
} from "@/utils/helpers";
import { useWhatsAppNotification } from "@/hooks/useWhatsAppNotification";

interface ControlAsistenciaTabProps {
  selectedGrade: number | null;
  selectedSection: string | null;
}

interface AttendanceConfig {
  horaEntrada: string;
  horaSalida: string;
  minutosGracia: number;
  alertaMinutos: number;
}

interface StudentAttendanceStatus {
  alumno: Alumno;
  hasEntrada: boolean;
  hasSalida: boolean;
  entradaHora?: string;
  salidaHora?: string;
  isLate: boolean;
  isAbsent: boolean;
  needsAlert: boolean;
}

export default function ControlAsistenciaTab({
  selectedGrade: initialGrade,
  selectedSection: initialSection,
}: ControlAsistenciaTabProps) {
  // Estados principales
  const [students, setStudents] = useState<Alumno[]>([]);
  const [attendances, setAttendances] = useState<Asistencia[]>([]);
  const [attendanceStatus, setAttendanceStatus] = useState<
    StudentAttendanceStatus[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados de navegación
  const [currentGrade, setCurrentGrade] = useState<number | null>(initialGrade);
  const [currentSection, setCurrentSection] = useState<string | null>(
    initialSection
  );
  const [availableGrades, setAvailableGrades] = useState<number[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [showGradeSelector, setShowGradeSelector] = useState(false);

  // Configuración
  const [config, setConfig] = useState<AttendanceConfig>({
    horaEntrada: "08:00",
    horaSalida: "15:15",
    minutosGracia: 20,
    alertaMinutos: 20,
  });

  // Estados de UI
  const [showConfig, setShowConfig] = useState(false);
  const [activeView, setActiveView] = useState<"teacher" | "admin">("teacher");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "absent" | "late" | "present"
  >("all");
  const [selectedDate, setSelectedDate] = useState(obtenerFechaHoy());
  const [showAbsentOnly, setShowAbsentOnly] = useState(false);

  // WhatsApp hook
  const {
    showWhatsAppModal,
    sendDirectWhatsApp,
    isModalOpen,
    messageData,
    closeModal,
    sendMessage,
    copyMessage,
  } = useWhatsAppNotification();

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, [selectedDate]);

  // Cargar grados y secciones disponibles
  useEffect(() => {
    loadAvailableGrades();
  }, [students]);

  // Actualizar estado de asistencia cuando cambien los datos
  useEffect(() => {
    calculateAttendanceStatus();
  }, [students, attendances, config]);

  // Filtrar estudiantes por grado y sección
  const filteredStudents = React.useMemo(() => {
    let filtered = attendanceStatus;

    if (activeView === "teacher" && currentGrade && currentSection) {
      filtered = filtered.filter(
        (s) =>
          s.alumno.grado === currentGrade && s.alumno.seccion === currentSection
      );
    }

    if (showAbsentOnly) {
      filtered = filtered.filter((s) => s.isAbsent || s.needsAlert);
    }

    switch (filterStatus) {
      case "absent":
        filtered = filtered.filter((s) => s.isAbsent);
        break;
      case "late":
        filtered = filtered.filter((s) => s.isLate);
        break;
      case "present":
        filtered = filtered.filter((s) => s.hasEntrada);
        break;
    }

    return filtered;
  }, [
    attendanceStatus,
    currentGrade,
    currentSection,
    activeView,
    showAbsentOnly,
    filterStatus,
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadStudents(), loadAttendances()]);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    const { data, error } = await supabase
      .from("alumnos")
      .select("*")
      .order("grado")
      .order("seccion")
      .order("apellidos");

    if (error) throw error;
    setStudents(data || []);
  };

  const loadAttendances = async () => {
    const { inicio, fin } = obtenerRangoHoy();

    const { data, error } = await supabase
      .from("asistencias")
      .select("*")
      .gte("hora", inicio)
      .lte("hora", fin);

    if (error) throw error;
    setAttendances(data || []);
  };

  const loadAvailableGrades = () => {
    const grades = [...new Set(students.map((s) => s.grado))].sort();
    setAvailableGrades(grades);

    // Si hay un grado actual, cargar sus secciones
    if (currentGrade) {
      const sections = [
        ...new Set(
          students.filter((s) => s.grado === currentGrade).map((s) => s.seccion)
        ),
      ].sort();
      setAvailableSections(sections);
    }
  };

  const handleGradeChange = (grade: number) => {
    setCurrentGrade(grade);

    // Cargar secciones disponibles para este grado
    const sections = [
      ...new Set(
        students.filter((s) => s.grado === grade).map((s) => s.seccion)
      ),
    ].sort();
    setAvailableSections(sections);

    // Seleccionar la primera sección disponible
    if (sections.length > 0) {
      setCurrentSection(sections[0]);
    } else {
      setCurrentSection(null);
    }

    setShowGradeSelector(false);
  };

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
  };

  const calculateAttendanceStatus = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const entryTime =
      parseInt(config.horaEntrada.split(":")[0]) * 60 +
      parseInt(config.horaEntrada.split(":")[1]);
    const graceTime = entryTime + config.minutosGracia;
    const alertTime = entryTime + config.alertaMinutos;

    const status: StudentAttendanceStatus[] = students.map((alumno) => {
      const studentAttendances = attendances.filter(
        (a) => a.id_alumno === alumno.id
      );
      const entrada = studentAttendances.find((a) => a.tipo === "entrada");
      const salida = studentAttendances.find((a) => a.tipo === "salida");

      const hasEntrada = !!entrada;
      const hasSalida = !!salida;

      let isLate = false;
      let isAbsent = false;
      let needsAlert = false;

      if (hasEntrada && entrada) {
        const entradaTime = new Date(entrada.hora);
        const entradaMinutes =
          entradaTime.getHours() * 60 + entradaTime.getMinutes();
        isLate = entradaMinutes > graceTime;
      } else {
        // No ha llegado
        isAbsent = currentTime > graceTime;
        needsAlert = currentTime > alertTime;
      }

      return {
        alumno,
        hasEntrada,
        hasSalida,
        entradaHora: entrada?.hora,
        salidaHora: salida?.hora,
        isLate,
        isAbsent,
        needsAlert,
      };
    });

    setAttendanceStatus(status);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success("Datos actualizados");
  };

  const sendAbsenceAlert = async (student: Alumno) => {
    try {
      const message = `🔔 ALERTA DE AUSENCIA - COLEGIO FE Y CIENCIA

👨‍🎓 Estudiante: ${student.nombres} ${student.apellidos}
📚 Grado: ${student.grado}° ${student.seccion}
⏰ Hora límite: ${config.horaEntrada} (+ ${config.minutosGracia} min de gracia)
📅 Fecha: ${new Date().toLocaleDateString("es-ES")}

Su hijo(a) no ha registrado su asistencia hasta el momento. Por favor, verificar su situación.

⚠️ Si el estudiante se encuentra en el colegio, solicitar que registre su asistencia en recepción.`;

      sendDirectWhatsApp(student, "entrada", undefined, message);
      toast.success(`Alerta enviada a ${student.nombres_apoderado}`);
    } catch (error) {
      toast.error("Error al enviar la alerta");
    }
  };

  const sendBulkAlerts = async () => {
    const absentStudents = filteredStudents.filter((s) => s.needsAlert);

    if (absentStudents.length === 0) {
      toast("No hay estudiantes que necesiten alertas", { icon: "ℹ️" });
      return;
    }

    const confirmSend = window.confirm(
      `¿Enviar alertas de ausencia a ${absentStudents.length} padres de familia?`
    );

    if (!confirmSend) return;

    let sent = 0;
    for (const student of absentStudents) {
      try {
        await sendAbsenceAlert(student.alumno);
        sent++;
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay entre mensajes
      } catch (error) {
        console.error(
          `Error sending alert for ${student.alumno.nombres}:`,
          error
        );
      }
    }

    toast.success(`${sent} alertas enviadas correctamente`);
  };

  // Estadísticas rápidas
  const stats = React.useMemo(() => {
    const total = filteredStudents.length;
    const present = filteredStudents.filter((s) => s.hasEntrada).length;
    const absent = filteredStudents.filter((s) => s.isAbsent).length;
    const late = filteredStudents.filter((s) => s.isLate).length;
    const needAlert = filteredStudents.filter((s) => s.needsAlert).length;

    return { total, present, absent, late, needAlert };
  }, [filteredStudents]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <span className="text-lg text-gray-600">
            Cargando control de asistencia...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas y controles */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Control de Asistencia
            </h2>
            <p className="text-gray-600 mt-1">
              Monitoreo en tiempo real •{" "}
              {new Date().toLocaleDateString("es-ES")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle vista profesor/directivo */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveView("teacher")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === "teacher"
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Vista Profesor
              </button>
              <button
                onClick={() => setActiveView("admin")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === "admin"
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Shield className="w-4 h-4 inline mr-2" />
                Vista Directivo
              </button>
            </div>

            {/* Navegación por grados (solo en vista profesor) */}
            {activeView === "teacher" && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowGradeSelector(!showGradeSelector)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      currentGrade
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-gray-300 bg-white hover:border-gray-400"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span className="font-medium">
                      {currentGrade ? `${currentGrade}°` : "Seleccionar Grado"}
                    </span>
                    {showGradeSelector ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {showGradeSelector && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                      <div className="p-2">
                        {availableGrades.map((grade) => (
                          <button
                            key={grade}
                            onClick={() => handleGradeChange(grade)}
                            className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                              currentGrade === grade
                                ? "bg-primary text-white"
                                : "hover:bg-gray-100"
                            }`}
                          >
                            {grade}° Grado
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Selector de sección */}
                {currentGrade && availableSections.length > 0 && (
                  <div className="flex items-center gap-1">
                    {availableSections.map((section) => (
                      <button
                        key={section}
                        onClick={() => handleSectionChange(section)}
                        className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                          currentSection === section
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {section}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Botón de configuración */}
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`p-2 rounded-lg transition-colors ${
                showConfig
                  ? "bg-primary text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Botón de refresh */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <RefreshCw
                className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">Total</span>
            </div>
            <div className="text-2xl font-bold text-blue-900 mt-1">
              {stats.total}
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-600 font-medium">
                Presentes
              </span>
            </div>
            <div className="text-2xl font-bold text-green-900 mt-1">
              {stats.present}
            </div>
          </div>

          <div className="bg-red-50 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-600 font-medium">Ausentes</span>
            </div>
            <div className="text-2xl font-bold text-red-900 mt-1">
              {stats.absent}
            </div>
          </div>

          <div className="bg-yellow-50 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-yellow-600 font-medium">
                Tardíos
              </span>
            </div>
            <div className="text-2xl font-bold text-yellow-900 mt-1">
              {stats.late}
            </div>
          </div>

          <div className="bg-orange-50 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-orange-600 font-medium">
                Alertas
              </span>
            </div>
            <div className="text-2xl font-bold text-orange-900 mt-1">
              {stats.needAlert}
            </div>
          </div>
        </div>
      </div>

      {/* Panel de configuración */}
      {showConfig && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuración de Horarios
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de Entrada
              </label>
              <input
                type="time"
                value={config.horaEntrada}
                onChange={(e) =>
                  setConfig({ ...config, horaEntrada: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de Salida
              </label>
              <input
                type="time"
                value={config.horaSalida}
                onChange={(e) =>
                  setConfig({ ...config, horaSalida: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minutos de Gracia
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={config.minutosGracia}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    minutosGracia: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alerta después de (min)
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={config.alertaMinutos}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    alertaMinutos: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Configuración actual:</strong> Entrada a las{" "}
              {config.horaEntrada}, con {config.minutosGracia} minutos de
              gracia. Las alertas se envían después de {config.alertaMinutos}{" "}
              minutos de la hora de entrada.
            </p>
          </div>
        </motion.div>
      )}

      {/* Filtros y acciones */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Filtros */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">Todos</option>
                <option value="present">Presentes</option>
                <option value="absent">Ausentes</option>
                <option value="late">Tardíos</option>
              </select>
            </div>

            <button
              onClick={() => setShowAbsentOnly(!showAbsentOnly)}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                showAbsentOnly
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {showAbsentOnly ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
              Solo ausentes
            </button>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-3">
            {stats.needAlert > 0 && (
              <button
                onClick={sendBulkAlerts}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Enviar {stats.needAlert} Alertas
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de estudiantes */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">
            Estudiantes
            {activeView === "teacher" &&
              currentGrade &&
              currentSection &&
              ` - ${currentGrade}° ${currentSection}`}
            <span className="text-gray-500 ml-2">
              ({filteredStudents.length})
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estudiante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entrada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salida
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student, index) => (
                <motion.tr
                  key={student.alumno.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`hover:bg-gray-50 ${
                    student.needsAlert ? "bg-orange-50" : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">
                        {student.alumno.nombres} {student.alumno.apellidos}
                      </div>
                      <div className="text-sm text-gray-500">
                        Apoderado: {student.alumno.nombres_apoderado}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.alumno.grado}° {student.alumno.seccion}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.hasEntrada ? (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          student.isLate
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {student.isLate ? (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            Tardío
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Presente
                          </>
                        )}
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          student.needsAlert
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {student.needsAlert ? (
                          <>
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Ausente
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3 mr-1" />
                            Sin registro
                          </>
                        )}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.entradaHora
                      ? formatearHora(student.entradaHora)
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.salidaHora
                      ? formatearHora(student.salidaHora)
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {(student.isAbsent || student.needsAlert) && (
                      <button
                        onClick={() => sendAbsenceAlert(student.alumno)}
                        className="text-orange-600 hover:text-orange-900 flex items-center gap-1"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Enviar Alerta
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <UserX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              No se encontraron estudiantes
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {activeView === "teacher"
                ? "Selecciona un grado y sección para ver los estudiantes"
                : "Ajusta los filtros para ver más resultados"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
