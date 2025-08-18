"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Edit3,
  Trash2,
  QrCode,
  User,
  Phone,
  GraduationCap,
  Calendar,
  Download,
  Printer,
  Save,
  AlertTriangle,
  Copy,
  CheckCircle,
} from "lucide-react";
import { Alumno, Asistencia } from "@/types";
import { supabase } from "@/utils/supabase";
import {
  formatearFechaHora,
  generarCodigoQR,
  validarDNI,
} from "@/utils/helpers";
import QRCode from "qrcode";
import toast from "react-hot-toast";

interface StudentDetailModalProps {
  alumno: Alumno;
  asistencias: Asistencia[];
  onClose: () => void;
  onUpdate: (alumno: Alumno) => void;
  onDelete: (alumnoId: string) => void;
}

export default function StudentDetailModal({
  alumno,
  asistencias,
  onClose,
  onUpdate,
  onDelete,
}: StudentDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [qrImage, setQrImage] = useState<string>("");
  const [formData, setFormData] = useState({
    nombres: alumno.nombres,
    apellidos: alumno.apellidos,
    dni: alumno.dni,
    nombres_apoderado: alumno.nombres_apoderado,
    contacto_padres: alumno.contacto_padres,
    grado: alumno.grado,
    seccion: alumno.seccion,
  });

  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    generateQRImage();
  }, [alumno.codigo_qr]);

  const generateQRImage = async () => {
    try {
      const qrDataURL = await QRCode.toDataURL(alumno.codigo_qr, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrImage(qrDataURL);
    } catch (error) {
      console.error("Error generando QR:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "grado" ? parseInt(value) : value,
    }));
  };

  const handleSave = async () => {
    if (!formData.nombres.trim() || !formData.apellidos.trim()) {
      toast.error("Nombres y apellidos son obligatorios");
      return;
    }

    if (!formData.dni.trim()) {
      toast.error("El DNI es obligatorio");
      return;
    }

    if (!validarDNI(formData.dni)) {
      toast.error("El DNI debe tener 8 dígitos");
      return;
    }

    if (!formData.nombres_apoderado.trim()) {
      toast.error("El nombre del apoderado es obligatorio");
      return;
    }

    setLoading(true);
    try {
      // Verificar que el DNI no exista en otro estudiante
      if (formData.dni !== alumno.dni) {
        const { data: existingDNI } = await supabase
          .from("alumnos")
          .select("id, nombres, apellidos")
          .eq("dni", formData.dni.trim())
          .neq("id", alumno.id);

        if (existingDNI && existingDNI.length > 0) {
          toast.error(
            `El DNI ${formData.dni} ya está registrado para otro estudiante`
          );
          return;
        }
      }

      const { data, error } = await supabase
        .from("alumnos")
        .update({
          nombres: formData.nombres.trim(),
          apellidos: formData.apellidos.trim(),
          dni: formData.dni.trim(),
          nombres_apoderado: formData.nombres_apoderado.trim(),
          contacto_padres: formData.contacto_padres.trim(),
          grado: formData.grado,
          seccion: formData.seccion,
        })
        .eq("id", alumno.id)
        .select()
        .single();

      if (error) throw error;

      onUpdate(data);
      setIsEditing(false);
      toast.success("Estudiante actualizado correctamente");
    } catch (error) {
      console.error("Error actualizando estudiante:", error);
      toast.error("Error al actualizar el estudiante");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      // Primero eliminar asistencias relacionadas
      await supabase.from("asistencias").delete().eq("id_alumno", alumno.id);

      // Luego eliminar el alumno
      const { error } = await supabase
        .from("alumnos")
        .delete()
        .eq("id", alumno.id);

      if (error) throw error;

      onDelete(alumno.id);
      toast.success("Estudiante eliminado correctamente");
      onClose();
    } catch (error) {
      console.error("Error eliminando estudiante:", error);
      toast.error("Error al eliminar el estudiante");
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrImage) return;

    const link = document.createElement("a");
    link.download = `QR_${alumno.nombres}_${alumno.apellidos}.png`;
    link.href = qrImage;
    link.click();
  };

  const printQR = () => {
    if (!qrImage) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>QR - ${alumno.nombres} ${alumno.apellidos}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 20px;
            }
            .qr-container {
              text-align: center;
              border: 2px solid #000;
              padding: 20px;
              margin: 20px;
              border-radius: 10px;
            }
            .student-info {
              margin-bottom: 15px;
            }
            .qr-code {
              margin: 15px 0;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="student-info">
              <h2>${alumno.nombres} ${alumno.apellidos}</h2>
              <p>Grado: ${alumno.grado}° - Sección: ${alumno.seccion}</p>
              <p>DNI: ${alumno.dni}</p>
              <p>Apoderado: ${alumno.nombres_apoderado}</p>
              <p>Código QR: ${alumno.codigo_qr}</p>
            </div>
            <div class="qr-code">
              <img src="${qrImage}" alt="QR Code" />
            </div>
            <p><strong>Código QR de Acceso</strong></p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const copyDNI = async () => {
    try {
      await navigator.clipboard.writeText(alumno.dni);
      toast.success("DNI copiado al portapapeles");
    } catch (error) {
      toast.error("Error al copiar el DNI");
    }
  };

  const getAttendanceStats = () => {
    const entradas = asistencias.filter((a) => a.tipo === "entrada").length;
    const salidas = asistencias.filter((a) => a.tipo === "salida").length;
    return { entradas, salidas, total: asistencias.length };
  };

  const stats = getAttendanceStats();
  const grados = Array.from({ length: 11 }, (_, i) => i + 1);
  const secciones = ["A", "B", "C", "D", "E"];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isEditing ? "Editar Estudiante" : "Detalles del Estudiante"}
                </h2>
                <p className="text-sm text-gray-500">
                  {isEditing
                    ? "Modifica la información"
                    : "Información completa"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-500 hover:text-primary transition-colors rounded-lg hover:bg-gray-100"
                    title="Editar estudiante"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100"
                    title="Eliminar estudiante"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Información del Estudiante */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Información Personal
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombres
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="nombres"
                          value={formData.nombres}
                          onChange={handleInputChange}
                          className="w-full fc-input"
                          required
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">
                          {alumno.nombres}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Apellidos
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="apellidos"
                          value={formData.apellidos}
                          onChange={handleInputChange}
                          className="w-full fc-input"
                          required
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">
                          {alumno.apellidos}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        DNI
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="dni"
                          value={formData.dni}
                          onChange={handleInputChange}
                          className="w-full fc-input"
                          maxLength={8}
                          placeholder="12345678"
                          required
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="text-gray-900 font-mono">
                            {alumno.dni}
                          </p>
                          <button
                            onClick={copyDNI}
                            className="p-1 text-gray-500 hover:text-primary transition-colors"
                            title="Copiar DNI"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Apoderado
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="nombres_apoderado"
                          value={formData.nombres_apoderado}
                          onChange={handleInputChange}
                          className="w-full fc-input"
                          placeholder="Nombres y apellidos del apoderado"
                          required
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">
                          {alumno.nombres_apoderado}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contacto de Padres
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="contacto_padres"
                          value={formData.contacto_padres}
                          onChange={handleInputChange}
                          className="w-full fc-input"
                          placeholder="Teléfono o email"
                        />
                      ) : (
                        <p className="text-gray-900">
                          {alumno.contacto_padres || "No especificado"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Información Académica */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Información Académica
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grado
                      </label>
                      {isEditing ? (
                        <select
                          name="grado"
                          value={formData.grado}
                          onChange={handleInputChange}
                          className="w-full fc-input"
                        >
                          {grados.map((g) => (
                            <option key={g} value={g}>
                              {g}°
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-gray-900 font-medium">
                          {alumno.grado}°
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sección
                      </label>
                      {isEditing ? (
                        <select
                          name="seccion"
                          value={formData.seccion}
                          onChange={handleInputChange}
                          className="w-full fc-input"
                        >
                          {secciones.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-gray-900 font-medium">
                          {alumno.seccion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Estadísticas de Asistencia */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Estadísticas de Asistencia
                  </h3>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {stats.entradas}
                      </div>
                      <div className="text-sm text-gray-500">Entradas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {stats.salidas}
                      </div>
                      <div className="text-sm text-gray-500">Salidas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {stats.total}
                      </div>
                      <div className="text-sm text-gray-500">Total</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code y Acciones */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <QrCode className="w-4 h-4" />
                    Código QR de Acceso
                  </h3>

                  <div className="text-center space-y-4">
                    {qrImage && (
                      <div className="inline-block p-4 bg-white rounded-lg shadow-inner">
                        <img
                          src={qrImage}
                          alt="QR Code"
                          className="w-48 h-48 mx-auto"
                        />
                      </div>
                    )}

                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={downloadQR}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Descargar
                      </button>
                      <button
                        onClick={printQR}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                        Imprimir
                      </button>
                    </div>
                  </div>
                </div>

                {/* Últimos Registros */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Últimos Registros
                  </h3>

                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {asistencias.slice(0, 10).map((registro, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              registro.tipo === "entrada"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          />
                          <span className="text-sm font-medium capitalize">
                            {registro.tipo}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatearFechaHora(registro.hora)}
                        </span>
                      </div>
                    ))}

                    {asistencias.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No hay registros de asistencia</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            {isEditing && (
              <div className="flex gap-3 justify-end mt-6 pt-6 border-t">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      nombres: alumno.nombres,
                      apellidos: alumno.apellidos,
                      dni: alumno.dni,
                      nombres_apoderado: alumno.nombres_apoderado,
                      contacto_padres: alumno.contacto_padres,
                      grado: alumno.grado,
                      seccion: alumno.seccion,
                    });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Guardar Cambios
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Confirmación de Eliminación */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Confirmar Eliminación
                    </h3>
                    <p className="text-sm text-gray-500">
                      Esta acción no se puede deshacer
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 mb-6">
                  ¿Estás seguro de que deseas eliminar a{" "}
                  <strong>
                    {alumno.nombres} {alumno.apellidos}
                  </strong>
                  ? Se eliminarán también todos sus registros de asistencia.
                </p>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Eliminar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
