const { query } = require('../db/config');

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

module.exports = Diagnostico;

