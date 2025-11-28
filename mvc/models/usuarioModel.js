const { query } = require('../db/config');

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
    const { email, password_hash, nombre, rol = 'comercial', telefono, id_municipios } = usuarioData;
    const sql = `INSERT INTO usuarios (email, password_hash, nombre, rol, telefono, id_municipios) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    const result = await query(sql, [email, password_hash, nombre, rol, telefono, id_municipios]);
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

module.exports = Usuario;

