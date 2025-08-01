const db = require('../config/database');
const bcrypt = require('bcryptjs');

exports.create = async (userData) => {
    const { nombre, correo, contraseña, rol = 'editor' } = userData;
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    
    const query = `
        INSERT INTO usuarios (nombre, correo, contraseña, rol)
        VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
        nombre,
        correo,
        hashedPassword,
        rol
    ]);
    
    return result.insertId;
};

exports.findByEmail = async (correo) => {
    const [rows] = await db.execute(
        'SELECT * FROM usuarios WHERE correo = ?',
        [correo]
    );
    return rows[0];
};

exports.findById = async (id) => {
    const [rows] = await db.execute(
        'SELECT id, nombre, correo, rol FROM usuarios WHERE id = ?',
        [id]
    );
    return rows[0];
};

exports.update = async (id, userData) => {
    const { nombre, correo, rol } = userData;
    const [result] = await db.execute(
        `UPDATE usuarios
         SET nombre = ?, correo = ?, rol = ?
         WHERE id = ?`,
        [nombre, correo, rol, id]
    );
    return result.affectedRows > 0;
};

exports.getAll = async () => {
    const [rows] = await db.execute(
        'SELECT id, nombre, correo, rol FROM usuarios'
    );
    return rows;
};

exports.hasAnyUser = async () => {
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM usuarios');
    return rows[0].count > 0;
};

exports.getFullUserById = async (id) => {
    const [rows] = await db.execute(
        'SELECT * FROM usuarios WHERE id = ?',
        [id]
    );
    return rows[0];
};