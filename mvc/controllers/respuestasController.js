const express = require('express');
const router = express.Router();
const { Respuesta } = require('../models/modelos');

// Obtener respuestas por diagnóstico
router.get('/diagnostico/:id', async (req, res) => {
  try {
    const respuestas = await Respuesta.getByDiagnostico(req.params.id);
    res.json(respuestas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

