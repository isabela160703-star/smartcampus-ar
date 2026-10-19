// Datos de Puntos de Interés (Laboratorios) para SmartCampus AR
// Incluye orientación espacial para AR, textos adaptativos y telemetría IoT simulada

export const poiData = [
  {
    id: 1,
    nombre: "Laboratorio de Redes y Telecomunicaciones",
    ubicacion: "Edificio B, Piso 2, Norte",
    descripcionCompleta: "Laboratorio especializado en redes de alta velocidad, fibra óptica y telecomunicaciones 5G. Cuenta con equipamiento para pruebas de latencia, throughput y análisis de protocolos de red.",
    resumenCorto: "Redes 5G y fibra óptica",
    anguloMin: 340,
    anguloMax: 20,
    capacidadActual: 12,
    capacidadTotal: 20,
    estado: "Abierto",
    telemetria: {
      temperatura: 22.5,
      ocupacionEquipos: 8,
      nivelSenal: -45
    }
  },
  {
    id: 2,
    nombre: "Laboratorio de Ingeniería de Software e IA",
    ubicacion: "Edificio A, Piso 3, Este",
    descripcionCompleta: "Espacio de desarrollo de software con estaciones de trabajo de alto rendimiento, servidores GPU para entrenamiento de modelos de IA y entornos de colaboración ágil con herramientas DevOps.",
    resumenCorto: "Desarrollo software e IA",
    anguloMin: 70,
    anguloMax: 110,
    capacidadActual: 18,
    capacidadTotal: 25,
    estado: "En clase",
    telemetria: {
      temperatura: 24.1,
      ocupacionEquipos: 20,
      nivelSenal: -52
    }
  },
  {
    id: 3,
    nombre: "Laboratorio de Ciberseguridad y Forense",
    ubicacion: "Edificio C, Piso 1, Sur",
    descripcionCompleta: "Laboratorio aislado para análisis de malware, pentesting, forense digital y simulación de ataques cibernéticos. Cuenta con sandboxing y herramientas de análisis forense avanzadas.",
    resumenCorto: "Ciberseguridad y forense",
    anguloMin: 160,
    anguloMax: 200,
    capacidadActual: 5,
    capacidadTotal: 15,
    estado: "Abierto",
    telemetria: {
      temperatura: 21.8,
      ocupacionEquipos: 5,
      nivelSenal: -58
    }
  },
  {
    id: 4,
    nombre: "Decanato y Atención Estudiantil",
    ubicacion: "Edificio Principal, Piso 1, Oeste",
    descripcionCompleta: "Oficina central de la facultad donde se gestionan trámites académicos, certificaciones, orientación estudiantil y atención al usuario. Horario de atención: Lunes a Viernes 8:00 - 18:00.",
    resumenCorto: "Trámites y atención",
    anguloMin: 250,
    anguloMax: 290,
    capacidadActual: 3,
    capacidadTotal: 10,
    estado: "Abierto",
    telemetria: {
      temperatura: 23.0,
      ocupacionEquipos: 0,
      nivelSenal: -62
    }
  }
];

// Función para obtener el laboratorio activo según el ángulo de la brújula
export const getActivePOI = (alpha) => {
  // Normalizar alpha a 0-360
  const normalizedAlpha = alpha >= 0 ? alpha % 360 : (alpha % 360) + 360;

  for (const poi of poiData) {
    // Manejar el caso especial del ángulo que cruza 0° (ej: 340° a 20°)
    if (poi.anguloMin > poi.anguloMax) {
      if (normalizedAlpha >= poi.anguloMin || normalizedAlpha <= poi.anguloMax) {
        return poi;
      }
    } else {
      if (normalizedAlpha >= poi.anguloMin && normalizedAlpha <= poi.anguloMax) {
        return poi;
      }
    }
  }
  return null;
};

// Función para calcular la dirección al laboratorio más cercano
export const getDirectionToNearestPOI = (alpha) => {
  const normalizedAlpha = alpha >= 0 ? alpha % 360 : (alpha % 360) + 360;
  let minDistance = 360;
  let nearestPOI = null;
  let direction = null;

  for (const poi of poiData) {
    const centerAngle = poi.anguloMin > poi.anguloMax
      ? ((poi.anguloMin + 360 + poi.anguloMax) / 2) % 360
      : (poi.anguloMin + poi.anguloMax) / 2;

    let distance = Math.abs(centerAngle - normalizedAlpha);
    if (distance > 180) {
      distance = 360 - distance;
    }

    if (distance < minDistance) {
      minDistance = distance;
      nearestPOI = poi;

      // Calcular dirección relativa
      const diff = (centerAngle - normalizedAlpha + 360) % 360;
      if (diff < 45 || diff > 315) {
        direction = 'center';
      } else if (diff >= 45 && diff < 135) {
        direction = 'right';
      } else if (diff >= 135 && diff < 225) {
        direction = 'back';
      } else {
        direction = 'left';
      }
    }
  }

  return { nearestPOI, direction, distance: minDistance };
};
