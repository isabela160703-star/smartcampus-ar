import { useCallback } from 'react';

/**
 * Hook para gestionar retroalimentación háptica (vibración)
 * Patrones de vibración semánticos para diferentes interacciones
 */
export const useHaptics = () => {
  // Vibración corta para cambio de tarjeta por inclinación
  const vibrateCardChange = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate(80);
    }
  }, []);

  // Vibración doble para Shake o comando de voz
  const vibrateDouble = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }, []);

  // Pulso suave cuando se fija un laboratorio en modo AR
  const vibratePulse = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate(40);
    }
  }, []);

  // Vibración de error
  const vibrateError = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  }, []);

  // Vibración de éxito
  const vibrateSuccess = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50, 30, 50]);
    }
  }, []);

  return {
    vibrateCardChange,
    vibrateDouble,
    vibratePulse,
    vibrateError,
    vibrateSuccess
  };
};
