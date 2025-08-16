"use client";

import React from "react";
import QRGenerator from "@/components/QRGenerator";
import { UserPlus } from "lucide-react";
import { Alumno } from "@/types";

interface RegistrarTabProps {
  onBackToDashboard?: () => void;
  onStudentRegistered?: (student: Alumno) => void;
}

export default function RegistrarTab({
  onBackToDashboard,
  onStudentRegistered,
}: RegistrarTabProps) {
  const handleStudentCreated = (student: Alumno) => {
    // Llamar al callback opcional
    if (onStudentRegistered) {
      onStudentRegistered(student);
    }

    // Después de 2 segundos, cambiar al tab de alumnos
    setTimeout(() => {
      if (onBackToDashboard) {
        onBackToDashboard();
      }
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Formulario de registro */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <QRGenerator onStudentCreated={handleStudentCreated} />
      </div>
    </div>
  );
}
