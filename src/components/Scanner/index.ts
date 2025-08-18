// Exportaciones principales del módulo Scanner
export { default as EnhancedQRScanner } from './EnhancedQRScanner';
export { default as ScannerCamera } from './ScannerCamera';
export { default as StudentConfirmation } from './StudentConfirmation';
export { default as RecentRegistrations } from './RecentRegistrations';

// Hook personalizado
export { useScannerLogic } from './hooks/useScannerLogic';

// Tipos y utilidades
export * from './types';
export * from './utils';