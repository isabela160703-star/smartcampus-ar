import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Módulo 5: Entorno magnético (sensor Magnetómetro del teléfono)
 * - Magnitud del campo magnético en µT (suavizado con media móvil)
 * - Línea base calibrada al iniciar/recalibrar (promedio de ambiente normal)
 * - Detección de estructuras metálicas con intensidad 0→1
 * API de sensores genéricos de Chrome (HTTPS obligatorio; Safari no la soporta)
 */
export const UMBRAL_METAL = 15;
const MUESTRAS_BASELINE = 15;

// Intensidad 0-1 según cuánto supera el campo la línea base
export const calcularIntensidad = (magnitud, base) => {
  if (magnitud == null || base == null) return 0;
  const desviacion = Math.max(0, magnitud - base);
  return Math.min(desviacion / 45, 1);
};

// ¿Hay estructura metálica cerca?
export const detectarMetal = (magnitud, base) => {
  if (magnitud == null || base == null) return false;
  return magnitud - base > UMBRAL_METAL;
};

export const useMagnetometer = () => {
  const [soportado, setSoportado] = useState(
    typeof window !== 'undefined' && 'Magnetometer' in window
  );
  const [magnitud, setMagnitud] = useState(null);
  const [lineaBase, setLineaBase] = useState(null);
  const [calibrando, setCalibrando] = useState(false);

  const sensorRef = useRef(null);
  const baselineReadingsRef = useRef([]);
  const suavizadoRef = useRef(null);

  // Reiniciar calibración (la línea base se toma de las próximas lecturas)
  const recalibrar = useCallback(() => {
    baselineReadingsRef.current = [];
    suavizadoRef.current = null;
    setLineaBase(null);
    setCalibrando(!!sensorRef.current);
  }, []);

  const detener = useCallback(() => {
    if (sensorRef.current) {
      try {
        sensorRef.current.stop();
      } catch {
        /* noop */
      }
      sensorRef.current = null;
    }
    setCalibrando(false);
  }, []);

  // Iniciar sensor (llamar desde un gesto del usuario)
  const iniciar = useCallback(() => {
    if (typeof window === 'undefined' || !('Magnetometer' in window)) {
      setSoportado(false);
      return;
    }
    if (sensorRef.current) return;

    try {
      const sensor = new window.Magnetometer({ frequency: 10 });

      sensor.onreading = () => {
        const m = Math.sqrt(sensor.x ** 2 + sensor.y ** 2 + sensor.z ** 2);
        if (!Number.isFinite(m)) return;

        // Suavizado exponencial para evitar parpadeos
        suavizadoRef.current = suavizadoRef.current == null
          ? m
          : suavizadoRef.current * 0.7 + m * 0.3;

        setMagnitud(suavizadoRef.current);

        // Recolectar línea base (ambiente normal) al inicio o tras recalibrar
        if (baselineReadingsRef.current.length < MUESTRAS_BASELINE) {
          baselineReadingsRef.current.push(suavizadoRef.current);
          if (baselineReadingsRef.current.length === MUESTRAS_BASELINE) {
            const suma = baselineReadingsRef.current.reduce((a, b) => a + b, 0);
            setLineaBase(suma / MUESTRAS_BASELINE);
            setCalibrando(false);
          }
        }
      };

      sensor.onerror = (event) => {
        console.warn('Magnetómetro no disponible:', event.error);
        setSoportado(false);
        setCalibrando(false);
      };

      sensor.start();
      sensorRef.current = sensor;
      setCalibrando(true);
      setSoportado(true);
    } catch (error) {
      console.warn('No se pudo iniciar el magnetómetro:', error);
      setSoportado(false);
      setCalibrando(false);
    }
  }, []);

  // Limpiar al desmontar
  useEffect(() => {
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

  return {
    soportado,
    magnitud,
    lineaBase,
    calibrando,
    iniciar,
    detener,
    recalibrar
  };
};
