"use client";

import React from "react";
import {
  MessageCircle,
  Copy,
  X,
  Send,
  Phone,
  User,
  Clock,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface WhatsAppModalProps {
  isOpen: boolean;
  messageData: {
    phoneNumber: string;
    message: string;
    deepLink: string;
  } | null;
  studentName: string;
  attendanceType: "entrada" | "salida";
  onClose: () => void;
  onSend: () => void;
  onCopy: () => Promise<boolean>;
}

export default function WhatsAppModal({
  isOpen,
  messageData,
  studentName,
  attendanceType,
  onClose,
  onSend,
  onCopy,
}: WhatsAppModalProps) {
  if (!isOpen || !messageData) return null;

  const handleCopy = async () => {
    const success = await onCopy();
    if (success) {
      toast.success("Mensaje copiado al portapapeles");
    } else {
      toast.error("Error al copiar el mensaje");
    }
  };

  const handleSend = () => {
    onSend();
    toast.success("Abriendo WhatsApp...");
  };

  const typeConfig = {
    entrada: {
      color: "green",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      emoji: "🏫",
      title: "Notificar Entrada",
      action: "ingresó al colegio",
    },
    salida: {
      color: "orange",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-800",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      emoji: "🏠",
      title: "Notificar Salida",
      action: "salió del colegio",
    },
  };

  const config = typeConfig[attendanceType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`${config.bgColor} ${config.borderColor} border-b p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`${config.iconBg} p-2 rounded-xl`}>
                <MessageCircle className={`w-6 h-6 ${config.iconColor}`} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {config.title} {config.emoji}
                </h2>
                <p className="text-sm text-gray-600">
                  Enviar notificación por WhatsApp
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Información del estudiante */}
        <div className="p-6 border-b border-gray-100">
          <div className={`${config.bgColor} rounded-xl p-4`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`${config.iconBg} p-2 rounded-lg`}>
                <User className={`w-4 h-4 ${config.iconColor}`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{studentName}</h3>
                <p className={`text-sm ${config.textColor} font-medium`}>
                  {config.action}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>Contacto: {messageData.phoneNumber}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <Clock className="w-4 h-4" />
              <span>Ahora mismo</span>
            </div>
          </div>
        </div>

        {/* Vista previa del mensaje */}
        <div className="p-6">
          <h4 className="font-semibold text-gray-900 mb-3">
            Vista previa del mensaje:
          </h4>
          <div className="bg-gray-50 rounded-xl p-4 max-h-48 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
              {messageData.message}
            </pre>
          </div>
        </div>

        {/* Acciones */}
        <div className="p-6 border-t border-gray-100">
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copiar
            </button>
            <button
              onClick={handleSend}
              className="flex-2 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
              style={{ minWidth: "60%" }}
            >
              <Send className="w-4 h-4" />
              Enviar por WhatsApp
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              💡 El mensaje se abrirá en WhatsApp listo para enviar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
