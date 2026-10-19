import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowUp } from 'lucide-react';
import { getActivePOI, getDirectionToNearestPOI } from '../data/poiData';

/**
 * ARCameraView - Vista de cámara con HUD de Realidad Aumentada
 * - Cámara trasera en vivo
 * - HUD con brújula y flechas guía
 * - Tarjeta flotante AR cuando alpha coincide con un laboratorio
 */
const ARCameraView = ({ alpha, activePOI, onCardFixed, isWalking, lightMode }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Iniciar cámara trasera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
          setIsCameraActive(true);
        }
      } catch (error) {
        console.error('Error al acceder a la cámara:', error);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Notificar cuando se fija un laboratorio
  useEffect(() => {
    if (activePOI && onCardFixed) {
      onCardFixed(activePOI);
    }
  }, [activePOI, onCardFixed]);

  // Obtener dirección al laboratorio más cercano
  const { direction, distance } = getDirectionToNearestPOI(alpha);

  // Estilos según el modo de iluminación
  const getCardStyles = () => {
    switch (lightMode) {
      case 'solar':
        return 'bg-black border-4 border-yellow-400 text-yellow-400';
      case 'dark':
        return 'bg-gray-900/90 border-2 border-blue-400 text-white';
      default:
        return 'bg-white/90 border-2 border-gray-300 text-gray-900';
    }
  };

  const getArrowStyles = () => {
    switch (lightMode) {
      case 'solar':
        return 'text-yellow-400 drop-shadow-lg';
      case 'dark':
        return 'text-blue-400 drop-shadow-lg';
      default:
        return 'text-white drop-shadow-lg';
    }
  };

  return (
    <div className="relative w-full h-full bg-black">
      {/* Video de la cámara */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* Canvas para dibujar HUD */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />

      {/* HUD de Brújula */}
      <div className="absolute top-16 left-0 right-0 flex justify-center">
        <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
          <span className="text-white font-mono text-lg">
            {Math.round(alpha >= 0 ? alpha % 360 : (alpha % 360) + 360)}°
          </span>
        </div>
      </div>

      {/* Flechas guía */}
      <div className="absolute top-1/3 left-0 right-0 flex justify-between px-4">
        {direction === 'left' && (
          <div className={`flex flex-col items-center ${getArrowStyles()}`}>
            <ChevronLeft className="w-12 h-12 animate-pulse" />
            <span className="text-sm font-bold">Gira izquierda</span>
          </div>
        )}
        {direction === 'right' && (
          <div className={`flex flex-col items-center ${getArrowStyles()}`}>
            <ChevronRight className="w-12 h-12 animate-pulse" />
            <span className="text-sm font-bold">Gira derecha</span>
          </div>
        )}
        {direction === 'back' && (
          <div className={`flex flex-col items-center ${getArrowStyles()}`}>
            <ArrowUp className="w-12 h-12 animate-pulse rotate-180" />
            <span className="text-sm font-bold">Dale vuelta</span>
          </div>
        )}
      </div>

      {/* Tarjeta Flotante AR cuando coincide con un laboratorio */}
      {activePOI && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-md">
          <div className={`${getCardStyles()} backdrop-blur-md rounded-xl p-4 shadow-2xl`}>
            <h3 className={`font-bold ${lightMode === 'solar' ? 'text-2xl' : 'text-xl'} mb-2`}>
              {activePOI.nombre}
            </h3>
            <p className={`text-sm ${lightMode === 'solar' ? 'text-xl' : 'text-base'}`}>
              {isWalking ? activePOI.resumenCorto : activePOI.descripcionCompleta}
            </p>
            <div className="mt-3 flex gap-4 text-xs">
              <span className={`font-medium ${lightMode === 'solar' ? 'text-lg' : ''}`}>
                Estado: {activePOI.estado}
              </span>
              <span className={`font-medium ${lightMode === 'solar' ? 'text-lg' : ''}`}>
                {activePOI.capacidadActual}/{activePOI.capacidadTotal} personas
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de cámara inactiva */}
      {!isCameraActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <p className="text-white text-lg">Cargando cámara...</p>
        </div>
      )}
    </div>
  );
};

export default ARCameraView;
