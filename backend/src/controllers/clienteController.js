const clienteModel = require('../models/clienteModel');

// Crear un nuevo cliente
exports.createCliente = async (req, res) => {
    try {
        // Aceptar tanto email como correo
        const correo = req.body.correo || req.body.email;
        const { nombre, apellido, telefono } = req.body;

        // Validar datos
        if (!nombre || !apellido || !telefono) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, apellido y teléfono son obligatorios'
            });
        }

        // Verificar si el correo ya existe (si se proporciona)
        if (correo) {
            const existingCliente = await clienteModel.findByEmail(correo);
            if (existingCliente) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un cliente con este correo'
                });
            }
        }

        // Crear cliente
        const clienteId = await clienteModel.create({
            nombre,
            apellido,
            telefono,
            correo
        });

        res.status(201).json({
            success: true,
            message: 'Cliente creado exitosamente',
            data: { id: clienteId }
        });
    } catch (error) {
        console.error('Error al crear cliente:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear el cliente',
            error: error.message
        });
    }
};

// Obtener todos los clientes
exports.getAllClientes = async (req, res) => {
    try {
        const clientes = await clienteModel.getAll();
        res.json({
            success: true,
            data: clientes
        });
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los clientes',
            error: error.message
        });
    }
};

// Obtener cliente por ID
exports.getClienteById = async (req, res) => {
    try {
        const { id } = req.params;
        const cliente = await clienteModel.findById(id);
        
        if (!cliente) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: cliente
        });
    } catch (error) {
        console.error('Error al obtener cliente:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el cliente',
            error: error.message
        });
    }
};

// Actualizar cliente
exports.updateCliente = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar si el cliente existe
        const existingCliente = await clienteModel.findById(id);
        if (!existingCliente) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }
        
        // Aceptar tanto email como correo
        const updateData = {};
        if (req.body.nombre !== undefined) updateData.nombre = req.body.nombre;
        if (req.body.apellido !== undefined) updateData.apellido = req.body.apellido;
        if (req.body.telefono !== undefined) updateData.telefono = req.body.telefono;
        if (req.body.correo !== undefined) updateData.correo = req.body.correo;
        if (req.body.email !== undefined) updateData.correo = req.body.email;
        
        // Actualizar cliente
        const updated = await clienteModel.update(id, updateData);
        
        if (!updated) {
            return res.status(400).json({
                success: false,
                message: 'No se pudo actualizar el cliente'
            });
        }
        
        res.json({
            success: true,
            message: 'Cliente actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el cliente',
            error: error.message
        });
    }
};

// Eliminar cliente
exports.deleteCliente = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar si el cliente existe
        const existingCliente = await clienteModel.findById(id);
        if (!existingCliente) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }
        
        // Eliminar cliente
        const deleted = await clienteModel.delete(id);
        
        if (!deleted) {
            return res.status(400).json({
                success: false,
                message: 'No se pudo eliminar el cliente'
            });
        }
        
        res.json({
            success: true,
            message: 'Cliente eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el cliente',
            error: error.message
        });
    }
};