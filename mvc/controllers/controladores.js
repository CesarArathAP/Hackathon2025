const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
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
// RUTAS DE AUTENTICACIÓN
// ============================================

// Función de registro de usuario
const handleRegistro = async (req, res) => {
  try {
    const { email, password, nombre, telefono, estado, municipio } = req.body;

    // Validar campos requeridos
    if (!email || !password || !nombre || !telefono || !estado || !municipio) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.getByEmail(email);
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Crear el usuario (guardamos estado y municipio en el nombre por ahora)
    // En producción, sería mejor agregar campos a la tabla
    const nombreCompleto = `${nombre} (${estado}, ${municipio})`;
    const nuevoUsuarioId = await Usuario.create({
      email,
      password_hash,
      nombre: nombreCompleto,
      telefono,
      rol: 'comercial'
    });

    // Obtener el usuario completo recién creado para autenticarlo automáticamente
    const usuarioCreado = await Usuario.getById(nuevoUsuarioId);
    
    if (!usuarioCreado) {
      return res.status(500).json({ error: 'Error al obtener usuario creado' });
    }

    // Retornar éxito con todos los datos del usuario (igual que en login)
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      usuario: {
        id: usuarioCreado.id_usuario,
        email: usuarioCreado.email,
        nombre: usuarioCreado.nombre || nombreCompleto,
        rol: usuarioCreado.rol || 'comercial'
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario: ' + error.message });
  }
};

// Registro de usuario (rutas en español e inglés)
router.post('/auth/registro', handleRegistro);
router.post('/auth/register', handleRegistro);

// Inicio de sesión
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
    }

    // Buscar usuario por email
    const usuario = await Usuario.getByEmail(email);
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Retornar éxito (sin la contraseña)
    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      usuario: {
        id: usuario.id_usuario,
        email: usuario.email,
        nombre: usuario.nombre || usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión: ' + error.message });
  }
});

// Verificar sesión actual (endpoint para obtener información del usuario autenticado)
router.get('/auth/me', async (req, res) => {
  try {
    // Por ahora, este endpoint requiere que el usuario envíe su ID en el body o query
    // En producción, deberías usar tokens JWT o sesiones
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const usuario = await Usuario.getById(userId);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      usuario: {
        id: usuario.id_usuario,
        email: usuario.email,
        nombre: usuario.nombre || usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error en /auth/me:', error);
    res.status(500).json({ error: 'Error al verificar sesión: ' + error.message });
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