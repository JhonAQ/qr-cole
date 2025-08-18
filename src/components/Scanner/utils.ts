import { ScannerConfig, ScannerSound, StudentScanResult } from './types';
import { Alumno, Asistencia } from '@/types';

// Configuración por defecto del scanner
export const DEFAULT_SCANNER_CONFIG: ScannerConfig = {
  fps: 20, // MÁS FPS para detección más rápida
  qrbox: { width: 400, height: 400 }, // Área MÁS GRANDE
  aspectRatio: 1.0,
  disableFlip: false,
  debounceMs: 300, // MENOS tiempo de debounce
  autoConfirmMs: 3000, // Menos tiempo de auto-confirm
  preventDuplicateMs: 300000, // 5 minutos
};

// Crear sonidos del scanner
export const createScannerSounds = (): ScannerSound => {
  let lastSoundTime = 0;
  const SOUND_COOLDOWN = 500; // 500ms entre sonidos para evitar spam
  
  const createBeep = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    return () => {
      try {
        // Prevenir spam de sonidos
        const now = Date.now();
        if (now - lastSoundTime < SOUND_COOLDOWN) {
          return; // Ignorar si es muy pronto
        }
        lastSoundTime = now;
        
        // Verificar si el navegador soporta Web Audio API
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) {
          console.warn('Web Audio API not supported');
          return;
        }

        const audioContext = new AudioContext();
        
        // Para iOS, necesitamos resumir el contexto primero
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = type;
        
        // Configurar volumen más bajo para mejor experiencia
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      } catch (error) {
        console.warn('Audio not supported:', error);
      }
    };
  };

  return {
    success: createBeep(800, 0.3, 'sine'),
    error: createBeep(300, 0.5, 'square'),
    beep: createBeep(600, 0.2, 'sine'),
  };
};

// Formatear tiempo
export const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Formatear fecha completa
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short"
    }),
    time: date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  } as any;
};

// Determinar el tipo de registro sugerido
export const determineSuggestedType = async (
  student: Alumno,
  supabase: any
): Promise<StudentScanResult> => {
  try {
    // Buscar último registro del estudiante
    const { data: lastRegistration } = await supabase
      .from("asistencias")
      .select("tipo, hora")
      .eq("id_alumno", student.id)
      .order("hora", { ascending: false })
      .limit(1);

    let suggestedType: "entrada" | "salida" = "entrada";
    let lastReg = undefined;

    if (lastRegistration && lastRegistration.length > 0) {
      const lastTime = new Date(lastRegistration[0].hora);
      const now = new Date();
      const minutesAgo = Math.floor((now.getTime() - lastTime.getTime()) / (1000 * 60));

      lastReg = {
        type: lastRegistration[0].tipo,
        time: lastTime,
        minutesAgo,
      };

      // Si han pasado más de 5 minutos, alternar el tipo
      if (minutesAgo > 5) {
        suggestedType = lastRegistration[0].tipo === "entrada" ? "salida" : "entrada";
      } else {
        // Si es muy reciente, mantener el mismo tipo pero mostrar advertencia
        suggestedType = lastRegistration[0].tipo;
      }
    }

    return {
      student,
      suggestedType,
      lastRegistration: lastReg,
    };
  } catch (error) {
    console.error("Error determining suggested type:", error);
    return {
      student,
      suggestedType: "entrada",
    };
  }
};

// Validar si se puede registrar (evitar duplicados muy recientes)
export const canRegisterAttendance = (
  lastRegistration: StudentScanResult['lastRegistration'],
  selectedType: "entrada" | "salida",
  preventDuplicateMs: number
): { canRegister: boolean; reason?: string } => {
  if (!lastRegistration) {
    return { canRegister: true };
  }

  const minutesAgo = lastRegistration.minutesAgo;
  const preventDuplicateMinutes = preventDuplicateMs / (1000 * 60);

  // Si es el mismo tipo y muy reciente, no permitir
  if (lastRegistration.type === selectedType && minutesAgo < preventDuplicateMinutes) {
    return {
      canRegister: false,
      reason: `Ya se registró ${selectedType} hace ${minutesAgo} minutos`
    };
  }

  return { canRegister: true };
};

// Obtener el nombre de la cámara de forma amigable
export const getFriendlyCameraName = (camera: any, index: number): string => {
  if (!camera.label) {
    return `Cámara ${index + 1}`;
  }

  const label = camera.label.toLowerCase();
  if (label.includes('back') || label.includes('rear')) {
    return `📷 Cámara Trasera`;
  } else if (label.includes('front') || label.includes('user')) {
    return `🤳 Cámara Frontal`;
  } else {
    return `📹 ${camera.label}`;
  }
};

// Detectar si es un dispositivo móvil
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Obtener la cámara preferida (trasera en móviles)
export const getPreferredCamera = (cameras: any[]): string => {
  if (!cameras.length) return '';

  if (isMobileDevice()) {
    // En móviles, preferir cámara trasera
    const backCamera = cameras.find(camera => 
      camera.label.toLowerCase().includes('back') || 
      camera.label.toLowerCase().includes('rear')
    );
    return backCamera?.id || cameras[0].id;
  } else {
    // En escritorio, usar la primera disponible
    return cameras[0].id;
  }
};

// Guardar/cargar preferencias del usuario
export const saveUserPreferences = (preferences: {
  preferredCameraId?: string;
  lastSelectedType?: "entrada" | "salida";
  autoConfirm?: boolean;
}) => {
  try {
    localStorage.setItem('scannerPreferences', JSON.stringify(preferences));
  } catch (error) {
    console.warn('Could not save preferences:', error);
  }
};

export const loadUserPreferences = () => {
  try {
    const saved = localStorage.getItem('scannerPreferences');
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.warn('Could not load preferences:', error);
    return {};
  }
};

// Generar un ID único para el session del scanner
export const generateScannerId = (): string => {
  return `scanner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};