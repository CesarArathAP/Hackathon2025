const { query } = require('../db/config');

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

module.exports = Agenda;

