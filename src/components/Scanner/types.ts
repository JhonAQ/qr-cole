import { Alumno, Asistencia } from "@/types";

// Tipos específicos para el scanner
export interface ScannerState {
  scanning: boolean;
  loading: boolean;
  error: string | null;
  lastScannedCode: string;
  scanningDebounceActive: boolean;
}

export interface CameraInfo {
  id: string;
  label: string;
}

export interface StudentScanResult {
  student: Alumno;
  suggestedType: "entrada" | "salida";
  lastRegistration?: {
    type: "entrada" | "salida";
    time: Date;
    minutesAgo: number;
  };
}

export interface ScannerConfig {
  fps: number;
  qrbox: { width: number; height: number } | undefined; // Permitir undefined para detección en toda la pantalla
  aspectRatio: number;
  disableFlip: boolean;
  debounceMs: number;
  autoConfirmMs: number;
  preventDuplicateMs: number;
}

export interface AttendanceRegistration {
  studentId: string;
  type: "entrada" | "salida";
  timestamp: string;
}

export interface ScannerSound {
  success: () => void;
  error: () => void;
  beep: () => void;
}

export interface RecentRegistration extends Asistencia {
  alumno: Alumno;
}

// Props para componentes
export interface ScannerCameraProps {
  scanning: boolean;
  currentCameraId: string;
  cameras: CameraInfo[];
  onScanSuccess: (code: string) => Promise<void>;
  onScanError: (error: string) => void;
  onCameraSwitch: () => void;
  onStartScanning: () => Promise<void>;
  onStopScanning: () => Promise<void>;
  config: ScannerConfig;
}

export interface StudentConfirmationProps {
  scanResult: StudentScanResult | null;
  selectedType: "entrada" | "salida";
  loading: boolean;
  onTypeChange: (type: "entrada" | "salida") => void;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  autoConfirm: boolean;
  timeRemaining?: number;
}

export interface RecentRegistrationsProps {
  registrations: RecentRegistration[];
  loading: boolean;
  onRefresh: () => Promise<void>;
}

export interface ScannerConfigProps {
  config: ScannerConfig;
  onChange: (config: ScannerConfig) => void;
  visible: boolean;
  onToggle: () => void;
}

// Estados del scanner
export type ScannerMode = 'scanning' | 'confirming' | 'idle';

export interface ScannerContextType {
  state: ScannerState;
  mode: ScannerMode;
  cameras: CameraInfo[];
  currentCameraId: string;
  config: ScannerConfig;
  recentRegistrations: RecentRegistration[];
  scanResult: StudentScanResult | null;
  selectedType: "entrada" | "salida";
  // Métodos
  startScanning: () => Promise<void>;
  stopScanning: () => Promise<void>;
  switchCamera: () => Promise<void>;
  handleScan: (code: string) => Promise<void>;
  confirmRegistration: () => Promise<void>;
  cancelConfirmation: () => void;
  updateConfig: (config: ScannerConfig) => void;
  refreshRegistrations: () => Promise<void>;
}