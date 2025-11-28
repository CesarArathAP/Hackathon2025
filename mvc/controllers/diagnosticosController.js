const express = require('express');
const router = express.Router();
const { Diagnostico } = require('../models/modelos');

// Obtener todos los diagnósticos
router.get('/', async (req, res) => {
  try {
    const diagnosticos = await Diagnostico.getAll();
    res.json(diagnosticos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener diagnósticos por usuario
router.get('/usuario/:id', async (req, res) => {
  try {
    const diagnosticos = await Diagnostico.getByUsuario(req.params.id);
    res.json(diagnosticos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

