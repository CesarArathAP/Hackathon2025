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
    const { id_usuario, nombre, tiempo = new Date(), contactado = 1 } = diagnosticoData;
    try {
      const sql = `INSERT INTO diagnosticos (id_usuario, nombre, tiempo, contactado) 
                   VALUES (?, ?, ?, ?)`;
      const result = await query(sql, [id_usuario, nombre, tiempo, contactado]);
      return result.insertId;
    } catch (error) {
      // Si el campo contactado no existe, insertar sin él
      if (error.message.includes('contactado')) {
        const sql = `INSERT INTO diagnosticos (id_usuario, nombre, tiempo) 
                     VALUES (?, ?, ?)`;
        const result = await query(sql, [id_usuario, nombre, tiempo]);
        return result.insertId;
      }
      throw error;
    }
  },

  // Actualizar diagnóstico
  async update(id, diagnosticoData) {
    const { nombre, tiempo, contactado } = diagnosticoData;
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
    if (contactado !== undefined) {
      updates.push('contactado = ?');
      values.push(contactado);
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
  },

  // Obtener datos del dashboard con joins
  async getDashboardData() {
    try {
      const sql = `
        SELECT 
          d.id_diagnostico,
          d.nombre as nombre_archivo,
          d.tiempo,
          COALESCE(d.contactado, 1) as contactado,
          u.id_usuario,
          u.nombre as nombre_usuario,
          u.email,
          u.telefono,
          m.nombre as nombre_municipio
        FROM diagnosticos d
        INNER JOIN usuarios u ON d.id_usuario = u.id_usuario
        INNER JOIN municipios m ON u.id_municipios = m.id
        ORDER BY d.tiempo DESC
      `;
      return await query(sql);
    } catch (error) {
      // Si el campo contactado no existe, intentar sin él
      if (error.message.includes('contactado')) {
        const sql = `
          SELECT 
            d.id_diagnostico,
            d.nombre as nombre_archivo,
            d.tiempo,
            1 as contactado,
            u.id_usuario,
            u.nombre as nombre_usuario,
            u.email,
            u.telefono,
            m.nombre as nombre_municipio
          FROM diagnosticos d
          INNER JOIN usuarios u ON d.id_usuario = u.id_usuario
          INNER JOIN municipios m ON u.id_municipios = m.id
          ORDER BY d.tiempo DESC
        `;
        return await query(sql);
      }
      throw error;
    }
  },

  // Marcar como contactado
  async marcarContactado(id) {
    try {
      const sql = 'UPDATE diagnosticos SET contactado = 0 WHERE id_diagnostico = ?';
      await query(sql, [id]);
      return await this.getById(id);
    } catch (error) {
      // Si el campo contactado no existe, lanzar error informativo
      if (error.message.includes('contactado')) {
        throw new Error('El campo contactado no existe en la tabla. Ejecuta el script add_contactado_field.sql');
      }
      throw error;
    }
  }
};

module.exports = Diagnostico;

