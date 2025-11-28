const { query } = require('../db/config');

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

module.exports = Municipio;

