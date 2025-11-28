const express = require('express');
const router = express.Router();

// Importar controladores
const authController = require('./authController');
const usuariosController = require('./usuariosController');
const diagnosticosController = require('./diagnosticosController');
const preguntasController = require('./preguntasController');
const respuestasController = require('./respuestasController');
const agendaController = require('./agendaController');
const estadosController = require('./estadosController');

// Ruta de estado general
router.get('/status', (req, res) => {
  res.json({ status: 'ok' });
});

// Montar controladores en sus respectivas rutas
router.use('/auth', authController);
router.use('/usuarios', usuariosController);
router.use('/diagnosticos', diagnosticosController);
router.use('/preguntas', preguntasController);
router.use('/respuestas', respuestasController);
router.use('/agenda', agendaController);
router.use('/', estadosController); // Estados y municipios en la raíz

module.exports = router;
