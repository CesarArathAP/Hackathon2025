const express = require('express');
const router = express.Router();
const { Pregunta } = require('../models/modelos');

// Obtener todas las preguntas
router.get('/', async (req, res) => {
  try {
    const preguntas = await Pregunta.getAll();
    res.json(preguntas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

