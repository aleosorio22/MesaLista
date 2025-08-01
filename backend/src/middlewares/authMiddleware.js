const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuarioModel');

const authMiddleware = async (req, res, next) => {
    try {
        // Verificar formato del header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Formato de token inválido' });
        }

        const token = authHeader.split(' ')[1];
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Verificar si el usuario existe
            const user = await usuarioModel.findById(decoded.id);
            if (!user) {
                return res.status(403).json({ message: 'Usuario no encontrado' });
            }

            // Agregar información del usuario al request
            req.user = {
                id: decoded.id,
                rol: decoded.rol
            };
            
            next();
        } catch (jwtError) {
            return res.status(401).json({
                message: 'Token inválido o expirado',
                error: jwtError.message
            });
        }
    } catch (error) {
        console.error('Error en autenticación:', error);
        return res.status(500).json({
            message: 'Error en la autenticación',
            error: error.message
        });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.rol === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado: se requiere rol de administrador' });
    }
};

const isEditorOrAdmin = (req, res, next) => {
    if (req.user.rol === 'admin' || req.user.rol === 'editor') {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requiere rol de administrador o editor'
    });
};

// Middleware para operaciones de lectura de clientes (todos los roles)
const canReadClients = (req, res, next) => {
    // Todos los roles autenticados pueden leer clientes
    return next();
};

// Middleware para operaciones de escritura de clientes (admin y editor)
const canWriteClients = (req, res, next) => {
    if (req.user.rol === 'admin' || req.user.rol === 'editor') {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Solo administradores y editores pueden modificar clientes'
    });
};

// Middleware para crear reservaciones (todos los roles autenticados)
const canCreateReservations = (req, res, next) => {
    // Todos los roles autenticados pueden crear reservaciones
    return next();
};

// Middleware para editar/eliminar reservaciones
const canModifyReservation = async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.rol;
    
    // Admin y editor pueden modificar cualquier reservación
    if (userRole === 'admin' || userRole === 'editor') {
        return next();
    }
    
    // Visualizador solo puede modificar sus propias reservaciones
    if (userRole === 'visualizador') {
        try {
            const reservacionModel = require('../models/reservacionModel');
            const reservacion = await reservacionModel.findById(id);
            
            if (!reservacion) {
                return res.status(404).json({
                    success: false,
                    message: 'Reservación no encontrada'
                });
            }
            
            if (reservacion.usuario_id === userId) {
                return next();
            } else {
                return res.status(403).json({
                    success: false,
                    message: 'Solo puedes modificar tus propias reservaciones'
                });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error al verificar permisos',
                error: error.message
            });
        }
    }
    
    return res.status(403).json({
        success: false,
        message: 'Acceso denegado'
    });
};

module.exports = {
    authMiddleware,
    isAdmin,
    isEditorOrAdmin,
    canReadClients,
    canWriteClients,
    canCreateReservations,
    canModifyReservation
};