const usuarioModel = require('../models/usuarioModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Crear el primer usuario administrador
exports.createRootUser = async (req, res) => {
    try {
        // Verificar si ya existe algún usuario
        const hasUsers = await usuarioModel.hasAnyUser();
        if (hasUsers) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un usuario en el sistema. No se puede crear el usuario root.'
            });
        }

        // Crear usuario root
        const rootUser = {
            nombre: 'Administrador',
            correo: 'admin@mesalista.com',
            contraseña: 'mesalista123',
            rol: 'admin'
        };

        const userId = await usuarioModel.create(rootUser);

        res.status(201).json({
            success: true,
            message: 'Usuario administrador creado exitosamente',
            data: { id: userId }
        });
    } catch (error) {
        console.error('Error al crear usuario root:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear el usuario administrador',
            error: error.message
        });
    }
};

// Crear un nuevo usuario
exports.createUser = async (req, res) => {
    try {
        // Aceptar tanto email/password como correo/contraseña
        const nombre = req.body.nombre;
        const correo = req.body.correo || req.body.email;
        const contraseña = req.body.contraseña || req.body.password;
        const rol = req.body.rol;

        // Validar datos
        if (!nombre || !correo || !contraseña) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios'
            });
        }

        // Verificar si el correo ya existe
        const existingUser = await usuarioModel.findByEmail(correo);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El correo ya está registrado'
            });
        }

        // Crear usuario
        const userId = await usuarioModel.create({
            nombre,
            correo,
            contraseña,
            rol
        });

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: { id: userId }
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear el usuario',
            error: error.message
        });
    }
};

// Iniciar sesión
exports.login = async (req, res) => {
    try {
        const { correo, contraseña } = req.body;

        // Validar datos
        if (!correo || !contraseña) {
            return res.status(400).json({
                success: false,
                message: 'Correo y contraseña son obligatorios'
            });
        }

        // Buscar usuario por correo
        const user = await usuarioModel.findByEmail(correo);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(contraseña, user.contraseña);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Generar token JWT
        const token = jwt.sign(
            { id: user.id, rol: user.rol },
            process.env.JWT_SECRET,
            { expiresIn: '20d' }
        );

        res.json({
            success: true,
            message: 'Inicio de sesión exitoso',
            data: {
                token,
                user: {
                    id: user.id,
                    nombre: user.nombre,
                    correo: user.correo,
                    rol: user.rol
                }
            }
        });
    } catch (error) {
        console.error('Error en inicio de sesión:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el inicio de sesión',
            error: error.message
        });
    }
};

// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
    try {
        const users = await usuarioModel.getAll();
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los usuarios',
            error: error.message
        });
    }
};

// Obtener usuario por ID
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await usuarioModel.findById(id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el usuario',
            error: error.message
        });
    }
};

// Obtener usuario completo por ID (incluyendo contraseña)
exports.getFullUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await usuarioModel.getFullUserById(id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error al obtener usuario completo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el usuario completo',
            error: error.message
        });
    }
};

// Actualizar usuario
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, correo, rol } = req.body;
        
        // Verificar si el usuario existe
        const existingUser = await usuarioModel.findById(id);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }
        
        // Actualizar usuario
        const updated = await usuarioModel.update(id, { nombre, correo, rol });
        
        if (!updated) {
            return res.status(400).json({
                success: false,
                message: 'No se pudo actualizar el usuario'
            });
        }
        
        res.json({
            success: true,
            message: 'Usuario actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el usuario',
            error: error.message
        });
    }
};