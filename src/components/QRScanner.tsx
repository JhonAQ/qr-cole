"use client";

import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "@/utils/supabase";
import toast from "react-hot-toast";
import { Alumno, Asistencia } from "@/types";
import {
  Camera,
  CameraOff,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

export default function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [alumno, setAlumno] = useState<Alumno | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState("");
  const [tipoRegistro, setTipoRegistro] = useState<"entrada" | "salida">(
    "entrada"
  );
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [cameras, setCameras] = useState<any[]>([]);
  const [currentCameraId, setCurrentCameraId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [lastRegistrations, setLastRegistrations] = useState<
    (Asistencia & { alumno: Alumno })[]
  >([]);

  const qrCodeRegionId = "qr-reader";

  useEffect(() => {
    // Obtener cámaras disponibles
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(devices);
          // Preferir cámara trasera en móviles
          const backCamera = devices.find(
            (device) =>
              device.label.toLowerCase().includes("back") ||
              device.label.toLowerCase().includes("rear")
          );
          setCurrentCameraId(backCamera?.id || devices[0].id);
        }
      })
      .catch((err) => {
        console.error("Error obteniendo cámaras:", err);
        toast.error("No se pudieron detectar las cámaras");
      });

    // Cargar últimos registros
    fetchLastRegistrations();

    // Cleanup al desmontar el componente
    return () => {
      if (scanner) {
        try {
          scanner.clear();
        } catch (error) {
          console.error("Error clearing scanner:", error);
        }
      }
    };
  }, []);

  const fetchLastRegistrations = async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));

      const { data, error } = await supabase
        .from("asistencias")
        .select(
          `
          *,
          alumnos (
            id,
            nombres,
            apellidos,
            grado,
            seccion
          )
        `
        )
        .gte("hora", startOfDay.toISOString())
        .order("hora", { ascending: false })
        .limit(5);

      if (error) throw error;

      setLastRegistrations(data || []);
    } catch (error) {
      console.error("Error cargando últimos registros:", error);
    }
  };

  const startScanner = async () => {
    if (!currentCameraId) {
      toast.error("No hay cámara disponible");
      return;
    }

    try {
      const html5QrCode = new Html5Qrcode(qrCodeRegionId);
      setScanner(html5QrCode);

      const qrCodeSuccessCallback = async (decodedText: string) => {
        if (decodedText !== lastScannedCode) {
          setLastScannedCode(decodedText);
          await handleQRScanned(decodedText);
        }
      };

      const config = {
        fps: 10,
        qrbox: { width: 280, height: 280 },
        aspectRatio: 1.0,
        disableFlip: false,
      };

      await html5QrCode.start(
        currentCameraId,
        config,
        qrCodeSuccessCallback,
        (errorMessage) => {
          // Silenciar errores de escaneo normales
          if (!errorMessage.includes("NotFoundException")) {
            console.log(errorMessage);
          }
        }
      );

      setScanning(true);
    } catch (err) {
      console.error("Error al iniciar la cámara:", err);
      toast.error("Error al iniciar la cámara");
    }
  };

  const stopScanner = async () => {
    if (scanner && scanning) {
      try {
        await scanner.stop();
        setScanning(false);
        setAlumno(null);
        setLastScannedCode("");
      } catch (err) {
        console.error("Error al detener el scanner:", err);
      }
    }
  };

  const switchCamera = async () => {
    if (cameras.length > 1) {
      const currentIndex = cameras.findIndex(
        (cam) => cam.id === currentCameraId
      );
      const nextIndex = (currentIndex + 1) % cameras.length;
      const nextCameraId = cameras[nextIndex].id;

      if (scanning) {
        await stopScanner();
        setCurrentCameraId(nextCameraId);
        setTimeout(startScanner, 500);
      } else {
        setCurrentCameraId(nextCameraId);
      }
    }
  };

  const handleQRScanned = async (qrCode: string) => {
    try {
      // Buscar alumno con el código QR
      const { data: alumnoData, error } = await supabase
        .from("alumnos")
        .select("*")
        .eq("codigo_qr", qrCode)
        .single();

      if (error || !alumnoData) {
        toast.error("Código QR no válido o alumno no encontrado");
        return;
      }

      setAlumno(alumnoData);

      // Determinar automáticamente entrada/salida basado en último registro
      const { data: ultimoRegistro } = await supabase
        .from("asistencias")
        .select("tipo, hora")
        .eq("id_alumno", alumnoData.id)
        .order("hora", { ascending: false })
        .limit(1);

      if (ultimoRegistro && ultimoRegistro.length > 0) {
        const ultimoTipo = ultimoRegistro[0].tipo;
        const ultimaHora = new Date(ultimoRegistro[0].hora);
        const ahora = new Date();
        const diffMinutos =
          (ahora.getTime() - ultimaHora.getTime()) / (1000 * 60);

        // Si han pasado menos de 5 minutos y es el mismo tipo, no cambiar
        if (diffMinutos < 5 && ultimoTipo === tipoRegistro) {
          toast.error(
            `Ya se registró ${ultimoTipo} hace ${Math.round(
              diffMinutos
            )} minutos`
          );
          return;
        }

        // Alternar entre entrada y salida
        setTipoRegistro(ultimoTipo === "entrada" ? "salida" : "entrada");
      } else {
        setTipoRegistro("entrada"); // Primera vez, siempre entrada
      }

      toast.success(`Alumno: ${alumnoData.nombres} ${alumnoData.apellidos}`);

      // Auto-registrar después de 2 segundos si no hay interacción
      setTimeout(() => {
        if (alumno) {
          registrarAsistencia();
        }
      }, 2000);
    } catch (error) {
      console.error("Error procesando QR:", error);
      toast.error("Error al procesar el código QR");
    }
  };

  const registrarAsistencia = async () => {
    if (!alumno) return;

    setLoading(true);
    try {
      // Obtener el usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Usuario no autenticado");
        return;
      }

      // Registrar asistencia
      const { error } = await supabase.from("asistencias").insert({
        id_alumno: alumno.id,
        tipo: tipoRegistro,
        hora: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success(
        `${
          tipoRegistro.charAt(0).toUpperCase() + tipoRegistro.slice(1)
        } registrada correctamente`
      );

      // Actualizar lista de últimos registros
      await fetchLastRegistrations();

      // Limpiar y continuar escaneando
      setAlumno(null);
      setLastScannedCode("");
    } catch (error) {
      console.error("Error registrando asistencia:", error);
      toast.error("Error al registrar asistencia");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h1 className="fc-heading text-center mb-2">Escáner QR</h1>
          <p className="text-gray-600 text-center text-sm">
            Escanea el código QR del alumno para registrar asistencia
          </p>
        </div>

        {/* Scanner Container */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div
            id={qrCodeRegionId}
            className="w-full max-w-sm mx-auto mb-4 rounded-lg overflow-hidden bg-black"
          ></div>

          {/* Control Buttons */}
          <div className="flex gap-2 justify-center mb-4">
            {!scanning ? (
              <button
                onClick={startScanner}
                className="fc-btn-primary flex items-center gap-2"
                disabled={!currentCameraId}
              >
                <Camera className="w-5 h-5" />
                Iniciar Escáner
              </button>
            ) : (
              <button
                onClick={stopScanner}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors flex items-center gap-2"
              >
                <CameraOff className="w-5 h-5" />
                Detener
              </button>
            )}

            {cameras.length > 1 && (
              <button
                onClick={switchCamera}
                className="fc-btn-secondary flex items-center gap-2"
                disabled={!scanning}
              >
                <RotateCcw className="w-5 h-5" />
                Cambiar
              </button>
            )}
          </div>

          {/* Camera Selection */}
          {cameras.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cámara:
              </label>
              <select
                value={currentCameraId}
                onChange={(e) => setCurrentCameraId(e.target.value)}
                disabled={scanning}
                className="fc-input text-sm"
              >
                {cameras.map((camera) => (
                  <option key={camera.id} value={camera.id}>
                    {camera.label || `Cámara ${camera.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Student Confirmation */}
        {alumno && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border-l-4 border-blue-500">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {alumno.nombres} {alumno.apellidos}
                </h3>
                <p className="text-sm text-gray-600">
                  Grado: {alumno.grado} - Sección: {alumno.seccion}
                </p>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de registro:
                  </label>
                  <select
                    value={tipoRegistro}
                    onChange={(e) =>
                      setTipoRegistro(e.target.value as "entrada" | "salida")
                    }
                    className="fc-input"
                    disabled={loading}
                  >
                    <option value="entrada">Entrada</option>
                    <option value="salida">Salida</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={registrarAsistencia}
                disabled={loading}
                className="fc-btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                {loading ? "Registrando..." : `Confirmar ${tipoRegistro}`}
              </button>

              <button
                onClick={() => {
                  setAlumno(null);
                  setLastScannedCode("");
                }}
                className="fc-btn-secondary"
                disabled={loading}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Last Registrations */}
        {lastRegistrations.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="fc-subheading mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Últimos registros
            </h3>
            <div className="space-y-2">
              {lastRegistrations.map((registro) => (
                <div
                  key={registro.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {registro.alumno.nombres} {registro.alumno.apellidos}
                    </p>
                    <p className="text-xs text-gray-600">
                      {registro.alumno.grado}° - {registro.alumno.seccion}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        registro.tipo === "entrada"
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {registro.tipo}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {formatTime(registro.hora)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
