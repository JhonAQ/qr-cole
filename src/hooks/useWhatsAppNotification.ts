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
    const now = new Date(timestamp || new Date().toISOString());
    const hora = now.toLocaleTimeString('es-PE', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    const tipoTexto = type === "entrada" ? "ingresó" : "salió";
    const tipoEmoji = type === "entrada" ? "🏫✅" : "🏠👋";
    const saludoEmoji = "👋";
    const infoEmoji = type === "entrada" ? "�" : "�";
    
    // Mensaje mejorado con formato WhatsApp y emojis
    const message = `*🎓 EDUCHECK - FE Y CIENCIA*
━━━━━━━━━━━━━━━━━━━━━━

${saludoEmoji} Hola *${student.nombres_apoderado}*,

Le comunicamos que su hijo(a) *${student.nombres} ${student.apellidos}* ${tipoTexto} ${type === "entrada" ? "al colegio" : "del colegio"} hoy a las *${hora}* ${tipoEmoji}

> *Grado:* ${student.grado}° - Sección ${student.seccion}

━━━━━━━━━━━━━━━━━━━━━━
\`\`\`Este es un mensaje automático
No es necesario responder\`\`\`

_Sistema Educheck Fe y Ciencia_ 📱`;

    // Limpiar el número de teléfono y asegurar formato internacional
    let phoneNumber = student.contacto_padres.replace(/[^\d]/g, "");
    
    // Si el número no empieza con código de país, asumir Perú (+51)
    if (phoneNumber.length === 9 && phoneNumber.startsWith("9")) {
      phoneNumber = "51" + phoneNumber;
    } else if (phoneNumber.length === 8) {
      phoneNumber = "519" + phoneNumber;
    }

    // Codificar el mensaje correctamente para URL
    const encodedMessage = encodeURIComponent(message);
    const deepLink = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;

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
