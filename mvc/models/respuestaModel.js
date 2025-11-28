const { query } = require('../db/config');

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

module.exports = Respuesta;

