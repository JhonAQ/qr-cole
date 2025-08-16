"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import toast from "react-hot-toast";
import { Alumno } from "@/types";
import { generarCodigoQR } from "@/utils/helpers";
import QRCode from "qrcode";
import {
  User,
  GraduationCap,
  Phone,
  QrCode,
  Save,
  X,
  Download,
  Users,
} from "lucide-react";

interface QRGeneratorProps {
  onClose?: () => void;
  onStudentCreated?: (student: Alumno) => void;
}

export default function QRGenerator({
  onClose,
  onStudentCreated,
}: QRGeneratorProps) {
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    grado: 1,
    seccion: "A",
    contacto_padres: "",
  });

  const [qrImage, setQrImage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "qr">("form");
  const [createdStudent, setCreatedStudent] = useState<Alumno | null>(null);
  const [existingStudents, setExistingStudents] = useState<Alumno[]>([]);
  const [showExisting, setShowExisting] = useState(false);

  const grados = Array.from({ length: 11 }, (_, i) => i + 1);
  const secciones = ["A", "B", "C", "D", "E"];

  useEffect(() => {
    fetchExistingStudents();
  }, []);

  const fetchExistingStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("alumnos")
        .select("*")
        .order("apellidos", { ascending: true })
        .limit(50);

      if (error) throw error;
      setExistingStudents(data || []);
    } catch (error) {
      console.error("Error cargando estudiantes:", error);
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

  const validateForm = () => {
    const { nombres, apellidos, contacto_padres } = formData;

    if (!nombres.trim()) {
      toast.error("El nombre es requerido");
      return false;
    }

    if (!apellidos.trim()) {
      toast.error("Los apellidos son requeridos");
      return false;
    }

    if (!contacto_padres.trim()) {
      toast.error("El contacto de padres es requerido");
      return false;
    }

    // Validar email o teléfono
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\s\-\+\(\)]{8,}$/;

    if (
      !emailRegex.test(contacto_padres) &&
      !phoneRegex.test(contacto_padres)
    ) {
      toast.error("Ingresa un email o teléfono válido");
      return false;
    }

    return true;
  };

  const checkDuplicates = async () => {
    try {
      const { data, error } = await supabase
        .from("alumnos")
        .select("nombres, apellidos, grado, seccion")
        .eq("nombres", formData.nombres.trim())
        .eq("apellidos", formData.apellidos.trim())
        .eq("grado", formData.grado)
        .eq("seccion", formData.seccion);

      if (error) throw error;

      if (data && data.length > 0) {
        toast.error(
          "Ya existe un alumno con estos datos en el mismo grado y sección"
        );
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error verificando duplicados:", error);
      return false;
    }
  };

  const generateQR = async () => {
    if (!validateForm()) return;

    if (await checkDuplicates()) return;

    setLoading(true);
    try {
      // Generar código QR único
      const codigoQR = generarCodigoQR(formData.nombres, formData.apellidos);

      // Verificar que el código QR sea único
      const { data: existingQR } = await supabase
        .from("alumnos")
        .select("id")
        .eq("codigo_qr", codigoQR);

      if (existingQR && existingQR.length > 0) {
        toast.error("Error generando código único. Intenta nuevamente.");
        return;
      }

      // Insertar alumno en la base de datos
      const { data: newStudent, error } = await supabase
        .from("alumnos")
        .insert({
          nombres: formData.nombres.trim(),
          apellidos: formData.apellidos.trim(),
          codigo_qr: codigoQR,
          grado: formData.grado,
          seccion: formData.seccion,
          contacto_padres: formData.contacto_padres.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      // Generar imagen QR
      const qrDataURL = await QRCode.toDataURL(codigoQR, {
        width: 256,
        margin: 2,
        color: {
          dark: "#04457D",
          light: "#FFFFFF",
        },
      });

      setQrImage(qrDataURL);
      setCreatedStudent(newStudent);
      setStep("qr");

      toast.success("Alumno registrado exitosamente");

      if (onStudentCreated) {
        onStudentCreated(newStudent);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al registrar el alumno");
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrImage || !createdStudent) return;

    const link = document.createElement("a");
    link.download = `QR_${createdStudent.nombres}_${createdStudent.apellidos}.png`;
    link.href = qrImage;
    link.click();
  };

  const printQR = () => {
    if (!qrImage || !createdStudent) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Código QR - ${createdStudent.nombres} ${createdStudent.apellidos}</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
              .qr-container { margin: 20px 0; }
              .student-info { margin: 20px 0; font-size: 18px; }
              .school-info { color: #04457D; font-weight: bold; margin-bottom: 10px; }
            </style>
          </head>
          <body>
            <div class="school-info">Colegio Fe y Ciencia</div>
            <div class="student-info">
              <strong>${createdStudent.nombres} ${createdStudent.apellidos}</strong><br>
              Grado: ${createdStudent.grado} - Sección: ${createdStudent.seccion}
            </div>
            <div class="qr-container">
              <img src="${qrImage}" alt="Código QR" />
            </div>
            <p>Código: ${createdStudent.codigo_qr}</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const resetForm = () => {
    setFormData({
      nombres: "",
      apellidos: "",
      grado: 1,
      seccion: "A",
      contacto_padres: "",
    });
    setQrImage("");
    setCreatedStudent(null);
    setStep("form");
  };

  const filteredStudents = existingStudents.filter(
    (student) =>
      student.nombres.toLowerCase().includes(formData.nombres.toLowerCase()) ||
      student.apellidos.toLowerCase().includes(formData.apellidos.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between">
            <h1 className="fc-heading flex items-center gap-2">
              <User className="w-6 h-6" />
              {step === "form" ? "Registrar Alumno" : "Código QR Generado"}
            </h1>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {step === "form" ? (
          <>
            {/* Form */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="w-4 h-4 inline mr-1" />
                    Nombres *
                  </label>
                  <input
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleInputChange}
                    className="fc-input"
                    placeholder="Nombres del alumno"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleInputChange}
                    className="fc-input"
                    placeholder="Apellidos del alumno"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <GraduationCap className="w-4 h-4 inline mr-1" />
                      Grado *
                    </label>
                    <select
                      name="grado"
                      value={formData.grado}
                      onChange={handleInputChange}
                      className="fc-input"
                    >
                      {grados.map((grado) => (
                        <option key={grado} value={grado}>
                          {grado}°
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sección *
                    </label>
                    <select
                      name="seccion"
                      value={formData.seccion}
                      onChange={handleInputChange}
                      className="fc-input"
                    >
                      {secciones.map((seccion) => (
                        <option key={seccion} value={seccion}>
                          {seccion}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Contacto Padres *
                  </label>
                  <input
                    type="text"
                    name="contacto_padres"
                    value={formData.contacto_padres}
                    onChange={handleInputChange}
                    className="fc-input"
                    placeholder="Email o teléfono"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email o número de teléfono para notificaciones
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={generateQR}
                  disabled={loading}
                  className="fc-btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {loading ? "Registrando..." : "Registrar Alumno"}
                </button>

                <button
                  onClick={() => setShowExisting(!showExisting)}
                  className="fc-btn-secondary flex items-center gap-2"
                >
                  <Users className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Existing Students Preview */}
            {showExisting && existingStudents.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="fc-subheading mb-3">Estudiantes Registrados</h3>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredStudents.slice(0, 10).map((student) => (
                    <div
                      key={student.id}
                      className="p-3 bg-gray-50 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {student.nombres} {student.apellidos}
                        </p>
                        <p className="text-xs text-gray-600">
                          {student.grado}° - {student.seccion}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {student.codigo_qr}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredStudents.length === 0 && formData.nombres && (
                  <p className="text-center text-gray-500 text-sm py-4">
                    No se encontraron estudiantes con ese nombre
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          /* QR Display */
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            {createdStudent && (
              <>
                <div className="mb-4">
                  <h3 className="fc-subheading mb-2">Alumno Registrado</h3>
                  <p className="font-semibold text-lg text-gray-900">
                    {createdStudent.nombres} {createdStudent.apellidos}
                  </p>
                  <p className="text-gray-600">
                    Grado: {createdStudent.grado}° - Sección:{" "}
                    {createdStudent.seccion}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Código: {createdStudent.codigo_qr}
                  </p>
                </div>

                <div className="mb-6 inline-block p-4 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
                  <img
                    src={qrImage}
                    alt="Código QR"
                    className="w-64 h-64 mx-auto"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <button
                      onClick={downloadQR}
                      className="fc-btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Descargar QR
                    </button>

                    <button
                      onClick={printQR}
                      className="fc-btn-secondary flex-1 flex items-center justify-center gap-2"
                    >
                      <QrCode className="w-5 h-5" />
                      Imprimir
                    </button>
                  </div>

                  <button
                    onClick={resetForm}
                    className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Registrar Otro Alumno
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
