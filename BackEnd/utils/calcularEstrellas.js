const DESCRIPCIONES = {
  0: "Sin intentar",
  1: "Intento inicial",
  2: "En desarrollo",
  3: "Logro básico",
  4: "Logro avanzado",
  5: "Dominio completo",
};

const PUNTOS_POR_SCORE = { 0: 0, 1: 6, 2: 12, 3: 18, 4: 24, 5: 30 };

/**
 * Calcula el score (1-5 estrellas) según resultado del intento.
 * @param {number} preguntasCorrectas
 * @param {number} preguntasTotal
 * @param {number} numeroIntento        - 1, 2 o 3
 * @param {number} tiempoTotalSeg       - tiempo usado
 * @param {number} tiempoEstimadoMin    - tiempo estimado del desafío
 */
const calcularEstrellas = (
  preguntasCorrectas,
  preguntasTotal,
  numeroIntento,
  tiempoTotalSeg,
  tiempoEstimadoMin
) => {
  const porcentaje    = (preguntasCorrectas / preguntasTotal) * 100;
  const tiempoLimite  = tiempoEstimadoMin * 60 * 0.7;
  const primerIntento = numeroIntento === 1;
  const esRapido      = tiempoTotalSeg <= tiempoLimite;

  let score = 0;

  if (porcentaje === 0)              score = 0;
  else if (porcentaje < 50)          score = 1;
  else if (porcentaje < 100)         score = 2;
  else if (!primerIntento)           score = 3;
  else if (primerIntento && !esRapido) score = 4;
  else                               score = 5;

  return {
    score,
    descripcion:  DESCRIPCIONES[score],
    puntaje:      PUNTOS_POR_SCORE[score],
    porcentaje:   Math.round(porcentaje * 10) / 10,
    completado:   porcentaje === 100,
  };
};

module.exports = { calcularEstrellas, DESCRIPCIONES, PUNTOS_POR_SCORE };