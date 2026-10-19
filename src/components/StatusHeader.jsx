import React from 'react';
import { Activity, Sun, Compass, Mic, Volume2 } from 'lucide-react';

/**
 * StatusHeader - Cabecera con estado en vivo de sensores
 * Muestra: estado de movimiento, tema lumínico, grados de brújula, micrófono y lectura por voz
 */
const StatusHeader = ({ isWalking, lightMode, alpha, isListening, isSpeaking }) => {
  const normalizedAlpha = alpha >= 0 ? alpha % 360 : (alpha % 360) + 360;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md text-white p-3">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {/* Estado de movimiento */}
        <div className="flex items-center gap-2">
          <Activity
            className={`w-5 h-5 ${isWalking ? 'text-green-400 animate-pulse' : 'text-gray-400'}`}
          />
          <span className="text-sm font-medium">
            {isWalking ? 'Caminando' : 'Quieto'}
          </span>
        </div>

        {/* Tema lumínico */}
        <div className="flex items-center gap-2">
          <Sun
            className={`w-5 h-5 ${
              lightMode === 'solar' ? 'text-yellow-400' :
              lightMode === 'dark' ? 'text-blue-400' :
              'text-orange-400'
            }`}
          />
          <span className="text-sm font-medium capitalize">
            {lightMode === 'solar' ? 'Sol' : lightMode === 'dark' ? 'Oscuro' : 'Normal'}
          </span>
        </div>

        {/* Brújula */}
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-medium font-mono">
            {Math.round(normalizedAlpha)}°
          </span>
        </div>

        {/* Micrófono y lectura por voz */}
        <div className="flex items-center gap-2">
          {isSpeaking && (
            <Volume2 className="w-5 h-5 text-blue-400 animate-pulse" />
          )}
          <Mic
            className={`w-5 h-5 ${isListening ? 'text-red-400 animate-pulse' : 'text-gray-400'}`}
          />
        </div>
      </div>
    </div>
  );
};

export default StatusHeader;
