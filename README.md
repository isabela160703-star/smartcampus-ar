# SmartCampus AR - Guía Multimodal de Laboratorios (Docker Edition)

Aplicación web móvil progresiva (PWA) desplegada en contenedores Docker para guiar a estudiantes y visitantes por los laboratorios de la facultad utilizando sensores del teléfono, adaptando su interfaz al contexto físico y permitiendo interacción sin tocar la pantalla (Zero-Touch).

## Características Principales

- **Realidad Aumentada (AR):** Vista de cámara trasera con HUD espacial que anuncia laboratorios cuando apuntas hacia ellos
- **Interfaz Adaptativa:** Se ajusta automáticamente según tu estado de movimiento (caminando/quieto) y nivel de luz ambiental
- **Interacción Multimodal Zero-Touch:**
  - Navegación por gestos físicos (inclinación del teléfono)
  - Comandos de voz: "siguiente", "anterior", "leer", "cámara"
  - Retroalimentación háptica (vibración)
- **Telemetría IoT Simulada:** Temperatura, ocupación de equipos y nivel de señal en tiempo real
- **Simulador de Sensores:** Panel de desarrollo para probar la app desde PC

## Requisitos Previos

- Docker instalado en tu PC
- Docker Compose instalado
- Un smartphone conectado a la misma red Wi-Fi que tu PC

## Instrucciones de Despliegue

### Opción 1: Modo Desarrollo (con Hot-Reload)

Para desarrollo con cambios en tiempo real:

```bash
docker compose up -d --build smartcampus-hci-web
```

Este comando:
- Construye la imagen Docker basada en `node:20-alpine`
- Instala todas las dependencias
- Inicia el servidor de desarrollo de Vite
- Configura hot-reload para cambios en tiempo real
- Expone el puerto `5173` con HTTPS

### Opción 2: Modo Producción (PWA Offline Completa)

Para uso offline completo (PWA instalable):

```bash
docker compose up -d --build smartcampus-hci-prod
```

Este comando:
- Construye el build de producción optimizado
- Genera Service Worker para cache offline
- Sirve con nginx (más ligero)
- Expone el puerto `8080` con HTTP
- La PWA se puede instalar y usar sin conexión

### Ambos Servicios Simultáneamente

```bash
docker compose up -d --build
```

Esto levanta ambos servicios:
- Desarrollo: https://localhost:5173
- Producción: http://localhost:8080

### 2. Obtener la IP Local de tu PC

#### Windows:
```bash
ipconfig
```
Busca la dirección IPv4 en tu adaptador de red (ej: `192.168.1.100`)

#### macOS/Linux:
```bash
ifconfig
```
o
```bash
ip addr show
```

### 3. Acceder desde tu Smartphone

#### Modo Desarrollo (HTTPS para sensores):
1. Abre el navegador web en tu celular (Chrome, Safari, etc.)
2. Navega a: `https://<TU_IP_LOCAL>:5173`
   - Ejemplo: `https://192.168.100.11:5173`
3. **IMPORTANTE:** Acepta el certificado autofirmado
   - Verás una advertencia de seguridad ("Su conexión no es privada")
   - En Chrome: Toca "Avanzado" → "Continuar a..."
   - En Safari: Tapa "Detalles" → "Visitar este sitio web"
4. Concede los permisos solicitados

#### Modo Producción (PWA Instalable):
1. Abre el navegador web en tu celular
2. Navega a: `http://<TU_IP_LOCAL>:8080`
   - Ejemplo: `http://192.168.100.11:8080`
3. **Instalar la PWA:**
   - En Chrome: Verás un icono de instalación (⊕) o ve a Menú → "Instalar SmartCampus AR"
   - En Safari: Toca Compartir → "Agregar a inicio"
4. Una vez instalada, la app funcionará **offline** gracias al Service Worker

**IMPORTANTE:** Para que la PWA funcione completamente offline en tu celular:
- Primero accede una vez con internet para que el Service Worker cachee todos los recursos
- Luego puedes usarla sin conexión (el contenedor Docker debe seguir corriendo)
- Los sensores (cámara, micrófono, giroscopio) requieren HTTPS - en modo producción necesitas configurar HTTPS en nginx o usar un proxy

### Opción 3: GitHub Pages (PWA en línea, sin Docker)

El workflow `.github/workflows/deploy.yml` construye la PWA y la publica automáticamente en GitHub Pages con cada push a `main`.

**Configuración única en GitHub:**
1. Ve a tu repo → **Settings** → **Pages**
2. En **Build and deployment** → **Source** selecciona **GitHub Actions**
3. Haz push de tus cambios a la rama `main`

La app quedará disponible en: `https://isabela160703-star.github.io/smartcampus-ar/`

> El build de GitHub Pages usa la variable `GITHUB_PAGES=true` para generar los assets bajo la base `/smartcampus-ar/`. El build de Docker usa `/` (raíz). Ambos comparten el mismo código. GitHub Pages entrega HTTPS con certificado válido (sin advertencias), por lo que cámara, micrófono y giroscopio funcionan directo desde el celular.

### 4. Usar la Aplicación

#### Pantalla de Bienvenida:
- Toca "Activar Sensores y Comenzar" para iniciar la experiencia

#### Modo AR (Realidad Aumentada):
- Toca el botón "AR" en la barra inferior
- Apunta tu teléfono hacia diferentes direcciones
- Cuando el ángulo coincida con un laboratorio, verás una tarjeta flotante
- Sigue las flechas guía para encontrar el laboratorio más cercano

#### Navegación por Gestos:
- Inclina el teléfono a la derecha (>25°) para ir al siguiente laboratorio
- Inclina el teléfono a la izquierda (<-25°) para ir al anterior
- Agita el teléfono (Shake) para iniciar o detener la lectura por voz

#### Comandos de Voz:
- "siguiente" - Ir al siguiente laboratorio
- "anterior" - Ir al laboratorio anterior
- "leer" - Leer la tarjeta actual
- "cámara" - Activar/desactivar modo AR
- "parar" - Detener lectura por voz

#### Adaptación al Contexto:
- **Caminando:** La interfaz se simplifica, textos más cortos, lectura automática por voz
- **Iluminación (automática con AmbientLightSensor, o manual desde el simulador):**
  - Normal: Diseño estándar
  - Oscuro: Tema oscuro para baja luz
  - Sol: Alto contraste (fondo negro, bordes amarillos) para exteriores

#### Simulador de Sensores (Desarrollo en PC):
- Toca el botón "Sim" en la barra inferior
- Simula movimiento (caminando/quieto, shake)
- Cambia el nivel de luz
- Ajusta la brújula manualmente con el slider (0° - 360°)
- Ajusta la inclinación gamma para probar navegación por gestos

## Arquitectura del Proyecto

```
smartcampus-ar/
├── src/
│   ├── components/
│   │   ├── StatusHeader.jsx       # Cabecera con estado de sensores
│   │   ├── ARCameraView.jsx       # Vista de cámara con HUD AR
│   │   ├── AdaptiveCardView.jsx   # Tarjeta adaptativa al contexto
│   │   ├── ThumbZoneControls.jsx  # Barra de controles ergonómica
│   │   └── SensorSimulatorDrawer.jsx # Simulador de sensores
│   ├── hooks/
│   │   ├── useHaptics.js          # Retroalimentación háptica
│   │   ├── useMultimodalVoice.js  # TTS y reconocimiento de voz
│   │   ├── useMotionSensors.js    # Sensores de movimiento
│   │   └── useAmbientLight.js     # Adaptación automática por luz (AmbientLightSensor)
│   ├── data/
│   │   └── poiData.js             # Datos de laboratorios y telemetría
│   ├── App.jsx                    # Componente principal
│   ├── main.jsx                   # Punto de entrada + registro PWA
│   └── index.css                  # Estilos globales
├── .github/workflows/deploy.yml   # Deploy automático a GitHub Pages
├── public/
│   ├── icon.svg                   # Icono vectorial
│   ├── icon-192.png               # Icono PNG 192x192
│   ├── icon-512.png               # Icono PNG 512x512
│   └── icon-maskable-512.png      # Icono maskable para Android
├── Dockerfile.dev                 # Dockerfile para desarrollo
├── Dockerfile.prod                # Dockerfile para producción (nginx)
├── docker-compose.yml             # Configuración Docker Compose
├── nginx.conf                     # Configuración nginx (headers de caché PWA)
├── vite.config.js                 # Configuración Vite + PWA + SSL
├── tailwind.config.js             # Configuración Tailwind CSS
├── package.json                   # Dependencias
├── package-lock.json              # Versiones exactas (requerido por CI)
└── README.md                      # Este archivo
```

## Tecnologías Utilizadas

- **React 18** - Framework UI
- **Vite** - Build tool y servidor de desarrollo
- **Tailwind CSS** - Framework de estilos
- **Lucide React** - Iconos
- **@vitejs/plugin-basic-ssl** - HTTPS para desarrollo local
- **Web APIs Nativas:**
  - DeviceOrientationEvent (giroscopio)
  - DeviceMotionEvent (acelerómetro)
  - Speech Synthesis API (TTS)
  - Web Speech Recognition API (STT)
  - Navigator.vibrate (háptica)
  - MediaDevices API (cámara)

## Solución de Problemas

### El contenedor no inicia
```bash
# Verificar puertos en uso
netstat -ano | findstr :5173

# Detener contenedor y recrear
docker compose down
docker compose up -d --build
```

### No puedo acceder desde el celular
- Verifica que tu PC y celular estén en la misma red Wi-Fi
- Desactiva el firewall temporalmente o permite el puerto 5173
- Verifica la IP local de tu PC con `ipconfig` o `ifconfig`

### La cámara no funciona
- Asegúrate de haber aceptado el permiso de cámara
- En iOS, verifica que el navegador tenga permisos en Configuración → Safari → Cámara
- En Android, verifica los permisos de la app del navegador

### Los sensores no responden
- En iOS 13+, es necesario interactuar primero con la pantalla (ya implementado en la app)
- Verifica que tu dispositivo tenga giroscopio y acelerómetro
- Usa el simulador para probar la funcionalidad desde PC

## Detener el Contenedor

```bash
docker compose down
```

## Hot-Reload

Los cambios en el código se reflejan automáticamente gracias al volumen montado y la configuración de polling en Vite. No necesitas reconstruir el contenedor.

## Licencia

Proyecto educativo para el curso de Interacción Humano-Computadora (HCI).
