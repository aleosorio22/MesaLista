const db = require('../config/database');

exports.create = async (clienteData) => {
    const { nombre, apellido, telefono, correo } = clienteData;
    
    const query = `
        INSERT INTO clientes (nombre, apellido, telefono, correo)
        VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
        nombre,
        apellido,
        telefono,
        correo
    ]);
    
    return result.insertId;
};

exports.findById = async (id) => {
    const [rows] = await db.execute(
        'SELECT * FROM clientes WHERE id = ?',
        [id]
    );
    return rows[0];
};

exports.findByEmail = async (correo) => {
    const [rows] = await db.execute(
        'SELECT * FROM clientes WHERE correo = ?',
        [correo]
    );
    return rows[0];
};

exports.update = async (id, clienteData) => {
    // Construir la consulta dinámicamente basada en los campos proporcionados
    const fields = [];
    const values = [];
    
    if (clienteData.nombre !== undefined) {
        fields.push('nombre = ?');
        values.push(clienteData.nombre);
    }
    
    if (clienteData.apellido !== undefined) {
        fields.push('apellido = ?');
        values.push(clienteData.apellido);
    }
    
    if (clienteData.telefono !== undefined) {
        fields.push('telefono = ?');
        values.push(clienteData.telefono);
    }
    
    if (clienteData.correo !== undefined) {
        fields.push('correo = ?');
        values.push(clienteData.correo);
    }
    
    // Si no hay campos para actualizar, retornar
    if (fields.length === 0) return true;
    
    // Agregar el ID al final de los valores
    values.push(id);
    
    const query = `UPDATE clientes SET ${fields.join(', ')} WHERE id = ?`;
    
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
};

exports.delete = async (id) => {
    const [result] = await db.execute(
        'DELETE FROM clientes WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
};

exports.getAll = async () => {
    const [rows] = await db.execute('SELECT * FROM clientes');
    return rows;
};