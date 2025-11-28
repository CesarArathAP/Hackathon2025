const { query } = require('../db/config');

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

module.exports = Pregunta;

