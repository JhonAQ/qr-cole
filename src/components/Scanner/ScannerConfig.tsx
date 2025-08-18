"use client";

import React from "react";
import {
  Settings,
  Zap,
  Timer,
  Shield,
  Volume2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";
import { ScannerConfigProps } from "./types";
import { DEFAULT_SCANNER_CONFIG } from "./utils";

export default function ScannerConfig({
  config,
  onChange,
  visible,
  onToggle,
}: ScannerConfigProps) {
  const handleConfigChange = (key: keyof typeof config, value: any) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  const resetToDefaults = () => {
    onChange(DEFAULT_SCANNER_CONFIG);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Settings className="w-5 h-5 text-gray-600" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-gray-900">
              Configuración del Escáner
            </h3>
            <p className="text-sm text-gray-500">
              Ajusta el comportamiento del scanner
            </p>
          </div>
        </div>
        <div className="text-gray-400">
          {visible ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </button>

      {/* Contenido de configuración */}
      {visible && (
        <div className="border-t border-gray-100 p-4 space-y-6">
          {/* Velocidad de escaneo */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-blue-600" />
              <label className="font-medium text-gray-700">
                Velocidad de Escaneo: {config.fps} FPS
              </label>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="5"
              value={config.fps}
              onChange={(e) =>
                handleConfigChange("fps", parseInt(e.target.value))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Lento (5)</span>
              <span>Rápido (30)</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Mayor velocidad consume más batería pero detecta códigos más
              rápido
            </p>
          </div>

          {/* Tiempo de debounce */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Timer className="w-4 h-4 text-blue-600" />
              <label className="font-medium text-gray-700">
                Anti-duplicados: {config.debounceMs / 1000}s
              </label>
            </div>
            <input
              type="range"
              min="500"
              max="3000"
              step="500"
              value={config.debounceMs}
              onChange={(e) =>
                handleConfigChange("debounceMs", parseInt(e.target.value))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.5s</span>
              <span>3s</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Tiempo mínimo entre escaneos del mismo código
            </p>
          </div>

          {/* Auto confirmación */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Volume2 className="w-4 h-4 text-blue-600" />
              <label className="font-medium text-gray-700">
                Auto-confirmación: {config.autoConfirmMs / 1000}s
              </label>
            </div>
            <input
              type="range"
              min="2000"
              max="10000"
              step="1000"
              value={config.autoConfirmMs}
              onChange={(e) =>
                handleConfigChange("autoConfirmMs", parseInt(e.target.value))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>2s</span>
              <span>10s</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Tiempo antes de confirmar automáticamente el registro
            </p>
          </div>

          {/* Prevención de duplicados */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-blue-600" />
              <label className="font-medium text-gray-700">
                Bloqueo duplicados: {config.preventDuplicateMs / (1000 * 60)}{" "}
                min
              </label>
            </div>
            <input
              type="range"
              min="60000"
              max="900000"
              step="60000"
              value={config.preventDuplicateMs}
              onChange={(e) =>
                handleConfigChange(
                  "preventDuplicateMs",
                  parseInt(e.target.value)
                )
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 min</span>
              <span>15 min</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Tiempo mínimo entre registros del mismo tipo
            </p>
          </div>

          {/* Tamaño del área de escaneo */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-4 h-4 text-blue-600" />
              <label className="font-medium text-gray-700">
                Área de escaneo:{" "}
                {config.qrbox ? `${config.qrbox.width}px` : "Toda la pantalla"}
              </label>
            </div>
            <input
              type="range"
              min="200"
              max="350"
              step="50"
              value={config.qrbox?.width || 300}
              onChange={(e) => {
                const size = parseInt(e.target.value);
                handleConfigChange("qrbox", { width: size, height: size });
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Pequeña</span>
              <span>Grande</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Tamaño del área de detección del código QR
            </p>
          </div>

          {/* Botón de reset */}
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={resetToDefaults}
              className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Restaurar valores por defecto
            </button>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              💡 Recomendaciones
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Para uso intensivo: velocidad media (15 FPS)</li>
              <li>• Para ahorrar batería: velocidad baja (10 FPS)</li>
              <li>• Para estudiantes pequeños: área de escaneo grande</li>
              <li>• Para evitar errores: anti-duplicados alto (2-3s)</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
