# Especificación de Requerimientos: "SmartCampus AR - Guía Multimodal de Laboratorios (Docker Edition)"

## Descripción General
Aplicación web móvil progresiva (PWA) desplegada en contenedores Docker para guiar a estudiantes y visitantes por los laboratorios de la facultad utilizando sensores del teléfono, adaptando su interfaz al contexto físico y permitiendo interacción sin tocar la pantalla (Zero-Touch).

## Requerimientos de Infraestructura (Docker & Red Móvil)
- **RI.1 Contenedor de Desarrollo con Hot-Reload:** El proyecto debe levantarse con un único comando `docker compose up -d --build`.
- **RI.2 Acceso HTTPS desde Smartphones en Red Local:** Configurar Vite con `@vitejs/plugin-basic-ssl` y `--host 0.0.0.0` en el puerto `5173` para que cualquier celular conectado a la misma red Wi-Fi pueda abrir `https://<IP-DE-LA-PC>:5173` y conceder permisos de cámara, micrófono y giroscopio sin bloqueo de contexto inseguro.

## Datos de Prueba (Puntos de Interés / Nodos IoT)
Incluir `src/data/poiData.js` con 4 laboratorios/puntos del campus:
1. **Laboratorio de Redes y Telecomunicaciones** (Orientación AR: Norte, `alpha`: 340° a 20°).
2. **Laboratorio de Ingeniería de Software e IA** (Orientación AR: Este, `alpha`: 70° a 110°).
3. **Laboratorio de Ciberseguridad y Forense** (Orientación AR: Sur, `alpha`: 160° a 200°).
4. **Decanato y Atención Estudiantil** (Orientación AR: Oeste, `alpha`: 250° a 290°).
Cada punto debe tener: `id`, `nombre`, `ubicacion`, `descripcionCompleta` (usuario quieto), `resumenCorto` (máximo 10 palabras para cuando el usuario camina), `anguloMin`, `anguloMax`, `capacidadActual` y `estado` (Abierto/En clase).

---

## Módulos Funcionales a Implementar

### Módulo 1: Interfaz Adaptativa al Contexto (Unidad 1 - Cognición, Ergonomía e IA Adaptativa)
- **RF1.1 Detección de Marcha (Carga Cognitiva):** Usar `DeviceMotionEvent` para calcular la magnitud de aceleración. Si supera el umbral de caminata continua (o se activa en el simulador), activar `isWalking`:
  - Ocultar `descripcionCompleta` y mostrar solo `resumenCorto` en fuente `text-2xl font-bold`.
  - Activar lectura automática por voz (TTS) de la tarjeta activa.
- **RF1.2 Adaptación Visual por Iluminación:** Ajustar clases de Tailwind automáticamente según el nivel de luz (`normal`, `dark`, `solar`). En modo `solar` (alto contraste), usar bordes gruesos, textos enormes y contraste máximo para exteriores.
- **RF1.3 Diseño Ergonómico (Thumb Zone):** Barra de navegación e interacción principal fija en la parte inferior para operación con una sola mano.

### Módulo 2: Interacción Natural y Multimodal "Zero-Touch" (Unidad 2.2)
- **RF2.1 Navegación por Gestos Físicos (Giroscopio):**
  - Inclinar el teléfono a la derecha (`gamma > 25°` con *cooldown* de 1.5s) pasa al siguiente laboratorio.
  - Inclinar a la izquierda (`gamma < -25°` con *cooldown* de 1.5s) regresa al laboratorio anterior.
  - Agitar el teléfono (*Shake* fuerte con acelerómetro) detiene o inicia la lectura por voz.
- **RF2.2 Comandos de Voz y Síntesis (Web Speech API):**
  - Síntesis de voz (`speechSynthesis` en `es-ES`) para leer la tarjeta activa.
  - Reconocimiento de comandos de voz básicos: *"siguiente"*, *"anterior"*, *"leer"*, *"cámara"*.
- **RF2.3 Retroalimentación Háptica (`navigator.vibrate`):**
  - Vibración corta (`80ms`) al cambiar de tarjeta por inclinación.
  - Vibración doble (`[100, 50, 100]`) al detectar un *Shake* o comando de voz.
  - Pulso suave (`40ms`) cuando el usuario fija un laboratorio en modo Realidad Aumentada.

### Módulo 3: Nodos Físicos e IoT Contextual (Unidad 2.1)
- **RF3.1 Simulación de Proximidad / Telemetría IoT:** Mostrar en cada tarjeta telemetría simulada en tiempo real (temperatura del laboratorio en °C, ocupación de equipos y nivel de señal de la baliza BLE/Wi-Fi en dBm).

### Módulo 4: Entorno Extendido de Realidad Aumentada (Unidad 2.3 - AR HUD)
- **RF4.1 Vista de Cámara AR:** Componente que activa la cámara trasera (`facingMode: "environment"`) a pantalla completa como fondo.
- **RF4.2 HUD Espacial con Brújula/Giroscopio:**
  - Mostrar cinta de brújula superior indicando los grados actuales (`alpha`: 0° - 360°).
  - Cuando el ángulo `alpha` coincida con el rango (`anguloMin` - `anguloMax`) de un laboratorio, superponer en el centro una **Tarjeta Flotante AR** translúcida (`backdrop-blur-md`).
  - Mostrar flechas direccionales en el HUD indicando hacia qué lado girar el teléfono para encontrar el punto más cercano.