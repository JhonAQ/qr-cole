"use client";

import React, { useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useScannerLogic } from "./hooks/useScannerLogic";
import ScannerCamera from "./ScannerCamera";
import StudentConfirmation from "./StudentConfirmation";
import RecentRegistrations from "./RecentRegistrations";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";

export default function EnhancedQRScanner() {
  const {
    state,
    mode,
    cameras,
    currentCameraId,
    config,
    recentRegistrations,
    scanResult,
    selectedType,
    scannerId,
    // Métodos
    startScanning,
    stopScanning,
    switchCamera,
    confirmRegistration,
    cancelConfirmation,
    refreshRegistrations,
    setSelectedType,
  } = useScannerLogic();

  const [isOnline, setIsOnline] = React.useState(true);

  // Monitor de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Configurar el ID del scanner con Html5Qrcode
  useEffect(() => {
    // Crear el elemento del scanner si no existe
    const scannerElement = document.getElementById(scannerId);
    if (!scannerElement) {
      const container = document.getElementById("scanner-camera");
      if (container) {
        const scannerDiv = document.createElement("div");
        scannerDiv.id = scannerId;
        scannerDiv.className = "w-full h-full";
        container.appendChild(scannerDiv);
      }
    }
  }, [scannerId]);

  // Mensaje de error si hay problemas
  if (state.error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="font-medium text-red-900 mb-2">Error del Escáner</h3>
          <p className="text-sm text-red-700 mb-4">{state.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-xl transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Indicador de conexión */}
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-yellow-600" />
          <div className="flex-1">
            <p className="text-yellow-800 font-medium">
              Sin conexión a internet
            </p>
            <p className="text-yellow-700 text-sm">
              Los registros se guardarán cuando se restablezca la conexión
            </p>
          </div>
        </div>
      )}

      {/* Layout responsive: mobile first, desktop con columnas */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start space-y-6 lg:space-y-0">
        
        {/* Columna izquierda: Cámara del scanner */}
        <div className="lg:sticky lg:top-4">
          <ScannerCamera
            scanning={state.scanning}
            currentCameraId={currentCameraId}
            cameras={cameras}
            onCameraSwitch={switchCamera}
            onStartScanning={startScanning}
            onStopScanning={stopScanning}
          />
        </div>

        {/* Columna derecha: Registros recientes */}
        <div className="space-y-6">
          <RecentRegistrations
            registrations={recentRegistrations}
            loading={false}
            onRefresh={refreshRegistrations}
          />
          
          {/* Indicador de conexión online */}
          {isOnline && (
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-full px-3 py-1">
                <Wifi className="w-4 h-4" />
                <span className="text-sm font-medium">En línea</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Modal de confirmación del estudiante - fuera del grid para que funcione correctamente */}
      <StudentConfirmation
        scanResult={scanResult}
        selectedType={selectedType}
        loading={state.loading}
        onTypeChange={setSelectedType}
        onConfirm={confirmRegistration}
        onCancel={cancelConfirmation}
        autoConfirm={true}
        timeRemaining={config.autoConfirmMs / 1000}
      />
    </div>
  );
}
