"use client";

import { useState } from "react";
import { Alumno, TipoAsistencia } from "@/types";
import { formatearFechaHora } from "@/utils/helpers";

interface WhatsAppMessage {
  phoneNumber: string;
  message: string;
  deepLink: string;
}

export const useWhatsAppNotification = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messageData, setMessageData] = useState<WhatsAppMessage | null>(null);

  const generateWhatsAppMessage = (
    student: Alumno,
    type: TipoAsistencia,
    timestamp?: string
  ): WhatsAppMessage => {
    const fechaHora = formatearFechaHora(timestamp || new Date().toISOString());
    const tipoTexto = type === "entrada" ? "ingresó al colegio" : "salió del colegio";
    const emoji = type === "entrada" ? "🏫📚" : "🏠👋";
    
    // Mensaje sin emojis para evitar problemas de codificación
    const message = `*Colegio Fe y Ciencia* - Notificación de Asistencia

*Estudiante:* ${student.nombres} ${student.apellidos}
*DNI:* ${student.dni}
*Grado:* ${student.grado}° - Sección ${student.seccion}
*Apoderado:* ${student.nombres_apoderado}

*${student.nombres} ${tipoTexto} el ${fechaHora}*

${type === "entrada" ? "Su hijo(a) llegó seguro al colegio." : "Su hijo(a) salió del colegio."}

Sistema Educheck Fe y Ciencia`;

    // Limpiar el número de teléfono y asegurar formato internacional
    let phoneNumber = student.contacto_padres.replace(/[^\d]/g, "");
    
    // Si el número no empieza con código de país, asumir Perú (+51)
    if (phoneNumber.length === 9 && phoneNumber.startsWith("9")) {
      phoneNumber = "51" + phoneNumber;
    } else if (phoneNumber.length === 8) {
      phoneNumber = "519" + phoneNumber;
    }

    const encodedMessage = encodeURIComponent(message);
    const deepLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    return {
      phoneNumber: student.contacto_padres,
      message,
      deepLink,
    };
  };

  const showWhatsAppModal = (
    student: Alumno,
    type: TipoAsistencia,
    timestamp?: string
  ) => {
    const messageData = generateWhatsAppMessage(student, type, timestamp);
    setMessageData(messageData);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setMessageData(null);
  };

  const sendMessage = () => {
    if (messageData) {
      window.open(messageData.deepLink, "_blank");
      // Opcional: cerrar el modal después de un breve delay
      setTimeout(() => {
        closeModal();
      }, 1000);
    }
  };

  const sendDirectWhatsApp = (
    student: Alumno,
    type: TipoAsistencia,
    timestamp?: string
  ) => {
    const messageData = generateWhatsAppMessage(student, type, timestamp);
    // Abrir WhatsApp inmediatamente
    window.open(messageData.deepLink, "_blank");
  };

  const copyMessage = async () => {
    if (messageData) {
      try {
        await navigator.clipboard.writeText(messageData.message);
        return true;
      } catch (error) {
        return false;
      }
    }
    return false;
  };

  return {
    isModalOpen,
    messageData,
    showWhatsAppModal,
    closeModal,
    sendMessage,
    sendDirectWhatsApp,
    copyMessage,
  };
};
