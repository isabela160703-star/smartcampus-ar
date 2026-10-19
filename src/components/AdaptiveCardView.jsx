import React from 'react';
import { Thermometer, Users, Wifi } from 'lucide-react';

/**
 * AdaptiveCardView - Vista principal que muta dinámicamente según contexto
 * - Adaptación por carga cognitiva (isWalking)
 * - Adaptación por iluminación (normal, dark, solar)
 * - Muestra telemetría IoT en tiempo real
 */
const AdaptiveCardView = ({ poi, isWalking, lightMode }) => {
  if (!poi) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No hay laboratorio seleccionado</p>
      </div>
    );
  }

  // Estilos según modo de iluminación
  const getContainerStyles = () => {
    switch (lightMode) {
      case 'solar':
        return 'bg-black border-4 border-yellow-400';
      case 'dark':
        return 'bg-gray-900 border-2 border-blue-400';
      default:
        return 'bg-white border-2 border-gray-200';
    }
  };

  const getTextStyles = () => {
    switch (lightMode) {
      case 'solar':
        return 'text-yellow-400';
      case 'dark':
        return 'text-white';
      default:
        return 'text-gray-900';
    }
  };

  const getSecondaryTextStyles = () => {
    switch (lightMode) {
      case 'solar':
        return 'text-yellow-300';
      case 'dark':
        return 'text-gray-300';
      default:
        return 'text-gray-600';
    }
  };

  // Tamaño de tipografía según carga cognitiva
  const getTitleSize = () => isWalking ? 'text-3xl' : 'text-2xl';
  const getBodySize = () => isWalking ? 'text-2xl font-bold' : 'text-base';
  const getTelemetrySize = () => isWalking ? 'text-xl' : 'text-sm';

  return (
    <div className={`${getContainerStyles()} ${getTextStyles()} rounded-2xl p-6 shadow-xl transition-all duration-300`}>
      {/* Título */}
      <h2 className={`${getTitleSize()} font-bold mb-3`}>
        {poi.nombre}
      </h2>

      {/* Ubicación */}
      <p className={`${getSecondaryTextStyles()} ${getBodySize()} mb-4`}>
        {poi.ubicacion}
      </p>

      {/* Descripción - adaptativa según carga cognitiva */}
      <div className={`${getSecondaryTextStyles()} ${getBodySize()} mb-6`}>
        {isWalking ? (
          <p className="font-bold">{poi.resumenCorto}</p>
        ) : (
          <p>{poi.descripcionCompleta}</p>
        )}
      </div>

      {/* Telemetría IoT */}
      <div className={`grid grid-cols-3 gap-4 pt-4 border-t-2 ${
        lightMode === 'solar' ? 'border-yellow-400' :
        lightMode === 'dark' ? 'border-blue-400' :
        'border-gray-200'
      }`}>
        {/* Temperatura */}
        <div className="flex flex-col items-center">
          <Thermometer className={`w-6 h-6 mb-1 ${
            lightMode === 'solar' ? 'text-yellow-400' :
            lightMode === 'dark' ? 'text-blue-400' :
            'text-red-500'
          }`} />
          <span className={`${getTelemetrySize()} font-mono font-bold`}>
            {poi.telemetria.temperatura.toFixed(1)}°C
          </span>
          <span className={`${getTelemetrySize()} ${getSecondaryTextStyles()}`}>
            Temp
          </span>
        </div>

        {/* Ocupación */}
        <div className="flex flex-col items-center">
          <Users className={`w-6 h-6 mb-1 ${
            lightMode === 'solar' ? 'text-yellow-400' :
            lightMode === 'dark' ? 'text-blue-400' :
            'text-green-500'
          }`} />
          <span className={`${getTelemetrySize()} font-mono font-bold`}>
            {poi.telemetria.ocupacionEquipos}
          </span>
          <span className={`${getTelemetrySize()} ${getSecondaryTextStyles()}`}>
            Equipos
          </span>
        </div>

        {/* Señal */}
        <div className="flex flex-col items-center">
          <Wifi className={`w-6 h-6 mb-1 ${
            lightMode === 'solar' ? 'text-yellow-400' :
            lightMode === 'dark' ? 'text-blue-400' :
            'text-blue-500'
          }`} />
          <span className={`${getTelemetrySize()} font-mono font-bold`}>
            {poi.telemetria.nivelSenal} dBm
          </span>
          <span className={`${getTelemetrySize()} ${getSecondaryTextStyles()}`}>
            Señal
          </span>
        </div>
      </div>

      {/* Estado y capacidad */}
      <div className="mt-4 flex justify-between items-center">
        <span className={`${getTelemetrySize()} font-bold ${
          poi.estado === 'Abierto' ? 'text-green-500' : 'text-orange-500'
        }`}>
          {poi.estado}
        </span>
        <span className={`${getTelemetrySize()} ${getSecondaryTextStyles()}`}>
          {poi.capacidadActual}/{poi.capacidadTotal} personas
        </span>
      </div>
    </div>
  );
};

export default AdaptiveCardView;
