const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { Usuario } = require('../models/modelos');

// Función de registro de usuario
const handleRegistro = async (req, res) => {
  try {
    const { email, password, nombre, telefono, id_municipio } = req.body;

    // Validar campos requeridos con mensajes específicos
    if (!email) {
      return res.status(400).json({ error: 'El correo electrónico es requerido' });
    }
    if (!password) {
      return res.status(400).json({ error: 'La contraseña es requerida' });
    }
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }
    if (!telefono) {
      return res.status(400).json({ error: 'El teléfono es requerido' });
    }
    if (!id_municipio) {
      return res.status(400).json({ error: 'Debes seleccionar un municipio' });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.getByEmail(email);
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Convertir id_municipio a número si viene como string
    const idMunicipioNum = parseInt(id_municipio, 10);
    if (isNaN(idMunicipioNum)) {
      return res.status(400).json({ error: 'El ID del municipio no es válido' });
    }

    // Crear el usuario con id_municipio
    const nuevoUsuarioId = await Usuario.create({
      email,
      password_hash,
      nombre,
      telefono: telefono.toString(),
      rol: 'comercial',
      id_municipios: idMunicipioNum
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
        nombre: usuarioCreado.nombre || nombre,
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

