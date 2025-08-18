"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  GraduationCap,
  AlertTriangle,
  Timer,
  X,
  LogIn,
  LogOut,
} from "lucide-react";
import { StudentConfirmationProps } from "./types";

export default function StudentConfirmation({
  scanResult,
  selectedType,
  loading,
  onTypeChange,
  onConfirm,
  onCancel,
  autoConfirm = true,
  timeRemaining = 5,
}: StudentConfirmationProps) {
  const [countdown, setCountdown] = useState(timeRemaining);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (scanResult) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [scanResult]);

  useEffect(() => {
    if (!autoConfirm || loading || !scanResult) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoConfirm, loading, scanResult]);

  if (!scanResult || !isVisible) return null;

  const { student, lastRegistration } = scanResult;
  const isRecentDuplicate =
    lastRegistration &&
    lastRegistration.type === selectedType &&
    lastRegistration.minutesAgo < 5;

  const typeConfig = {
    entrada: {
      color: "green",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      buttonColor: "bg-green-500 hover:bg-green-600",
      icon: <LogIn className="w-8 h-8 text-green-600" />,
      label: "Entrada",
    },
    salida: {
      color: "orange",
      bgColor: "bg-orange-100",
      textColor: "text-orange-800",
      buttonColor: "bg-orange-500 hover:bg-orange-600",
      icon: <LogOut className="w-8 h-8 text-orange-600" />,
      label: "Salida",
    },
  };

  const currentConfig = typeConfig[selectedType];

  const handleCancel = () => {
    setIsVisible(false);
    setTimeout(() => onCancel(), 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div
        className={`bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-200 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Header del modal */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Confirmar Registro
            </h2>
            <button
              onClick={handleCancel}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Información del estudiante */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            {/* Datos del estudiante */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {student.nombres} {student.apellidos}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" />
                  <span>{student.grado}° Grado</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>Sección {student.seccion}</span>
                </div>
              </div>
            </div>

            {/* Icono del tipo de registro */}
            <div className="text-center">
              <div className="mb-2">{currentConfig.icon}</div>
              <div className={`text-xs font-medium ${currentConfig.textColor}`}>
                {currentConfig.label}
              </div>
            </div>
          </div>

          {/* Último registro si existe */}
          {lastRegistration && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Último registro:</span>
                <span className="font-medium capitalize">
                  {lastRegistration.type} hace {lastRegistration.minutesAgo} min
                </span>
                {isRecentDuplicate && (
                  <div className="flex items-center gap-1 text-orange-600 ml-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-medium">Muy reciente</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Selección del tipo de registro */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de registro:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onTypeChange("entrada")}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedType === "entrada"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-green-300"
                }`}
                disabled={loading}
              >
                <div className="flex justify-center mb-2">
                  <LogIn className="w-6 h-6" />
                </div>
                <div className="font-medium">Entrada</div>
                <div className="text-xs text-gray-500">Llegada al colegio</div>
              </button>
              <button
                onClick={() => onTypeChange("salida")}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedType === "salida"
                    ? "border-orange-500 bg-orange-50 text-orange-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-orange-300"
                }`}
                disabled={loading}
              >
                <div className="flex justify-center mb-2">
                  <LogOut className="w-6 h-6" />
                </div>
                <div className="font-medium">Salida</div>
                <div className="text-xs text-gray-500">Salida del colegio</div>
              </button>
            </div>
          </div>

          {/* Auto-confirm countdown */}
          {autoConfirm && !loading && !isRecentDuplicate && countdown > 0 && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-2 text-sm">
                <Timer className="w-4 h-4 text-blue-500" />
                <span className="text-blue-700">
                  Confirmación automática en{" "}
                  <span className="font-bold">{countdown}s</span>
                </span>
              </div>
            </div>
          )}

          {/* Mensaje de error si es duplicado */}
          {isRecentDuplicate && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">
                    Registro muy reciente
                  </p>
                  <p className="text-sm text-orange-700">
                    El estudiante ya registró {selectedType} hace{" "}
                    {lastRegistration?.minutesAgo} minutos
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="p-6 border-t border-gray-100">
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading || isRecentDuplicate}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                isRecentDuplicate
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : loading
                  ? "bg-gray-300 text-gray-600"
                  : `${currentConfig.buttonColor} text-white shadow-lg hover:shadow-xl`
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Registrando...
                </>
              ) : isRecentDuplicate ? (
                <>
                  <AlertTriangle className="w-5 h-5" />
                  No disponible
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Confirmar {selectedType}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
