const { query } = require('../db/config');

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

module.exports = Estado;

