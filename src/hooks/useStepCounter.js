import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Contador de pasos desde acelerómetro (calcula picos verticales)
 * Complementa useMotionSensors.isWalking: cuenta pasos en sesión.
 * También soporta addSteps(n) desde el simulador.
 */
export const useStepCounter = ({ isWalking = false } = {}) => {
  const [stepCount, setStepCount] = useState(0);
  const lastStepTimeRef = useRef(0);
  const lastAccRef = useRef({ x: 0, y: 0, z: 0 });
  const cooldownRef = useRef(250);

  useEffect(() => {
    const handler = (event) => {
      const acc = event.acceleration || event.accelerationIncludingGravity;
      if (!acc) return;
      const x = acc.x || 0;
      const y = acc.y || 0;
      const z = acc.z || 0;
      const last = lastAccRef.current;
      const dx = Math.abs(x - last.x);
      const dy = Math.abs(y - last.y);
      const dz = Math.abs(z - last.z);
      const delta = dx + dy + dz;
      const now = Date.now();

      // Umbral para pico de paso (cuando camina)
      if (delta > 10 && isWalking && now - lastStepTimeRef.current > cooldownRef.current) {
        lastStepTimeRef.current = now;
        setStepCount((c) => c + 1);
      }

      lastAccRef.current = { x, y, z };
    };

    window.addEventListener('devicemotion', handler);
    return () => window.removeEventListener('devicemotion', handler);
  }, [isWalking]);

  const addSteps = useCallback((n = 1) => {
    setStepCount((c) => c + Math.max(0, n));
  }, []);

  const resetSteps = useCallback(() => {
    setStepCount(0);
    lastStepTimeRef.current = 0;
  }, []);

  return { stepCount, addSteps, resetSteps };
};
