import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Hook para interfaz multimodal de voz
 * - Síntesis de voz (TTS) en español
 * - Reconocimiento de comandos de voz básicos
 */
export const useMultimodalVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState(null);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);

  // Inicializar reconocimiento de voz
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'es-ES';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase().trim();
        setLastCommand(command);
        processCommand(command);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Error de reconocimiento de voz:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    synthesisRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, []);

  // Procesar comandos de voz reconocidos
  const processCommand = useCallback((command) => {
    // Comandos reconocidos
    const commands = {
      'siguiente': 'next',
      'anterior': 'previous',
      'leer': 'read',
      'cámara': 'camera',
      'camara': 'camera',
      'parar': 'stop',
      'detener': 'stop'
    };

    for (const [key, action] of Object.entries(commands)) {
      if (command.includes(key)) {
        return action;
      }
    }

    return null;
  }, []);

  // Síntesis de voz (TTS)
  const speak = useCallback((text, lang = 'es-ES') => {
    if (!synthesisRef.current) return;

    // Cancelar cualquier lectura en curso
    synthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    synthesisRef.current.speak(utterance);
  }, []);

  // Iniciar reconocimiento de voz
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error al iniciar reconocimiento:', error);
      }
    }
  }, [isListening]);

  // Detener reconocimiento de voz
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  // Detener síntesis de voz
  const stopSpeaking = useCallback(() => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
  }, []);

  return {
    isListening,
    lastCommand,
    speak,
    startListening,
    stopListening,
    stopSpeaking,
    processCommand
  };
};
