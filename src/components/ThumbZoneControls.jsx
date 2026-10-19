import React from 'react';
import { Camera, Mic, ChevronLeft, ChevronRight, Settings } from 'lucide-react';

/**
 * ThumbZoneControls - Barra inferior ergonómica en la zona del pulgar
 * - Botones grandes (min-h-[64px]) para operación con una sola mano
 * - Alternar vista AR, activar voz, navegar y abrir simulador
 */
const ThumbZoneControls = ({
  isARView,
  onToggleAR,
  isListening,
  onToggleVoice,
  onPrevious,
  onNext,
  onOpenSimulator,
  isWalking,
  lightMode
}) => {
  // Estilos según modo de iluminación
  const getContainerStyles = () => {
    switch (lightMode) {
      case 'solar':
        return 'bg-black border-t-4 border-yellow-400';
      case 'dark':
        return 'bg-gray-900 border-t-2 border-blue-400';
      default:
        return 'bg-white border-t-2 border-gray-200';
    }
  };

  const getButtonStyles = (isActive = false) => {
    const base = 'flex flex-col items-center justify-center min-h-[64px] rounded-xl transition-all duration-200 active:scale-95';
    if (isActive) {
      switch (lightMode) {
        case 'solar':
          return `${base} bg-yellow-400 text-black`;
        case 'dark':
          return `${base} bg-blue-400 text-white`;
        default:
          return `${base} bg-blue-500 text-white`;
      }
    } else {
      switch (lightMode) {
        case 'solar':
          return `${base} bg-gray-800 text-yellow-400 border-2 border-yellow-400`;
        case 'dark':
          return `${base} bg-gray-800 text-blue-400 border-2 border-blue-400`;
        default:
          return `${base} bg-gray-100 text-gray-700 border-2 border-gray-300`;
      }
    }
  };

  const getIconColor = () => {
    switch (lightMode) {
      case 'solar':
        return 'text-yellow-400';
      case 'dark':
        return 'text-blue-400';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 ${getContainerStyles()} shadow-2xl z-50`}>
      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-center justify-between gap-2">
          {/* Botón Anterior */}
          <button
            onClick={onPrevious}
            className={`${getButtonStyles()} flex-1`}
            aria-label="Anterior"
          >
            <ChevronLeft className={`w-8 h-8 ${getIconColor()}`} />
            <span className={`text-xs font-bold mt-1 ${getIconColor()}`}>Anterior</span>
          </button>

          {/* Botón AR */}
          <button
            onClick={onToggleAR}
            className={`${getButtonStyles(isARView)} flex-1`}
            aria-label="Alternar AR"
          >
            <Camera className="w-8 h-8" />
            <span className="text-xs font-bold mt-1">AR</span>
          </button>

          {/* Botón Voz */}
          <button
            onClick={onToggleVoice}
            className={`${getButtonStyles(isListening)} flex-1`}
            aria-label="Activar voz"
          >
            <Mic className="w-8 h-8" />
            <span className="text-xs font-bold mt-1">Voz</span>
          </button>

          {/* Botón Siguiente */}
          <button
            onClick={onNext}
            className={`${getButtonStyles()} flex-1`}
            aria-label="Siguiente"
          >
            <ChevronRight className={`w-8 h-8 ${getIconColor()}`} />
            <span className={`text-xs font-bold mt-1 ${getIconColor()}`}>Siguiente</span>
          </button>

          {/* Botón Simulador */}
          <button
            onClick={onOpenSimulator}
            className={`${getButtonStyles()} flex-1`}
            aria-label="Simulador"
          >
            <Settings className={`w-8 h-8 ${getIconColor()}`} />
            <span className={`text-xs font-bold mt-1 ${getIconColor()}`}>Sim</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThumbZoneControls;
