const express = require('express');
const router = express.Router();
const { Diagnostico } = require('../models/modelos');
const path = require('path');
const fs = require('fs').promises;

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

// Obtener un diagnóstico por ID
router.get('/:id', async (req, res) => {
  try {
    const diagnostico = await Diagnostico.getById(req.params.id);
    if (!diagnostico) {
      return res.status(404).json({ error: 'Diagnóstico no encontrado' });
    }
    res.json(diagnostico);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Descargar PDF de un diagnóstico
router.get('/:id/pdf', async (req, res) => {
  try {
    const diagnostico = await Diagnostico.getById(req.params.id);
    if (!diagnostico) {
      return res.status(404).json({ error: 'Diagnóstico no encontrado' });
    }

    // El nombre del PDF está guardado en el campo 'nombre'
    const pdfPath = path.join(__dirname, '../../assets/diagnosticos', diagnostico.nombre);
    
    // Verificar si el archivo existe
    try {
      await fs.access(pdfPath);
    } catch {
      return res.status(404).json({ error: 'Archivo PDF no encontrado' });
    }

    // Enviar el archivo
    res.download(pdfPath, diagnostico.nombre, (err) => {
      if (err) {
        console.error('Error al descargar PDF:', err);
        res.status(500).json({ error: 'Error al descargar el archivo' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear nuevo diagnóstico (solo guarda referencia, el PDF se crea en otra ruta)
router.post('/', async (req, res) => {
  try {
    const { id_usuario, nombre_archivo } = req.body;
    
    // Validar datos requeridos
    if (!id_usuario || !nombre_archivo) {
      return res.status(400).json({ 
        error: 'El id_usuario y nombre_archivo son requeridos' 
      });
    }

    // Crear el registro en la BD con solo el nombre del archivo
    const id = await Diagnostico.create({
      id_usuario,
      nombre: nombre_archivo, // Solo el nombre del archivo PDF
      tiempo: new Date()
    });

    res.status(201).json({
      success: true,
      id_diagnostico: id,
      nombre_archivo: nombre_archivo,
      message: 'Diagnóstico registrado exitosamente'
    });
  } catch (error) {
    console.error('Error al crear diagnóstico:', error);
    res.status(500).json({ error: error.message });
  }
});

// Actualizar diagnóstico
router.put('/:id', async (req, res) => {
  try {
    const diagnostico = await Diagnostico.update(req.params.id, req.body);
    if (!diagnostico) {
      return res.status(404).json({ error: 'Diagnóstico no encontrado' });
    }
    res.json({
      success: true,
      diagnostico,
      message: 'Diagnóstico actualizado exitosamente'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar diagnóstico y su PDF
router.delete('/:id', async (req, res) => {
  try {
    const diagnostico = await Diagnostico.getById(req.params.id);
    if (!diagnostico) {
      return res.status(404).json({ error: 'Diagnóstico no encontrado' });
    }

    // Eliminar el archivo PDF si existe
    const pdfPath = path.join(__dirname, '../../assets/diagnosticos', diagnostico.nombre);
    try {
      await fs.unlink(pdfPath);
      console.log(`PDF eliminado: ${diagnostico.nombre}`);
    } catch (err) {
      console.warn(`No se pudo eliminar el PDF: ${err.message}`);
    }

    // Eliminar el registro de la BD
    await Diagnostico.delete(req.params.id);
    
    res.json({
      success: true,
      message: 'Diagnóstico eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;