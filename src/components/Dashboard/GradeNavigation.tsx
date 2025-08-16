"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Users,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { obtenerGradosUnicos, obtenerSeccionesPorGrado } from "@/utils/helpers";

interface GradeNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onGradeSelect: (grado: number, seccion?: string) => void;
  selectedGrade: number | null;
  selectedSection: string | null;
}

export default function GradeNavigation({
  activeTab,
  onTabChange,
  onGradeSelect,
  selectedGrade,
  selectedSection,
}: GradeNavigationProps) {
  const { alumnos } = useDashboard();
  const [expandedGrades, setExpandedGrades] = useState<number[]>([]);

  const grados = obtenerGradosUnicos(alumnos);

  const toggleGrade = (grado: number) => {
    setExpandedGrades((prev) =>
      prev.includes(grado) ? prev.filter((g) => g !== grado) : [...prev, grado]
    );
  };

  const getStudentCountByGrade = (grado: number, seccion?: string) => {
    return alumnos.filter(
      (alumno) =>
        alumno.grado === grado && (!seccion || alumno.seccion === seccion)
    ).length;
  };

  const handleGradeClick = (grado: number) => {
    toggleGrade(grado);
    onGradeSelect(grado);
    onTabChange("alumnos");
  };

  const handleSectionClick = (grado: number, seccion: string) => {
    onGradeSelect(grado, seccion);
    onTabChange("alumnos");
  };

  return (
    <div className="space-y-2">
      {/* Botón de todos los alumnos */}
      <button
        onClick={() => {
          onGradeSelect(0); // 0 significa todos los alumnos
          onTabChange("alumnos");
        }}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
          activeTab === "alumnos" && selectedGrade === 0
            ? "bg-primary text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        <Users className="w-4 h-4" />
        <span>Todos los Alumnos</span>
        <span className="ml-auto bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
          {alumnos.length}
        </span>
      </button>

      {/* Navegación por grados */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
          <GraduationCap className="w-3 h-3" />
          Por Grados
        </div>

        {grados.map((grado) => {
          const isExpanded = expandedGrades.includes(grado);
          const secciones = obtenerSeccionesPorGrado(alumnos, grado);
          const totalStudents = getStudentCountByGrade(grado);

          return (
            <div key={grado} className="space-y-1">
              {/* Botón del grado */}
              <button
                onClick={() => handleGradeClick(grado)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  activeTab === "alumnos" &&
                  selectedGrade === grado &&
                  !selectedSection
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {secciones.length > 1 ? (
                  isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )
                ) : (
                  <div className="w-4 h-4" />
                )}
                <BookOpen className="w-4 h-4" />
                <span>{grado}° Grado</span>
                <span className="ml-auto bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                  {totalStudents}
                </span>
              </button>

              {/* Secciones */}
              <AnimatePresence>
                {isExpanded && secciones.length > 1 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden ml-6 space-y-1"
                  >
                    {secciones.map((seccion) => {
                      const sectionCount = getStudentCountByGrade(
                        grado,
                        seccion
                      );
                      return (
                        <button
                          key={seccion}
                          onClick={() => handleSectionClick(grado, seccion)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            activeTab === "alumnos" &&
                            selectedGrade === grado &&
                            selectedSection === seccion
                              ? "bg-primary-medium text-white"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <div className="w-2 h-2 rounded-full bg-current opacity-60" />
                          <span>Sección {seccion}</span>
                          <span className="ml-auto bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                            {sectionCount}
                          </span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
