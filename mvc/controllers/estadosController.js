const express = require('express');
const router = express.Router();
const { Estado, Municipio } = require('../models/modelos');

// Obtener todos los estados
router.get('/estados', async (req, res) => {
  try {
    const estados = await Estado.getAll();
    res.json(estados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener municipios por estado
router.get('/municipios/estado/:id', async (req, res) => {
  try {
    const municipios = await Municipio.getByEstado(req.params.id);
    res.json(municipios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

