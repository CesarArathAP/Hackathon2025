const express = require('express');
const router = express.Router();
const { Usuario, Diagnostico, Pregunta, Respuesta, Agenda, Estado, Municipio } = require('../models/modelos');

// Ruta de estado
router.get('/status', (req, res) => {
  res.json({ status: 'ok' });
});

// ============================================
// RUTAS DE USUARIOS
// ============================================
router.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.getAll();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/usuarios/:id', async (req, res) => {
  try {
    const usuario = await Usuario.getById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// RUTAS DE DIAGNÓSTICOS
// ============================================
router.get('/diagnosticos', async (req, res) => {
  try {
    const diagnosticos = await Diagnostico.getAll();
    res.json(diagnosticos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/diagnosticos/usuario/:id', async (req, res) => {
  try {
    const diagnosticos = await Diagnostico.getByUsuario(req.params.id);
    res.json(diagnosticos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// RUTAS DE PREGUNTAS
// ============================================
router.get('/preguntas', async (req, res) => {
  try {
    const preguntas = await Pregunta.getAll();
    res.json(preguntas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// RUTAS DE RESPUESTAS
// ============================================
router.get('/respuestas/diagnostico/:id', async (req, res) => {
  try {
    const respuestas = await Respuesta.getByDiagnostico(req.params.id);
    res.json(respuestas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// RUTAS DE AGENDA
// ============================================
router.get('/agenda', async (req, res) => {
  try {
    const citas = await Agenda.getAll();
    res.json(citas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/agenda/usuario/:id', async (req, res) => {
  try {
    const citas = await Agenda.getByUsuario(req.params.id);
    res.json(citas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// RUTAS DE ESTADOS Y MUNICIPIOS
// ============================================
router.get('/estados', async (req, res) => {
  try {
    const estados = await Estado.getAll();
    res.json(estados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/municipios/estado/:id', async (req, res) => {
  try {
    const municipios = await Municipio.getByEstado(req.params.id);
    res.json(municipios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;