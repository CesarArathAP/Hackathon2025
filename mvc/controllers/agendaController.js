const express = require('express');
const router = express.Router();
const { Agenda } = require('../models/modelos');

// Obtener toda la agenda
router.get('/', async (req, res) => {
  try {
    const citas = await Agenda.getAll();
    res.json(citas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener agenda por usuario
router.get('/usuario/:id', async (req, res) => {
  try {
    const citas = await Agenda.getByUsuario(req.params.id);
    res.json(citas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

