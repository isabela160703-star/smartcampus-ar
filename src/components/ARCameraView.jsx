import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowUp, Footprints } from 'lucide-react';
import { getDirectionToNearestPOI } from '../data/poiData';

/**
 * ARCameraView - Vista de cámara con HUD de Realidad Aumentada
 * - Cámara trasera en vivo (cleanup correcto con ref)
 * - Cinta de brújula superior (0°-360°) con rangos de cada laboratorio
 * - Flechas guía hacia el laboratorio más cercano
 * - Tarjeta flotante AR translúcida cuando alpha coincide con un laboratorio
 */

// Ancho de ventana visible de la cinta de brújula (grados)
const RIBBON_WINDOW = 120;

// Calcular centro y ancho de rango de un POI
const getPoiRange = (poi) => {
  const width = poi.anguloMin > poi.anguloMax
    ? poi.anguloMax + 360 - poi.anguloMin
    : poi.anguloMax - poi.anguloMin;
  const center = poi.anguloMin > poi.anguloMax
    ? ((poi.anguloMin + width / 2) % 360)
    : (poi.anguloMin + poi.anguloMax) / 2;
  return { center, width };
};

// Distancia angular relativa (-180..180) desde alpha hacia un ángulo
const relativeDeg = (angle, alpha) => ((angle - alpha + 540) % 360) - 180;

const CARDINALS = [
  { angle: 0, label: 'N' },
  { angle: 90, label: 'E' },
  { angle: 180, label: 'S' },
  { angle: 270, label: 'O' }
];

const ARCameraView = ({
  alpha,
  activePOI,
  poiData,
  onCardFixed,
  isWalking,
  lightMode,
  stepCount = 0
}) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  // Iniciar cámara trasera y liberarla siempre al desmontar
  useEffect(() => {
    let cancelled = false;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        if (cancelled) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setIsCameraActive(true);
        setCameraError(false);
      } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        if (!cancelled) {
          setCameraError(true);
        }
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
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
  const { direction } = getDirectionToNearestPOI(alpha);

  // Normalizar alpha 0-360
  const normAlpha = ((alpha % 360) + 360) % 360;

  // Posición en la cinta para un ángulo relativo (-window/2 .. window/2) → 0..100%
  const toPercent = (rel) => ((rel + RIBBON_WINDOW / 2) / RIBBON_WINDOW) * 100;

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
    <div className="relative w-full h-[calc(100dvh-9rem)] bg-black rounded-xl overflow-hidden">
      {/* Video de la cámara */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* Cinta de Brújula HUD (RF4.2) */}
      <div className="absolute top-2 left-2 right-2">
        <div className="relative h-14 bg-black/60 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20">
          {/* Segmentos de laboratorios en la cinta */}
          {poiData.map((poi) => {
            const { center, width } = getPoiRange(poi);
            const rel = relativeDeg(center, normAlpha);
            const half = width / 2;
            // Ocultar si está fuera de la ventana visible
            if (rel + half < -RIBBON_WINDOW / 2 || rel - half > RIBBON_WINDOW / 2) {
              return null;
            }
            const left = toPercent(rel - half);
            const right = toPercent(rel + half);
            const isActive = activePOI && activePOI.id === poi.id;
            return (
              <div
                key={poi.id}
                className={`absolute top-0 h-full rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-500/70 border-x-2 border-blue-300'
                    : 'bg-blue-500/25 border-x border-blue-400/40'
                }`}
                style={{
                  left: `${left}%`,
                  width: `${Math.max(right - left, 2)}%`
                }}
              />
            );
          })}

          {/* Cardinalidades N/E/S/O */}
          {CARDINALS.map(({ angle, label }) => {
            const rel = relativeDeg(angle, normAlpha);
            if (Math.abs(rel) > RIBBON_WINDOW / 2) return null;
            return (
              <div
                key={label}
                className="absolute top-1 -translate-x-1/2 text-white/90 font-bold text-sm"
                style={{ left: `${toPercent(rel)}%` }}
              >
                {label}
              </div>
            );
          })}

          {/* Marcas de grado cada 15° */}
          {Array.from({ length: Math.ceil(RIBBON_WINDOW / 15) + 1 }, (_, i) => {
            const rel = -RIBBON_WINDOW / 2 + i * 15;
            const angle = ((normAlpha + rel) % 360 + 360) % 360;
            return (
              <div
                key={i}
                className="absolute top-7 -translate-x-1/2 text-[10px] font-mono text-white/70"
                style={{ left: `${toPercent(rel)}%` }}
              >
                {Math.round(angle)}°
              </div>
            );
          })}

          {/* Puntero central */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-yellow-400 shadow-[0_0_8px_2px_rgba(250,204,21,0.7)]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-[6px] border-l-transparent border-r-transparent border-t-yellow-400" />
        </div>
      </div>

      {/* Pasos en sesión */}
      <div className="absolute top-20 left-2 right-2 flex justify-center">
        <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 text-white">
          <Footprints className="w-4 h-4 text-yellow-400" />
          <span className="text-xs font-mono font-bold">{stepCount} pasos</span>
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
          <p className="text-white text-lg">
            {cameraError ? 'No se pudo acceder a la cámara' : 'Cargando cámara...'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ARCameraView;
