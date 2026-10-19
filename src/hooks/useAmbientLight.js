import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook de adaptación visual por iluminación (RF1.2)
 * Usa AmbientLightSensor cuando está disponible (Chrome/Android);
 * si no, expone setManualMode para control desde el simulador.
 * Modos: 'normal' | 'dark' | 'solar'
 */
export const useAmbientLight = () => {
  const [lightMode, setLightMode] = useState('normal');
  const [manualMode, setManualMode] = useState(null);
  const [hasSensor, setHasSensor] = useState(false);
  const sensorRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('AmbientLightSensor' in window)) {
      return;
    }

    try {
      const sensor = new window.AmbientLightSensor({ frequency: 0.5 });
      sensorRef.current = sensor;

      sensor.onreading = () => {
        const lux = sensor.illuminance;
        if (lux < 100) {
          setLightMode('dark');
        } else if (lux > 15000) {
          setLightMode('solar');
        } else {
          setLightMode('normal');
        }
      };

      sensor.onerror = (event) => {
        console.warn('AmbientLightSensor no disponible:', event.error);
      };

      sensor.start();
      setHasSensor(true);
    } catch (error) {
      console.warn('AmbientLightSensor no soportado:', error);
    }

    return () => {
      if (sensorRef.current) {
        try {
          sensorRef.current.stop();
        } catch {
          /* noop */
        }
        sensorRef.current = null;
      }
    };
  }, []);

  // El simulador tiene prioridad sobre el sensor automático
  useEffect(() => {
    if (manualMode) {
      setLightMode(manualMode);
    }
  }, [manualMode]);

  const setManual = useCallback((mode) => {
    setManualMode(mode);
  }, []);

  const clearManual = useCallback(() => {
    setManualMode(null);
  }, []);

  return { lightMode, hasSensor, setManual, clearManual };
};
