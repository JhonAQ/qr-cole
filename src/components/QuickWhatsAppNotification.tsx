"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle, Send, X, CheckCircle } from "lucide-react";

interface QuickWhatsAppNotificationProps {
  isVisible: boolean;
  studentName: string;
  attendanceType: "entrada" | "salida";
  onSendWhatsApp: () => void;
  onDismiss: () => void;
  autoHideDelay?: number;
}

export default function QuickWhatsAppNotification({
  isVisible,
  studentName,
  attendanceType,
  onSendWhatsApp,
  onDismiss,
  autoHideDelay = 8000,
}: QuickWhatsAppNotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHideDelay]);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  const handleSend = () => {
    onSendWhatsApp();
    handleDismiss();
  };

  if (!isVisible) return null;

  const typeConfig = {
    entrada: {
      emoji: "🏫",
      action: "ingresó",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800",
      buttonColor: "bg-green-500 hover:bg-green-600",
    },
    salida: {
      emoji: "🏠",
      action: "salió",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-800",
      buttonColor: "bg-orange-500 hover:bg-orange-600",
    },
  };

  const config = typeConfig[attendanceType];

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center p-4 pointer-events-none">
      <div
        className={`w-full max-w-sm bg-white rounded-2xl shadow-lg border ${
          config.borderColor
        } transform transition-all duration-300 pointer-events-auto ${
          isAnimating
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0"
        }`}
      >
        {/* Barra de progreso */}
        <div className="h-1 bg-gray-200 rounded-t-2xl overflow-hidden">
          <div
            className="h-full bg-green-400 rounded-t-2xl whatsapp-progress"
            style={
              {
                "--duration": `${autoHideDelay}ms`,
                animation: `shrink ${autoHideDelay}ms linear forwards`,
              } as React.CSSProperties
            }
          />
        </div>

        <div className={`${config.bgColor} p-4`}>
          <div className="flex items-start gap-3">
            {/* Icono de éxito */}
            <div className="flex-shrink-0">
              <div className="bg-green-100 rounded-full p-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                ¡Registro exitoso! {config.emoji}
              </h4>
              <p className="text-xs text-gray-600 mb-3">
                <strong>{studentName}</strong> {config.action} del colegio
              </p>

              {/* Botones */}
              <div className="flex gap-2">
                <button
                  onClick={handleSend}
                  className={`flex items-center gap-1 px-3 py-2 text-white text-xs rounded-lg ${config.buttonColor} transition-colors`}
                >
                  <MessageCircle className="w-3 h-3" />
                  Notificar Apoderado
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-3 py-2 text-gray-500 text-xs hover:text-gray-700 transition-colors"
                >
                  Omitir
                </button>
              </div>
            </div>

            {/* Botón de cerrar */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
