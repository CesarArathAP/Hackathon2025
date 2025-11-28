const { query, getConnection } = require('../db/config');

// ============================================
// MODELO DE USUARIOS
// ============================================
const Usuario = {
  // Obtener todos los usuarios
  async getAll() {
    const sql = 'SELECT * FROM usuarios WHERE activo = 1';
    return await query(sql);
  },

  // Obtener usuario por ID
  async getById(id) {
    const sql = 'SELECT * FROM usuarios WHERE id_usuario = ? AND activo = 1';
    const results = await query(sql, [id]);
    return results[0] || null;
  },

  // Obtener usuario por email
  async getByEmail(email) {
    const sql = 'SELECT * FROM usuarios WHERE email = ? AND activo = 1';
    const results = await query(sql, [email]);
    return results[0] || null;
  },

  // Crear nuevo usuario
  async create(usuarioData) {
    const { email, password_hash, nombre, rol = 'comercial', telefono } = usuarioData;
    const sql = `INSERT INTO usuarios (email, password_hash, nombre, rol, telefono) 
                 VALUES (?, ?, ?, ?, ?)`;
    const result = await query(sql, [email, password_hash, nombre, rol, telefono]);
    return result.insertId;
  },

  // Actualizar usuario
  async update(id, usuarioData) {
    const { email, password_hash, nombre, rol, telefono, activo } = usuarioData;
    const updates = [];
    const values = [];

    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (password_hash !== undefined) {
      updates.push('password_hash = ?');
      values.push(password_hash);
    }
    if (nombre !== undefined) {
      updates.push('nombre = ?');
      values.push(nombre);
    }
    if (rol !== undefined) {
      updates.push('rol = ?');
      values.push(rol);
    }
    if (telefono !== undefined) {
      updates.push('telefono = ?');
      values.push(telefono);
    }
    if (activo !== undefined) {
      updates.push('activo = ?');
      values.push(activo);
    }

    if (updates.length === 0) return null;

    values.push(id);
    const sql = `UPDATE usuarios SET ${updates.join(', ')} WHERE id_usuario = ?`;
    await query(sql, values);
    return await this.getById(id);
  },

  // Eliminar usuario (soft delete)
  async delete(id) {
    const sql = 'UPDATE usuarios SET activo = 0 WHERE id_usuario = ?';
    await query(sql, [id]);
    return true;
  }
};

// ============================================
// MODELO DE DIAGNÓSTICOS
// ============================================
const Diagnostico = {
  // Obtener todos los diagnósticos
  async getAll() {
    const sql = 'SELECT * FROM diagnosticos ORDER BY tiempo DESC';
    return await query(sql);
  },

  // Obtener diagnóstico por ID
  async getById(id) {
    const sql = 'SELECT * FROM diagnosticos WHERE id_diagnostico = ?';
    const results = await query(sql, [id]);
    return results[0] || null;
  },

  // Obtener diagnósticos por usuario
  async getByUsuario(idUsuario) {
    const sql = 'SELECT * FROM diagnosticos WHERE id_usuario = ? ORDER BY tiempo DESC';
    return await query(sql, [idUsuario]);
  },

  // Crear nuevo diagnóstico
  async create(diagnosticoData) {
    const { id_usuario, nombre, tiempo = new Date() } = diagnosticoData;
    const sql = `INSERT INTO diagnosticos (id_usuario, nombre, tiempo) 
                 VALUES (?, ?, ?)`;
    const result = await query(sql, [id_usuario, nombre, tiempo]);
    return result.insertId;
  },

  // Actualizar diagnóstico
  async update(id, diagnosticoData) {
    const { nombre, tiempo } = diagnosticoData;
    const updates = [];
    const values = [];

    if (nombre !== undefined) {
      updates.push('nombre = ?');
      values.push(nombre);
    }
    if (tiempo !== undefined) {
      updates.push('tiempo = ?');
      values.push(tiempo);
    }

    if (updates.length === 0) return null;

    values.push(id);
    const sql = `UPDATE diagnosticos SET ${updates.join(', ')} WHERE id_diagnostico = ?`;
    await query(sql, values);
    return await this.getById(id);
  },

  // Eliminar diagnóstico
  async delete(id) {
    const sql = 'DELETE FROM diagnosticos WHERE id_diagnostico = ?';
    await query(sql, [id]);
    return true;
  }
};

// ============================================
// MODELO DE PREGUNTAS
// ============================================
const Pregunta = {
  // Obtener todas las preguntas
  async getAll() {
    const sql = 'SELECT * FROM preguntas ORDER BY id';
    return await query(sql);
  },

  // Obtener pregunta por ID
  async getById(id) {
    const sql = 'SELECT * FROM preguntas WHERE id = ?';
    const results = await query(sql, [id]);
    return results[0] || null;
  },

  // Crear nueva pregunta
  async create(preguntaData) {
    const { texto_pregunta, tipo_respuesta, opciones_respuesta } = preguntaData;
    const sql = `INSERT INTO preguntas (texto_pregunta, tipo_respuesta, opciones_respuesta) 
                 VALUES (?, ?, ?)`;
    const opcionesJson = opciones_respuesta ? JSON.stringify(opciones_respuesta) : null;
    const result = await query(sql, [texto_pregunta, tipo_respuesta, opcionesJson]);
    return result.insertId;
  },

  // Actualizar pregunta
  async update(id, preguntaData) {
    const { texto_pregunta, tipo_respuesta, opciones_respuesta } = preguntaData;
    const updates = [];
    const values = [];

    if (texto_pregunta !== undefined) {
      updates.push('texto_pregunta = ?');
      values.push(texto_pregunta);
    }
    if (tipo_respuesta !== undefined) {
      updates.push('tipo_respuesta = ?');
      values.push(tipo_respuesta);
    }
    if (opciones_respuesta !== undefined) {
      updates.push('opciones_respuesta = ?');
      values.push(JSON.stringify(opciones_respuesta));
    }

    if (updates.length === 0) return null;

    values.push(id);
    const sql = `UPDATE preguntas SET ${updates.join(', ')} WHERE id = ?`;
    await query(sql, values);
    return await this.getById(id);
  },

  // Eliminar pregunta
  async delete(id) {
    const sql = 'DELETE FROM preguntas WHERE id = ?';
    await query(sql, [id]);
    return true;
  }
};

// ============================================
// MODELO DE RESPUESTAS
// ============================================
const Respuesta = {
  // Obtener todas las respuestas
  async getAll() {
    const sql = 'SELECT * FROM respuestas ORDER BY id';
    return await query(sql);
  },

  // Obtener respuesta por ID
  async getById(id) {
    const sql = 'SELECT * FROM respuestas WHERE id = ?';
    const results = await query(sql, [id]);
    return results[0] || null;
  },

  // Obtener respuestas por diagnóstico
  async getByDiagnostico(diagnosticoId) {
    const sql = 'SELECT * FROM respuestas WHERE diagnostico_id = ?';
    return await query(sql, [diagnosticoId]);
  },

  // Obtener respuestas por usuario
  async getByUsuario(usuarioId) {
    const sql = 'SELECT * FROM respuestas WHERE usuarios_id = ?';
    return await query(sql, [usuarioId]);
  },

  // Crear nueva respuesta
  async create(respuestaData) {
    const { diagnostico_id, pregunta_id, usuarios_id, respuesta } = respuestaData;
    const sql = `INSERT INTO respuestas (diagnostico_id, pregunta_id, usuarios_id, respuesta) 
                 VALUES (?, ?, ?, ?)`;
    const result = await query(sql, [diagnostico_id, pregunta_id, usuarios_id, respuesta]);
    return result.insertId;
  },

  // Actualizar respuesta
  async update(id, respuestaData) {
    const { respuesta } = respuestaData;
    const sql = 'UPDATE respuestas SET respuesta = ? WHERE id = ?';
    await query(sql, [respuesta, id]);
    return await this.getById(id);
  },

  // Eliminar respuesta
  async delete(id) {
    const sql = 'DELETE FROM respuestas WHERE id = ?';
    await query(sql, [id]);
    return true;
  }
};

// ============================================
// MODELO DE AGENDA
// ============================================
const Agenda = {
  // Obtener todas las citas
  async getAll() {
    const sql = 'SELECT * FROM agenda ORDER BY fecha, hora';
    return await query(sql);
  },

  // Obtener cita por ID
  async getById(id) {
    const sql = 'SELECT * FROM agenda WHERE id = ?';
    const results = await query(sql, [id]);
    return results[0] || null;
  },

  // Obtener citas por usuario
  async getByUsuario(usuarioId) {
    const sql = 'SELECT * FROM agenda WHERE usuarios_id = ? ORDER BY fecha, hora';
    return await query(sql, [usuarioId]);
  },

  // Obtener citas por fecha
  async getByFecha(fecha) {
    const sql = 'SELECT * FROM agenda WHERE fecha = ? ORDER BY hora';
    return await query(sql, [fecha]);
  },

  // Crear nueva cita
  async create(agendaData) {
    const { fecha, hora, usuarios_id } = agendaData;
    const sql = `INSERT INTO agenda (fecha, hora, usuarios_id) 
                 VALUES (?, ?, ?)`;
    const result = await query(sql, [fecha, hora, usuarios_id]);
    return result.insertId;
  },

  // Actualizar cita
  async update(id, agendaData) {
    const { fecha, hora, usuarios_id } = agendaData;
    const updates = [];
    const values = [];

    if (fecha !== undefined) {
      updates.push('fecha = ?');
      values.push(fecha);
    }
    if (hora !== undefined) {
      updates.push('hora = ?');
      values.push(hora);
    }
    if (usuarios_id !== undefined) {
      updates.push('usuarios_id = ?');
      values.push(usuarios_id);
    }

    if (updates.length === 0) return null;

    values.push(id);
    const sql = `UPDATE agenda SET ${updates.join(', ')} WHERE id = ?`;
    await query(sql, values);
    return await this.getById(id);
  },

  // Eliminar cita
  async delete(id) {
    const sql = 'DELETE FROM agenda WHERE id = ?';
    await query(sql, [id]);
    return true;
  }
};

// ============================================
// MODELO DE ESTADOS
// ============================================
const Estado = {
  // Obtener todos los estados
  async getAll() {
    const sql = 'SELECT * FROM estados ORDER BY nombre_estado';
    return await query(sql);
  },

  // Obtener estado por ID
  async getById(id) {
    const sql = 'SELECT * FROM estados WHERE id_estado = ?';
    const results = await query(sql, [id]);
    return results[0] || null;
  }
};

// ============================================
// MODELO DE MUNICIPIOS
// ============================================
const Municipio = {
  // Obtener todos los municipios
  async getAll() {
    const sql = 'SELECT * FROM municipios ORDER BY nombre';
    return await query(sql);
  },

  // Obtener municipio por ID
  async getById(id) {
    const sql = 'SELECT * FROM municipios WHERE id = ?';
    const results = await query(sql, [id]);
    return results[0] || null;
  },

  // Obtener municipios por estado
  async getByEstado(estadoId) {
    const sql = 'SELECT * FROM municipios WHERE id_estado = ? ORDER BY nombre';
    return await query(sql, [estadoId]);
  }
};

// Exportar todos los modelos
module.exports = {
  Usuario,
  Diagnostico,
  Pregunta,
  Respuesta,
  Agenda,
  Estado,
  Municipio
};

