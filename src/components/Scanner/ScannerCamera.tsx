"use client";

import React from "react";
import { Camera, CameraOff, RotateCcw, Settings, Zap } from "lucide-react";
import { ScannerCameraProps } from "./types";
import { getFriendlyCameraName } from "./utils";

export default function ScannerCamera({
  scanning,
  currentCameraId,
  cameras,
  onCameraSwitch,
  onStartScanning,
  onStopScanning,
}: Omit<ScannerCameraProps, "onScanSuccess" | "onScanError" | "config">) {
  return (
    <div className="space-y-4">
      {/* Contenedor de la cámara */}
      <div className="relative">
        <div
          id="scanner-camera"
          className="w-full aspect-square rounded-2xl overflow-hidden bg-black relative"
          style={{ maxWidth: "100%", minHeight: "280px" }}
        >
          {/* Overlay con esquinas de escaneo */}
          {scanning && (
            <div className="absolute inset-0 z-10 pointer-events-none">
              {/* Esquinas del scanner con animación */}
              <div className="absolute top-8 left-8 w-8 h-8 border-l-4 border-t-4 border-white rounded-tl-lg animate-scanner-corners"></div>
              <div className="absolute top-8 right-8 w-8 h-8 border-r-4 border-t-4 border-white rounded-tr-lg animate-scanner-corners"></div>
              <div className="absolute bottom-8 left-8 w-8 h-8 border-l-4 border-b-4 border-white rounded-bl-lg animate-scanner-corners"></div>
              <div className="absolute bottom-8 right-8 w-8 h-8 border-r-4 border-b-4 border-white rounded-br-lg animate-scanner-corners"></div>

              {/* Línea de escaneo animada */}
              <div className="absolute inset-x-8 top-1/2 h-0.5 bg-white/60 animate-scan-line"></div>

              {/* Instrucción */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-black/60 backdrop-blur-sm rounded-full px-4 py-2">
                  <p className="text-white text-sm font-medium">
                    📱 Acerca el código QR
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Estado cuando no está escaneando */}
          {!scanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-sm">Cámara desactivada</p>
                <p className="text-gray-500 text-xs mt-1">
                  Toca iniciar para escanear
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Indicador de estado */}
        {scanning && (
          <div className="absolute top-4 left-4 bg-green-500 rounded-full p-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          </div>
        )}
      </div>

      {/* Controles principales */}
      <div className="flex items-center justify-center gap-4">
        {/* Botón principal */}
        {!scanning ? (
          <button
            onClick={onStartScanning}
            className="bg-primary hover:bg-primary-dark text-white font-semibold py-4 px-8 rounded-2xl shadow-lg transition-all duration-200 flex items-center gap-3 text-lg"
            disabled={!currentCameraId}
          >
            <Camera className="w-6 h-6" />
            Iniciar Escáner
          </button>
        ) : (
          <button
            onClick={onStopScanning}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg transition-all duration-200 flex items-center gap-3 text-lg"
          >
            <CameraOff className="w-6 h-6" />
            Detener
          </button>
        )}

        {/* Cambiar cámara */}
        {cameras.length > 1 && (
          <button
            onClick={onCameraSwitch}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-4 px-4 rounded-2xl shadow transition-all duration-200"
            disabled={!scanning}
            title="Cambiar cámara"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Información de la cámara actual */}
      {cameras.length > 0 && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 text-sm text-gray-600">
            <Zap className="w-4 h-4" />
            <span>
              {getFriendlyCameraName(
                cameras.find((c) => c.id === currentCameraId),
                cameras.findIndex((c) => c.id === currentCameraId)
              )}
            </span>
            {cameras.length > 1 && (
              <span className="text-xs text-gray-400">
                ({cameras.findIndex((c) => c.id === currentCameraId) + 1}/
                {cameras.length})
              </span>
            )}
          </div>
        </div>
      )}

      {/* Consejos para el uso */}
      <div className="bg-blue-50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 rounded-full p-2 mt-0.5">
            <Settings className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">
              Consejos para un mejor escaneo
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Mantén el código QR bien centrado</li>
              <li>• Asegúrate de tener buena iluminación</li>
              <li>• Mantén la cámara estable</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
