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

// Descargar PDF de un diagnóstico (DEBE ir ANTES de /:id para que Express lo capture correctamente)
router.get('/:id/pdf', async (req, res) => {
  try {
    const diagnosticoId = req.params.id;
    console.log(`📄 Buscando PDF para diagnóstico ID: ${diagnosticoId}`);
    
    const diagnostico = await Diagnostico.getById(diagnosticoId);
    if (!diagnostico) {
      console.error(`❌ Diagnóstico con ID ${diagnosticoId} no encontrado en BD`);
      return res.status(404).json({ error: 'Diagnóstico no encontrado' });
    }
    
    console.log(`✓ Diagnóstico encontrado:`, {
      id: diagnostico.id_diagnostico,
      nombre: diagnostico.nombre,
      id_usuario: diagnostico.id_usuario
    });

    // Rutas absolutas basadas en la raíz del proyecto
    // __dirname aquí es: mvc/controllers/
    // Los PDFs ahora se guardan en mvc/assets/diagnosticos/
    const projectRoot = path.resolve(__dirname, '../..');
    const pdfPathNueva = path.join(projectRoot, 'mvc', 'assets', 'diagnosticos', diagnostico.nombre);
    const pdfPathAntigua = path.join(projectRoot, 'diagnosticos', diagnostico.nombre); // Fallback a ubicación antigua
    
    let pdfPath = null;
    
    // Intentar primero en la nueva ubicación (mvc/assets/diagnosticos)
    try {
      await fs.access(pdfPathNueva);
      pdfPath = pdfPathNueva;
      console.log(`✓ PDF encontrado en: ${pdfPathNueva}`);
    } catch (err) {
      // Si no está en la nueva ubicación, buscar en la antigua (raíz/diagnosticos)
      try {
        await fs.access(pdfPathAntigua);
        pdfPath = pdfPathAntigua;
        console.log(`✓ PDF encontrado en ubicación antigua: ${pdfPathAntigua}`);
      } catch (err2) {
        console.error('PDF no encontrado en ninguna ubicación:');
        console.error('  Nueva:', pdfPathNueva);
        console.error('  Antigua:', pdfPathAntigua);
        console.error('  Nombre en BD:', diagnostico.nombre);
        return res.status(404).json({ 
          error: 'Archivo PDF no encontrado',
          nombre: diagnostico.nombre,
          ubicaciones_buscadas: [
            pdfPathNueva,
            pdfPathAntigua
          ]
        });
      }
    }

    // Enviar el archivo para visualización en el navegador
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${diagnostico.nombre}"`);
    res.sendFile(pdfPath, (err) => {
      if (err) {
        console.error('Error al enviar PDF:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error al enviar el archivo' });
        }
      }
    });
  } catch (error) {
    console.error('Error en ruta PDF:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener un diagnóstico por ID (DEBE ir DESPUÉS de /:id/pdf)
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

    // Eliminar el archivo PDF si existe (buscar en ambas ubicaciones)
    const projectRoot = path.resolve(__dirname, '../..');
    const pdfPathNueva = path.join(projectRoot, 'mvc', 'assets', 'diagnosticos', diagnostico.nombre);
    const pdfPathAntigua = path.join(projectRoot, 'diagnosticos', diagnostico.nombre); // Fallback a ubicación antigua
    
    try {
      await fs.unlink(pdfPathNueva);
      console.log(`PDF eliminado: ${diagnostico.nombre}`);
    } catch {
      try {
        await fs.unlink(pdfPathAntigua);
        console.log(`PDF eliminado: ${diagnostico.nombre}`);
      } catch (err) {
        console.warn(`No se pudo eliminar el PDF: ${err.message}`);
      }
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