import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook para sensores de movimiento del dispositivo
 * - DeviceOrientationEvent (giroscopio/brújula)
 * - DeviceMotionEvent (acelerómetro)
 * - Detección de caminata con debounce (muestras consecutivas)
 * - Detección de gesto shake
 * - Inclinación gamma con cooldown para navegación
 * - Soporte para simulación manual
 */
export const useMotionSensors = (simulatorState = null) => {
  const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [isWalking, setIsWalking] = useState(false);
  const [isShake, setIsShake] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  const lastGammaChangeRef = useRef(0);
  const lastShakeRef = useRef(0);
  const walkingSampleCountRef = useRef(0);
  const idleSampleCountRef = useRef(0);
  const orientationCallbackRef = useRef(null);
  const motionCallbackRef = useRef(null);

  // Solicitar permisos para iOS 13+
  const requestPermission = useCallback(async () => {
    let denied = false;

    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== 'granted') {
          denied = true;
        }
      } catch (error) {
        console.error('Error al solicitar permisos de orientación:', error);
        denied = true;
      }
    }

    if (!denied &&
        typeof DeviceMotionEvent !== 'undefined' &&
        typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceMotionEvent.requestPermission();
        if (permission !== 'granted') {
          denied = true;
        }
      } catch (error) {
        console.error('Error al solicitar permisos de movimiento:', error);
        denied = true;
      }
    }

    if (denied) {
      setHasPermission(false);
      return false;
    }

    // En Android/PC no se requiere permiso explícito
    setHasPermission(true);
    return true;
  }, []);

  // Umbral de marcha: se requieren muestras consecutivas para activar
  // y un tramo continuo de inactividad para desactivar (evita parpadeos)
  const WALKING_ON_THRESHOLD = 11;
  const WALKING_OFF_THRESHOLD = 9;
  const SAMPLES_TO_START = 4;
  const SAMPLES_TO_STOP = 30;

  // Detectar caminata basado en aceleración (con debounce)
  const detectWalking = useCallback((acceleration) => {
    if (!acceleration) return false;

    const x = acceleration.x || 0;
    const y = acceleration.y || 0;
    const z = acceleration.z || 0;

    const magnitude = Math.sqrt(x * x + y * y + z * z);

    if (magnitude > WALKING_ON_THRESHOLD) {
      walkingSampleCountRef.current += 1;
      idleSampleCountRef.current = 0;
    } else if (magnitude < WALKING_OFF_THRESHOLD) {
      idleSampleCountRef.current += 1;
      walkingSampleCountRef.current = 0;
    }

    if (walkingSampleCountRef.current >= SAMPLES_TO_START) {
      return true;
    }
    if (idleSampleCountRef.current >= SAMPLES_TO_STOP) {
      return false;
    }
    // En muestras intermedias se mantiene el último estado via setIsWalking con updater
    return undefined;
  }, []);

  // Detectar gesto shake
  const detectShake = useCallback((acceleration) => {
    if (!acceleration) return false;

    const x = acceleration.x || 0;
    const y = acceleration.y || 0;
    const z = acceleration.z || 0;

    const magnitude = Math.sqrt(x * x + y * y + z * z);

    // Umbral para shake (incluye gravedad como referencia)
    const SHAKE_THRESHOLD = 25;
    const now = Date.now();

    if (magnitude > SHAKE_THRESHOLD && now - lastShakeRef.current > 1000) {
      lastShakeRef.current = now;
      return true;
    }

    return false;
  }, []);

  // Procesar cambio de tarjeta por inclinación
  const processGammaChange = useCallback((gamma) => {
    const now = Date.now();
    const COOLDOWN_MS = 1500;

    if (now - lastGammaChangeRef.current < COOLDOWN_MS) {
      return null;
    }

    if (gamma > 25) {
      lastGammaChangeRef.current = now;
      return 'next';
    } else if (gamma < -25) {
      lastGammaChangeRef.current = now;
      return 'previous';
    }

    return null;
  }, []);

  // Manejar evento de orientación
  const handleOrientation = useCallback((event) => {
    const { alpha, beta, gamma } = event;

    setOrientation({
      alpha: alpha || 0,
      beta: beta || 0,
      gamma: gamma || 0
    });

    // Notificar cambio de tarjeta por inclinación
    const cardChange = processGammaChange(gamma);
    if (cardChange && orientationCallbackRef.current) {
      orientationCallbackRef.current(cardChange);
    }
  }, [processGammaChange]);

  // Manejar evento de movimiento
  const handleMotion = useCallback((event) => {
    // Aceleración lineal (sin gravedad); fallback a la que incluye gravedad
    const acceleration = event.acceleration || event.accelerationIncludingGravity;

    // Detectar caminata (undefined = mantener estado anterior)
    const walking = detectWalking(acceleration);
    if (walking !== undefined) {
      setIsWalking(walking);
    }

    // Detectar shake
    const shake = detectShake(acceleration);
    if (shake) {
      setIsShake(true);
      setTimeout(() => setIsShake(false), 500);
    }
  }, [detectWalking, detectShake]);

  // Iniciar sensores
  const startSensors = useCallback(() => {
    window.addEventListener('deviceorientation', handleOrientation);
    window.addEventListener('devicemotion', handleMotion);
  }, [handleOrientation, handleMotion]);

  // Detener sensores
  const stopSensors = useCallback(() => {
    window.removeEventListener('deviceorientation', handleOrientation);
    window.removeEventListener('devicemotion', handleMotion);
  }, [handleOrientation, handleMotion]);

  // Limpiar sensores al desmontar
  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [handleOrientation, handleMotion]);

  // Efecto para manejar simulación manual
  useEffect(() => {
    if (simulatorState) {
      setOrientation({
        alpha: simulatorState.alpha || 0,
        beta: simulatorState.beta || 0,
        gamma: simulatorState.gamma || 0
      });
      setIsWalking(simulatorState.isWalking || false);

      // Procesar inclinación manual
      const cardChange = processGammaChange(simulatorState.gamma || 0);
      if (cardChange && orientationCallbackRef.current) {
        orientationCallbackRef.current(cardChange);
      }

      // Simular shake manual
      if (simulatorState.isShake) {
        setIsShake(true);
        setTimeout(() => setIsShake(false), 500);
      }
    }
  }, [simulatorState, processGammaChange]);

  // Registrar callback para cambios de orientación
  const onOrientationChange = useCallback((callback) => {
    orientationCallbackRef.current = callback;
  }, []);

  // Callback para detección de shake (se activa cuando isShake cambia)
  useEffect(() => {
    if (isShake && motionCallbackRef.current) {
      motionCallbackRef.current();
    }
  }, [isShake]);

  // Registrar callback para detección de shake
  const onShake = useCallback((callback) => {
    motionCallbackRef.current = callback;
  }, []);

  return {
    orientation,
    isWalking,
    isShake,
    hasPermission,
    requestPermission,
    startSensors,
    stopSensors,
    onOrientationChange,
    onShake
  };
};
