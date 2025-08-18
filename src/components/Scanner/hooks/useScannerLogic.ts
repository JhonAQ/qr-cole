import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { supabase } from '@/utils/supabase';
import toast from 'react-hot-toast';
import { 
  ScannerState, 
  ScannerMode, 
  CameraInfo, 
  StudentScanResult, 
  RecentRegistration,
  ScannerConfig,
  ScannerSound
} from '../types';
import { 
  DEFAULT_SCANNER_CONFIG,
  createScannerSounds,
  determineSuggestedType,
  canRegisterAttendance,
  getPreferredCamera,
  saveUserPreferences,
  loadUserPreferences,
  generateScannerId
} from '../utils';

export const useScannerLogic = () => {
  // Estados principales
  const [state, setState] = useState<ScannerState>({
    scanning: false,
    loading: false,
    error: null,
    lastScannedCode: '',
    scanningDebounceActive: false,
  });

  const [mode, setMode] = useState<ScannerMode>('idle');
  const [cameras, setCameras] = useState<CameraInfo[]>([]);
  const [currentCameraId, setCurrentCameraId] = useState<string>('');
  const [config, setConfig] = useState<ScannerConfig>(DEFAULT_SCANNER_CONFIG);
  const [recentRegistrations, setRecentRegistrations] = useState<RecentRegistration[]>([]);
  const [scanResult, setScanResult] = useState<StudentScanResult | null>(null);
  const [selectedType, setSelectedType] = useState<"entrada" | "salida">('entrada');
  
  // Estados para WhatsApp
  const [showWhatsAppNotification, setShowWhatsAppNotification] = useState(false);
  const [registeredStudent, setRegisteredStudent] = useState<StudentScanResult | null>(null);
  const [registeredType, setRegisteredType] = useState<"entrada" | "salida">('entrada');

  // Referencias
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const soundsRef = useRef<ScannerSound | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoConfirmTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scannerIdRef = useRef<string>(generateScannerId());

  // Inicialización
  useEffect(() => {
    initializeScanner();
    loadRecentRegistrations();
    
    // Crear sonidos
    soundsRef.current = createScannerSounds();
    
    // Cargar preferencias del usuario
    const preferences = loadUserPreferences();
    if (preferences.lastSelectedType) {
      setSelectedType(preferences.lastSelectedType);
    }

    // Cleanup
    return () => {
      cleanup();
    };
  }, []);

  // Inicializar cámaras
  const initializeScanner = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length) {
        const cameraInfo: CameraInfo[] = devices.map(device => ({
          id: device.id,
          label: device.label || `Cámara ${device.id.slice(-4)}`
        }));
        
        setCameras(cameraInfo);
        
        // Seleccionar cámara preferida
        const preferredId = getPreferredCamera(devices);
        setCurrentCameraId(preferredId);
      } else {
        setState(prev => ({ ...prev, error: 'No se encontraron cámaras disponibles' }));
      }
    } catch (error) {
      console.error('Error inicializando scanner:', error);
      setState(prev => ({ ...prev, error: 'Error al acceder a las cámaras' }));
      toast.error('Error al acceder a las cámaras');
    }
  };

  // Cargar registros recientes
  const loadRecentRegistrations = async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));

      const { data, error } = await supabase
        .from("asistencias")
        .select(`
          *,
          alumno:alumnos (
            id,
            nombres,
            apellidos,
            grado,
            seccion
          )
        `)
        .gte("hora", startOfDay.toISOString())
        .order("hora", { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentRegistrations(data?.filter(r => r.alumno) || []);
    } catch (error) {
      console.error('Error cargando registros:', error);
    }
  };

  // Iniciar scanning
  const startScanning = useCallback(async () => {
    if (!currentCameraId || state.scanning) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const html5QrCode = new Html5Qrcode(scannerIdRef.current);
      scannerRef.current = html5QrCode;

      const qrCodeSuccessCallback = async (decodedText: string) => {
        // EVITAR MÚLTIPLES BEEPS - SUPER ESTRICTO
        if (
          decodedText === state.lastScannedCode || 
          state.loading || 
          mode === 'confirming' ||
          scanResult // Si ya hay un resultado, NO procesar más
        ) {
          return;
        }
        
        // Marcar inmediatamente para evitar duplicados
        setState(prev => ({ ...prev, lastScannedCode: decodedText }));
        
        // PAUSAR el scanner inmediatamente para evitar múltiples detecciones
        if (scannerRef.current) {
          try {
            await scannerRef.current.pause(true);
          } catch (error) {
            // Ignorar errores de pausa
            console.log('Error pausando scanner:', error);
          }
        }
        
        await handleScan(decodedText);
      };

      const scannerConfig = {
        fps: config.fps,
        qrbox: config.qrbox, // Si es undefined, escanea toda la pantalla
        aspectRatio: config.aspectRatio,
        disableFlip: false, // Permitir voltear para mejor detección
        // Configuración ULTRA PERMISIVA para detección rápida
        rememberLastUsedCamera: true,
        supportedScanTypes: undefined, // Permitir TODOS los tipos de QR y códigos
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true // Usar detector nativo si está disponible
        },
        // Configuraciones adicionales para máxima compatibilidad
        verbose: false, // Menos logs para mejor rendimiento
        formatsToSupport: undefined, // Todos los formatos
      };

      await html5QrCode.start(
        currentCameraId,
        scannerConfig,
        qrCodeSuccessCallback,
        (errorMessage) => {
          // Silenciar errores normales de escaneo
          if (!errorMessage.includes('NotFoundException')) {
            console.log('Scanner error:', errorMessage);
          }
        }
      );

      setState(prev => ({ ...prev, scanning: true, loading: false }));
      setMode('scanning');
      
      soundsRef.current?.beep();
    } catch (error) {
      console.error('Error iniciando scanner:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Error al iniciar la cámara' 
      }));
      toast.error('Error al iniciar la cámara');
    }
  }, [currentCameraId, state.scanning, state.scanningDebounceActive, config]);

  // Detener scanning
  const stopScanning = useCallback(async () => {
    if (!scannerRef.current || !state.scanning) return;

    try {
      await scannerRef.current.stop();
      scannerRef.current.clear();
      scannerRef.current = null;
      
      setState(prev => ({ 
        ...prev, 
        scanning: false, 
        lastScannedCode: '',
        scanningDebounceActive: false 
      }));
      setMode('idle');
      setScanResult(null);
      
      // Limpiar timers
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (autoConfirmTimerRef.current) {
        clearTimeout(autoConfirmTimerRef.current);
        autoConfirmTimerRef.current = null;
      }
    } catch (error) {
      console.error('Error deteniendo scanner:', error);
    }
  }, [state.scanning]);

  // Cambiar cámara
  const switchCamera = useCallback(async () => {
    if (cameras.length <= 1) return;

    const currentIndex = cameras.findIndex(cam => cam.id === currentCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCameraId = cameras[nextIndex].id;

    if (state.scanning) {
      await stopScanning();
      setCurrentCameraId(nextCameraId);
      // Pequeña pausa antes de reiniciar
      setTimeout(() => startScanning(), 500);
    } else {
      setCurrentCameraId(nextCameraId);
    }

    // Guardar preferencia
    saveUserPreferences({ preferredCameraId: nextCameraId });
  }, [cameras, currentCameraId, state.scanning, stopScanning, startScanning]);

  // Manejar escaneo de QR
  const handleScan = useCallback(async (qrCode: string) => {
    // Si ya estamos procesando este código, salir
    if (qrCode === state.lastScannedCode || state.loading || mode === 'confirming') {
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, lastScannedCode: qrCode }));

      // Buscar estudiante
      const { data: alumnoData, error } = await supabase
        .from("alumnos")
        .select("*")
        .eq("codigo_qr", qrCode)
        .single();

      if (error || !alumnoData) {
        soundsRef.current?.error();
        toast.error("Código QR no válido o estudiante no encontrado");
        setState(prev => ({ ...prev, loading: false, lastScannedCode: '' }));
        return;
      }

      // Determinar tipo sugerido
      const result = await determineSuggestedType(alumnoData, supabase);
      setScanResult(result);
      setSelectedType(result.suggestedType);
      setMode('confirming');
      
      // Reproducir sonido de éxito UNA SOLA VEZ
      soundsRef.current?.success();
      
      // Auto-confirmar después del tiempo configurado
      if (autoConfirmTimerRef.current) {
        clearTimeout(autoConfirmTimerRef.current);
      }
      
      autoConfirmTimerRef.current = setTimeout(() => {
        confirmRegistration();
      }, config.autoConfirmMs);

      setState(prev => ({ ...prev, loading: false }));
      
    } catch (error) {
      console.error('Error procesando QR:', error);
      soundsRef.current?.error();
      toast.error('Error al procesar el código QR');
      setState(prev => ({ ...prev, loading: false, lastScannedCode: '' }));
    }
  }, [state.lastScannedCode, state.loading, mode, config.autoConfirmMs]);

  // Confirmar registro
  const confirmRegistration = useCallback(async () => {
    if (!scanResult) return;

    // Validar si se puede registrar
    const validation = canRegisterAttendance(
      scanResult.lastRegistration,
      selectedType,
      config.preventDuplicateMs
    );

    if (!validation.canRegister) {
      toast.error(validation.reason || 'No se puede registrar en este momento');
      return;
    }

    setState(prev => ({ ...prev, loading: true }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuario no autenticado");
        return;
      }

      // Registrar asistencia
      const { error } = await supabase.from("asistencias").insert({
        id_alumno: scanResult.student.id,
        tipo: selectedType,
        hora: new Date().toISOString(),
      });

      if (error) throw error;

      // Guardar preferencia del tipo seleccionado
      saveUserPreferences({ lastSelectedType: selectedType });

      toast.success(
        `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} registrada correctamente`
      );

      // Abrir WhatsApp inmediatamente - sin preguntar ni confirmar
      try {
        // Generar mensaje de WhatsApp con nuevo formato profesional
        const now = new Date();
        const hora = now.toLocaleTimeString('es-PE', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
        
        const tipoTexto = selectedType === "entrada" ? "ingresó" : "salió";
        const tipoEmoji = selectedType === "entrada" ? "🏫✅" : "🏠👋";
        const saludoEmoji = "👋";
        
        const message = `*🎓 EDUCHECK - FE Y CIENCIA*
━━━━━━━━━━━━━━━━━━━━━━

${saludoEmoji} Hola *${scanResult.student.nombres_apoderado}*,

Le comunicamos que su hijo(a) *${scanResult.student.nombres} ${scanResult.student.apellidos}* ${tipoTexto} ${selectedType === "entrada" ? "al colegio" : "del colegio"} hoy a las *${hora}* ${tipoEmoji}

> *Grado:* ${scanResult.student.grado}° - Sección ${scanResult.student.seccion}

━━━━━━━━━━━━━━━━━━━━━━
\`\`\`Este es un mensaje automático
No es necesario responder\`\`\`

_Sistema Educheck Fe y Ciencia_ 📱`;

        // Limpiar el número de teléfono y asegurar formato internacional
        let phoneNumber = scanResult.student.contacto_padres.replace(/[^\d]/g, "");
        
        // Si el número no empieza con código de país, asumir Perú (+51)
        if (phoneNumber.length === 9 && phoneNumber.startsWith("9")) {
          phoneNumber = "51" + phoneNumber;
        } else if (phoneNumber.length === 8) {
          phoneNumber = "519" + phoneNumber;
        }

        const encodedMessage = encodeURIComponent(message);
        const deepLink = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
        
        // Abrir WhatsApp inmediatamente
        window.open(deepLink, "_blank");
        
        toast.success("Abriendo WhatsApp para notificar...", {
          duration: 2000,
        });
      } catch (whatsappError) {
        console.warn('Error abriendo WhatsApp:', whatsappError);
        toast.error("Error al abrir WhatsApp");
      }

      // TODO: Implementar envío automático de WhatsApp cuando esté configurado
      // Comentado hasta que se apruebe la template
      // try {
      //   const mensaje = selectedType === "entrada"
      //     ? `Su hijo(a) ${scanResult.student.nombres} ${scanResult.student.apellidos} ha ingresado al colegio.`
      //     : `Su hijo(a) ${scanResult.student.nombres} ${scanResult.student.apellidos} ha salido del colegio.`;

      //   await fetch("/api/whatsapp", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({
      //       to: scanResult.student.contacto_padres,
      //       message: mensaje,
      //     }),
      //   });
      // } catch (whatsappError) {
      //   console.warn('Error enviando WhatsApp:', whatsappError);
      // }

      // Actualizar registros recientes
      await loadRecentRegistrations();

      // Limpiar estado y continuar escaneando
      setScanResult(null);
      setState(prev => ({ ...prev, loading: false, lastScannedCode: '' }));
      setMode('scanning'); // Mantener en modo scanning en lugar de idle

      // Limpiar timer de auto-confirm
      if (autoConfirmTimerRef.current) {
        clearTimeout(autoConfirmTimerRef.current);
        autoConfirmTimerRef.current = null;
      }

      // REACTIVAR el scanner después de confirmar
      if (scannerRef.current) {
        try {
          await scannerRef.current.resume();
        } catch (error) {
          // Si hay error reactivando, reiniciar el scanner
          console.log('Error reactivando scanner, reiniciando...', error);
          if (state.scanning) {
            await stopScanning();
            setTimeout(() => startScanning(), 500);
          }
        }
      }

    } catch (error) {
      console.error('Error registrando asistencia:', error);
      toast.error('Error al registrar asistencia');
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [scanResult, selectedType, config.preventDuplicateMs, state.scanning, stopScanning, startScanning]);

  // Cancelar confirmación
  const cancelConfirmation = useCallback(async () => {
    setScanResult(null);
    setState(prev => ({ ...prev, lastScannedCode: '' }));
    setMode('scanning'); // Mantener en modo scanning en lugar de idle
    
    // Limpiar timer de auto-confirm
    if (autoConfirmTimerRef.current) {
      clearTimeout(autoConfirmTimerRef.current);
      autoConfirmTimerRef.current = null;
    }

    // REACTIVAR el scanner después de cancelar
    if (scannerRef.current) {
      try {
        await scannerRef.current.resume();
      } catch (error) {
        // Si hay error reactivando, reiniciar el scanner
        console.log('Error reactivando scanner, reiniciando...', error);
        if (state.scanning) {
          await stopScanning();
          setTimeout(() => startScanning(), 500);
        }
      }
    }
  }, [state.scanning, stopScanning, startScanning]);

  // Actualizar configuración
  const updateConfig = useCallback((newConfig: ScannerConfig) => {
    setConfig(newConfig);
  }, []);

  // Refrescar registros
  const refreshRegistrations = useCallback(async () => {
    await loadRecentRegistrations();
  }, []);

  // Funciones para WhatsApp
  const dismissWhatsAppNotification = useCallback(() => {
    setShowWhatsAppNotification(false);
    setRegisteredStudent(null);
  }, []);

  const showWhatsAppModal = useCallback(() => {
    setShowWhatsAppNotification(false);
    return {
      student: registeredStudent?.student,
      type: registeredType,
    };
  }, [registeredStudent, registeredType]);

  // Cleanup
  const cleanup = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (autoConfirmTimerRef.current) {
      clearTimeout(autoConfirmTimerRef.current);
    }
    if (scannerRef.current && state.scanning) {
      stopScanning();
    }
  }, [state.scanning, stopScanning]);

  return {
    // Estado
    state,
    mode,
    cameras,
    currentCameraId,
    config,
    recentRegistrations,
    scanResult,
    selectedType,
    scannerId: scannerIdRef.current,
    
    // Estados de WhatsApp
    showWhatsAppNotification,
    registeredStudent,
    registeredType,
    
    // Métodos
    startScanning,
    stopScanning,
    switchCamera,
    handleScan,
    confirmRegistration,
    cancelConfirmation,
    updateConfig,
    refreshRegistrations,
    setSelectedType,
    
    // Métodos de WhatsApp
    dismissWhatsAppNotification,
    showWhatsAppModal,
    
    // Utilidades
    sounds: soundsRef.current,
  };
};