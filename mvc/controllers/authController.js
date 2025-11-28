const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { Usuario } = require('../models/modelos');

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
router.post('/registro', handleRegistro);
router.post('/register', handleRegistro);

// Inicio de sesión
router.post('/login', async (req, res) => {
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
router.get('/me', async (req, res) => {
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

module.exports = router;

