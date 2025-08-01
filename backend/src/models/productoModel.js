const db = require('../config/database');

exports.create = async (productoData) => {
    const { nombre, precio, activo } = productoData;
    
    const query = `
        INSERT INTO productos (nombre, precio, activo)
        VALUES (?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
        nombre,
        precio,
        activo !== undefined ? activo : true // Por defecto activo
    ]);
    
    return result.insertId;
};

exports.findById = async (id) => {
    const [rows] = await db.execute(
        'SELECT * FROM productos WHERE id = ?',
        [id]
    );
    return rows[0];
};

exports.findByNombre = async (nombre) => {
    const [rows] = await db.execute(
        'SELECT * FROM productos WHERE nombre = ?',
        [nombre]
    );
    return rows[0];
};

exports.update = async (id, productoData) => {
    // Construir la consulta dinámicamente basada en los campos proporcionados
    const fields = [];
    const values = [];
    
    if (productoData.nombre !== undefined) {
        fields.push('nombre = ?');
        values.push(productoData.nombre);
    }
    
    if (productoData.precio !== undefined) {
        fields.push('precio = ?');
        values.push(productoData.precio);
    }
    
    if (productoData.activo !== undefined) {
        fields.push('activo = ?');
        values.push(productoData.activo);
    }
    
    // Si no hay campos para actualizar, retornar
    if (fields.length === 0) return true;
    
    // Agregar el ID al final de los valores
    values.push(id);
    
    const query = `UPDATE productos SET ${fields.join(', ')} WHERE id = ?`;
    
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
};

exports.delete = async (id) => {
    const [result] = await db.execute(
        'DELETE FROM productos WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
};

exports.getAll = async (includeInactive = false) => {
    let query = 'SELECT * FROM productos';
    
    if (!includeInactive) {
        query += ' WHERE activo = TRUE';
    }
    
    const [rows] = await db.execute(query);
    return rows;
};