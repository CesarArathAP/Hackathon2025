// Archivo principal que exporta todos los modelos
// Mantiene compatibilidad con el código existente

const Usuario = require('./usuarioModel');
const Diagnostico = require('./diagnosticoModel');
const Pregunta = require('./preguntaModel');
const Respuesta = require('./respuestaModel');
const Agenda = require('./agendaModel');
const Estado = require('./estadoModel');
const Municipio = require('./municipioModel');

// Exportar todos los modelos (mantiene la misma estructura que antes)
module.exports = {
  Usuario,
  Diagnostico,
  Pregunta,
  Respuesta,
  Agenda,
  Estado,
  Municipio
};
