const express = require('express');
const router = express.Router();
const Diagnostico = require('../models/diagnosticoModel');
const { query } = require('../db/config');

// Obtener datos del dashboard
router.get('/data', async (req, res) => {
  try {
    const diagnosticos = await Diagnostico.getDashboardData();
    
    // Formatear los datos para el frontend
    const datosFormateados = diagnosticos.map(d => ({
      id_diagnostico: d.id_diagnostico,
      municipality: d.nombre_municipio,
      time: d.tiempo,
      contactInfo: {
        nombre: d.nombre_usuario,
        email: d.email,
        telefono: d.telefono
      },
      status: d.contactado === 1 ? 'pendiente' : 'contactado',
      statusValue: d.contactado,
      report: d.nombre_archivo
    }));

    // Obtener estadísticas
    const totalDiagnosticos = diagnosticos.length;
    const pendientes = diagnosticos.filter(d => d.contactado === 1).length;
    const contactados = diagnosticos.filter(d => d.contactado === 0).length;

    res.json({
      success: true,
      data: datosFormateados,
      stats: {
        total: totalDiagnosticos,
        pendientes: pendientes,
        contactados: contactados
      }
    });
  } catch (error) {
    console.error('Error al obtener datos del dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

// Marcar diagnóstico como contactado
router.put('/contactado/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const diagnostico = await Diagnostico.marcarContactado(id);
    
    if (!diagnostico) {
      return res.status(404).json({ error: 'Diagnóstico no encontrado' });
    }

    res.json({
      success: true,
      message: 'Diagnóstico marcado como contactado',
      diagnostico
    });
  } catch (error) {
    console.error('Error al marcar como contactado:', error);
    res.status(500).json({ error: error.message });
  }
});

// Marcar diagnóstico como pendiente
router.put('/pendiente/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const diagnostico = await Diagnostico.update(id, { contactado: 1 });
    
    if (!diagnostico) {
      return res.status(404).json({ error: 'Diagnóstico no encontrado' });
    }

    res.json({
      success: true,
      message: 'Diagnóstico marcado como pendiente',
      diagnostico
    });
  } catch (error) {
    console.error('Error al marcar como pendiente:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

