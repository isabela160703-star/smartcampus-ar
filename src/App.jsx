import React, { useState, useEffect, useCallback } from 'react';
import { poiData, getActivePOI } from './data/poiData';
import { useHaptics } from './hooks/useHaptics';
import { useMultimodalVoice } from './hooks/useMultimodalVoice';
import { useMotionSensors } from './hooks/useMotionSensors';
import { useAmbientLight } from './hooks/useAmbientLight';
import StatusHeader from './components/StatusHeader';
import ARCameraView from './components/ARCameraView';
import AdaptiveCardView from './components/AdaptiveCardView';
import ThumbZoneControls from './components/ThumbZoneControls';
import SensorSimulatorDrawer from './components/SensorSimulatorDrawer';

/**
 * SmartCampus AR - Aplicación principal
 * Pantalla de bienvenida con solicitud de permisos
 * Integración de todos los módulos de sensores e interfaz adaptativa
 */
function App() {
  const [isWelcomeScreen, setIsWelcomeScreen] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isARView, setIsARView] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatorState, setSimulatorState] = useState(null);

  // Adaptación visual por iluminación (RF1.2): automática con fallback al simulador
  const { lightMode, setManual: setManualLightMode } = useAmbientLight();

  const {
    orientation,
    isWalking,
    hasPermission,
    requestPermission,
    startSensors,
    stopSensors,
    onOrientationChange,
    onShake
  } = useMotionSensors(simulatorState);

  const {
    isListening,
    isSpeaking,
    lastCommand,
    speak,
    startListening,
    stopListening,
    stopSpeaking,
    processCommand
  } = useMultimodalVoice();

  const {
    vibrateCardChange,
    vibrateDouble,
    vibratePulse
  } = useHaptics();

  // Leer tarjeta actual por voz
  const readCurrentCard = useCallback(() => {
    const poi = poiData[currentIndex];
    if (poi) {
      const text = isWalking ? poi.resumenCorto : poi.descripcionCompleta;
      speak(`${poi.nombre}. ${text}`);
    }
  }, [currentIndex, isWalking, speak]);

  // Navegación
  const handleNext = useCallback(() => {
    vibrateCardChange();
    setCurrentIndex((prev) => (prev + 1) % poiData.length);
  }, [vibrateCardChange]);

  const handlePrevious = useCallback(() => {
    vibrateCardChange();
    setCurrentIndex((prev) => (prev - 1 + poiData.length) % poiData.length);
  }, [vibrateCardChange]);

  const toggleAR = useCallback(() => {
    setIsARView((prev) => !prev);
  }, []);

  const toggleVoice = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Manejar inicio de la aplicación con permisos
  const handleStart = async () => {
    const granted = await requestPermission();
    if (granted) {
      startSensors();
      setIsWelcomeScreen(false);
    } else {
      alert('Los permisos de sensores fueron denegados. La app no podrá detectar tu orientación ni tu movimiento.');
    }
  };

  // Callback para cambios de orientación (inclinación)
  useEffect(() => {
    onOrientationChange((direction) => {
      if (direction === 'next') {
        handleNext();
      } else if (direction === 'previous') {
        handlePrevious();
      }
    });
  }, [onOrientationChange, handleNext, handlePrevious]);

  // RF2.1: Shake detiene o inicia la lectura por voz (TTS)
  useEffect(() => {
    onShake(() => {
      vibrateDouble();
      if (isSpeaking) {
        stopSpeaking();
      } else {
        readCurrentCard();
      }
    });
  }, [onShake, isSpeaking, stopSpeaking, readCurrentCard, vibrateDouble]);

  // Procesar comandos de voz
  useEffect(() => {
    if (lastCommand?.text) {
      const action = processCommand(lastCommand.text);
      if (action) {
        vibrateDouble();
        switch (action) {
          case 'next':
            handleNext();
            break;
          case 'previous':
            handlePrevious();
            break;
          case 'read':
            readCurrentCard();
            break;
          case 'camera':
            toggleAR();
            break;
          case 'stop':
            stopSpeaking();
            break;
        }
      }
    }
  }, [lastCommand, processCommand, vibrateDouble, handleNext, handlePrevious, readCurrentCard, toggleAR, stopSpeaking]);

  // Activar lectura automática al caminar (una sola vez por transición)
  useEffect(() => {
    if (isWalking && !isWelcomeScreen) {
      readCurrentCard();
    }
  }, [isWalking, isWelcomeScreen, readCurrentCard]);

  // Obtener POI activo según brújula
  const activePOI = getActivePOI(orientation.alpha);

  // Callback cuando se fija un laboratorio en AR
  const handleCardFixed = useCallback((poi) => {
    vibratePulse();
    const index = poiData.findIndex(p => p.id === poi.id);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, [vibratePulse]);

  // Cambio desde simulador
  const handleSimulatorChange = useCallback((state) => {
    setSimulatorState(state);
    if (state.lightMode) {
      setManualLightMode(state.lightMode);
    }
  }, [setManualLightMode]);

  // Obtener POI actual
  const currentPOI = poiData[currentIndex];

  // Pantalla de bienvenida
  if (isWelcomeScreen) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-6 overflow-y-auto">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center my-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              SmartCampus AR
            </h1>
            <p className="text-gray-600">
              Guía multimodal de laboratorios
            </p>
          </div>

          <div className="space-y-4 mb-8 text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <p className="text-sm text-gray-700">
                Usa la cámara para ver la realidad aumentada y encontrar laboratorios
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <p className="text-sm text-gray-700">
                Inclina el teléfono para navegar entre laboratorios
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <p className="text-sm text-gray-700">
                Usa comandos de voz: "siguiente", "anterior", "leer", "cámara"
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">4</span>
              </div>
              <p className="text-sm text-gray-700">
                Agita el teléfono para iniciar o detener la lectura por voz
              </p>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors active:scale-95"
          >
            Activar Sensores y Comenzar
          </button>

          <p className="text-xs text-gray-500 mt-4">
            Se solicitarán permisos de cámara, micrófono y sensores
          </p>
        </div>
      </div>
    );
  }

  // Aplicación principal
  return (
    <div className={`min-h-[100dvh] ${
      lightMode === 'solar' ? 'bg-black' :
      lightMode === 'dark' ? 'bg-gray-900' :
      'bg-gray-100'
    }`}>
      <StatusHeader
        isWalking={isWalking}
        lightMode={lightMode}
        alpha={orientation.alpha}
        isListening={isListening}
        isSpeaking={isSpeaking}
      />

      <div className="pt-20 pb-32 px-4 max-w-lg mx-auto">
        {isARView ? (
          <ARCameraView
            alpha={orientation.alpha}
            activePOI={activePOI}
            poiData={poiData}
            onCardFixed={handleCardFixed}
            isWalking={isWalking}
            lightMode={lightMode}
          />
        ) : (
          <AdaptiveCardView
            poi={currentPOI}
            isWalking={isWalking}
            lightMode={lightMode}
          />
        )}
      </div>

      <ThumbZoneControls
        isARView={isARView}
        onToggleAR={toggleAR}
        isListening={isListening}
        onToggleVoice={toggleVoice}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        isWalking={isWalking}
        lightMode={lightMode}
      />

      <SensorSimulatorDrawer
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onSimulatorChange={handleSimulatorChange}
      />

      {/* Indicador de lectura por voz activa */}
      {isSpeaking && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-40 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Leyendo...
        </div>
      )}
    </div>
  );
}

export default App;
