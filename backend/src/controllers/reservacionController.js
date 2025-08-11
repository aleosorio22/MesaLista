const reservacionModel = require('../models/reservacionModel');
const clienteModel = require('../models/clienteModel');
const productoModel = require('../models/productoModel');

// Crear una nueva reservación
exports.createReservacion = async (req, res) => {
    try {
        const { 
            cliente_id, 
            fecha, 
            hora,  
            cantidad_personas, 
            area, 
            tipo_reservacion, 
            observaciones,
            total_estimada
        } = req.body;

        // Validar datos obligatorios
        if (!cliente_id || !fecha || !hora || !cantidad_personas || !area || !tipo_reservacion) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios: cliente_id, fecha, hora, cantidad_personas, area, tipo_reservacion'
            });
        }

        // Verificar si el cliente existe
        const cliente = await clienteModel.findById(cliente_id);
        if (!cliente) {
            return res.status(400).json({
                success: false,
                message: 'El cliente especificado no existe'
            });
        }

        // Obtener el ID del usuario desde el token JWT (middleware de autenticación)
        const usuario_id = req.user.id;  // Cambiar req.usuario.id a req.user.id

        // Crear la reservación
        const reservacionId = await reservacionModel.create({
            cliente_id,
            usuario_id,
            fecha,
            hora,
            cantidad_personas,
            area,
            tipo_reservacion,
            observaciones,
            total_estimada
        });

        res.status(201).json({
            success: true,
            message: 'Reservación creada exitosamente',
            data: { id: reservacionId }
        });
    } catch (error) {
        console.error('Error al crear reservación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear la reservación',
            error: error.message
        });
    }
};

// Obtener todas las reservaciones con filtros opcionales
exports.getAllReservaciones = async (req, res) => {
    try {
        // Filtros opcionales
        const filtros = {};
        
        if (req.query.fecha) filtros.fecha = req.query.fecha;
        if (req.query.cliente_id) filtros.cliente_id = req.query.cliente_id;
        if (req.query.usuario_id) filtros.usuario_id = req.query.usuario_id;
        
        const reservaciones = await reservacionModel.getAll(filtros);
        res.json({
            success: true,
            data: reservaciones
        });
    } catch (error) {
        console.error('Error al obtener reservaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las reservaciones',
            error: error.message
        });
    }
};

// Obtener reservaciones de los próximos 7 días
exports.getReservacionesProximaSemana = async (req, res) => {
    try {
        const reservaciones = await reservacionModel.getProximasSemana();
        
        // Agrupar reservaciones por fecha para mejor organización
        const reservacionesAgrupadas = reservaciones.reduce((grupos, reservacion) => {
            // Asegurar que la fecha esté en formato string YYYY-MM-DD
            let fechaKey = reservacion.fecha;
            
            // Si por alguna razón es Date, convertir a string local
            if (reservacion.fecha instanceof Date) {
                const fecha = reservacion.fecha;
                fechaKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
            } else if (typeof reservacion.fecha === 'string' && reservacion.fecha.includes('T')) {
                // Si es ISO string, extraer solo la fecha
                fechaKey = reservacion.fecha.split('T')[0];
            }
            
            if (!grupos[fechaKey]) {
                grupos[fechaKey] = [];
            }
            grupos[fechaKey].push({
                ...reservacion,
                fecha: fechaKey // Asegurar formato consistente
            });
            return grupos;
        }, {});
        
        console.log('Reservaciones agrupadas:', Object.keys(reservacionesAgrupadas)); // Para debug
        console.log('Fechas encontradas:', reservaciones.map(r => r.fecha)); // Para debug
        
        res.json({
            success: true,
            data: {
                reservaciones: reservaciones,
                reservacionesAgrupadas: reservacionesAgrupadas,
                totalReservaciones: reservaciones.length
            }
        });
    } catch (error) {
        console.error('Error al obtener reservaciones de la próxima semana:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las reservaciones de la próxima semana',
            error: error.message
        });
    }
};

// Obtener reservación por ID
exports.getReservacionById = async (req, res) => {
    try {
        const { id } = req.params;
        const reservacion = await reservacionModel.findById(id);
        
        if (!reservacion) {
            return res.status(404).json({
                success: false,
                message: 'Reservación no encontrada'
            });
        }
        
        res.json({
            success: true,
            data: reservacion
        });
    } catch (error) {
        console.error('Error al obtener reservación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la reservación',
            error: error.message
        });
    }
};

// Obtener reservación completa con productos y anticipos
exports.getReservacionCompleta = async (req, res) => {
    try {
        const { id } = req.params;
        const reservacion = await reservacionModel.findById(id);
        
        if (!reservacion) {
            return res.status(404).json({
                success: false,
                message: 'Reservación no encontrada'
            });
        }
        
        // Obtener cliente
        const cliente = await clienteModel.findById(reservacion.cliente_id);
        
        // Obtener productos de la reservación
        const productos = await reservacionModel.getProductosByReservacionId(id);
        
        // Obtener anticipos
        const anticipos = await reservacionModel.getAnticiposByReservacionId(id);
        
        res.json({
            success: true,
            data: {
                reservacion,
                cliente,
                productos,
                anticipos
            }
        });
    } catch (error) {
        console.error('Error al obtener reservación completa:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la información completa de la reservación',
            error: error.message
        });
    }
};

// Actualizar reservación
exports.updateReservacion = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar si la reservación existe
        const existingReservacion = await reservacionModel.findById(id);
        if (!existingReservacion) {
            return res.status(404).json({
                success: false,
                message: 'Reservación no encontrada'
            });
        }
        
        const updateData = {};
        
        // Campos actualizables
        const campos = [
            'cliente_id', 'fecha', 'hora', 'cantidad_personas', 
            'area', 'tipo_reservacion', 'observaciones'
        ];
        
        campos.forEach(campo => {
            if (req.body[campo] !== undefined) {
                updateData[campo] = req.body[campo];
            }
        });
        
        // Si se actualiza el cliente_id, verificar que exista
        if (updateData.cliente_id) {
            const cliente = await clienteModel.findById(updateData.cliente_id);
            if (!cliente) {
                return res.status(400).json({
                    success: false,
                    message: 'El cliente especificado no existe'
                });
            }
        }
        
        // Actualizar reservación
        const updated = await reservacionModel.update(id, updateData);
        
        if (!updated) {
            return res.status(400).json({
                success: false,
                message: 'No se pudo actualizar la reservación'
            });
        }
        
        res.json({
            success: true,
            message: 'Reservación actualizada exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar reservación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la reservación',
            error: error.message
        });
    }
};

// Eliminar reservación
exports.deleteReservacion = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar si la reservación existe
        const existingReservacion = await reservacionModel.findById(id);
        if (!existingReservacion) {
            return res.status(404).json({
                success: false,
                message: 'Reservación no encontrada'
            });
        }
        
        // Eliminar reservación (esto también eliminará productos y anticipos relacionados)
        const deleted = await reservacionModel.delete(id);
        
        if (!deleted) {
            return res.status(400).json({
                success: false,
                message: 'No se pudo eliminar la reservación'
            });
        }
        
        res.json({
            success: true,
            message: 'Reservación eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar reservación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la reservación',
            error: error.message
        });
    }
};

// Agregar producto a la reservación
exports.addProductoReservacion = async (req, res) => {
    try {
        const { reservacion_id } = req.params;
        const { producto_id, cantidad } = req.body;
        
        // Validar datos
        if (!producto_id || !cantidad || cantidad <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Producto y cantidad (mayor a 0) son obligatorios'
            });
        }
        
        // Verificar si la reservación existe
        const reservacion = await reservacionModel.findById(reservacion_id);
        if (!reservacion) {
            return res.status(404).json({
                success: false,
                message: 'Reservación no encontrada'
            });
        }
        
        // Verificar si el producto existe y obtener su precio
        const producto = await productoModel.findById(producto_id);
        if (!producto) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        if (!producto.activo) {
            return res.status(400).json({
                success: false,
                message: 'El producto no está activo'
            });
        }
        
        // Agregar producto a la reservación
        const id = await reservacionModel.addProducto({
            reservacion_id,
            producto_id,
            cantidad,
            precio_unitario: producto.precio
        });
        
        res.status(201).json({
            success: true,
            message: 'Producto agregado a la reservación exitosamente',
            data: { id }
        });
    } catch (error) {
        console.error('Error al agregar producto a la reservación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al agregar producto a la reservación',
            error: error.message
        });
    }
};

// Actualizar producto en la reservación
exports.updateProductoReservacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { cantidad } = req.body;
        
        // Validar datos
        if (cantidad !== undefined && cantidad <= 0) {
            return res.status(400).json({
                success: false,
                message: 'La cantidad debe ser mayor a 0'
            });
        }
        
        // Actualizar producto
        const updated = await reservacionModel.updateProducto(id, { cantidad });
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Producto de reservación no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: 'Producto de reservación actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar producto de reservación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar producto de reservación',
            error: error.message
        });
    }
};

// Eliminar producto de la reservación
exports.removeProductoReservacion = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Eliminar producto
        const deleted = await reservacionModel.removeProducto(id);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Producto de reservación no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: 'Producto eliminado de la reservación exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar producto de reservación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar producto de reservación',
            error: error.message
        });
    }
};

// Agregar anticipo a la reservación
exports.addAnticipoReservacion = async (req, res) => {
    try {
        const { reservacion_id } = req.params;
        const { monto, metodo_pago, observaciones } = req.body;
        
        // Validar datos
        if (!monto || monto <= 0 || !metodo_pago) {
            return res.status(400).json({
                success: false,
                message: 'Monto (mayor a 0) y método de pago son obligatorios'
            });
        }
        
        // Verificar si la reservación existe
        const reservacion = await reservacionModel.findById(reservacion_id);
        if (!reservacion) {
            return res.status(404).json({
                success: false,
                message: 'Reservación no encontrada'
            });
        }
        
        // Agregar anticipo
        const id = await reservacionModel.addAnticipo({
            reservacion_id,
            monto,
            metodo_pago,
            observaciones
        });
        
        res.status(201).json({
            success: true,
            message: 'Anticipo agregado exitosamente',
            data: { id }
        });
    } catch (error) {
        console.error('Error al agregar anticipo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al agregar anticipo',
            error: error.message
        });
    }
};

// Eliminar anticipo
exports.removeAnticipoReservacion = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Eliminar anticipo
        const deleted = await reservacionModel.removeAnticipo(id);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Anticipo no encontrado'
            });
        }
        
        res.json({
            success: true,
            message: 'Anticipo eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar anticipo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar anticipo',
            error: error.message
        });
    }
};