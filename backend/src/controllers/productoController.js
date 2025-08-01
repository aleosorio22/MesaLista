const productoModel = require('../models/productoModel');

// Crear un nuevo producto
exports.createProducto = async (req, res) => {
    try {
        const { nombre, precio, activo } = req.body;

        // Validar datos
        if (!nombre || precio === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Nombre y precio son obligatorios'
            });
        }

        // Verificar si el nombre ya existe
        const existingProducto = await productoModel.findByNombre(nombre);
        if (existingProducto) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un producto con este nombre'
            });
        }

        // Validar que el precio sea un número positivo
        if (isNaN(precio) || precio < 0) {
            return res.status(400).json({
                success: false,
                message: 'El precio debe ser un número positivo'
            });
        }

        // Crear producto
        const productoId = await productoModel.create({
            nombre,
            precio,
            activo
        });

        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: { id: productoId }
        });
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear el producto',
            error: error.message
        });
    }
};

// Obtener todos los productos
exports.getAllProductos = async (req, res) => {
    try {
        // Parámetro opcional para incluir productos inactivos
        const includeInactive = req.query.includeInactive === 'true';
        
        const productos = await productoModel.getAll(includeInactive);
        res.json({
            success: true,
            data: productos
        });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los productos',
            error: error.message
        });
    }
};

// Obtener producto por ID
exports.getProductoById = async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await productoModel.findById(id);
        
        if (!producto) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        res.json({
            success: true,
            data: producto
        });
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el producto',
            error: error.message
        });
    }
};

// Actualizar producto
exports.updateProducto = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar si el producto existe
        const existingProducto = await productoModel.findById(id);
        if (!existingProducto) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        const updateData = {};
        
        // Validar y asignar campos para actualizar
        if (req.body.nombre !== undefined) {
            // Verificar si el nuevo nombre ya existe en otro producto
            if (req.body.nombre !== existingProducto.nombre) {
                const productoConNombre = await productoModel.findByNombre(req.body.nombre);
                if (productoConNombre && productoConNombre.id !== parseInt(id)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Ya existe otro producto con este nombre'
                    });
                }
            }
            updateData.nombre = req.body.nombre;
        }
        
        if (req.body.precio !== undefined) {
            // Validar que el precio sea un número positivo
            if (isNaN(req.body.precio) || req.body.precio < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El precio debe ser un número positivo'
                });
            }
            updateData.precio = req.body.precio;
        }
        
        if (req.body.activo !== undefined) {
            updateData.activo = Boolean(req.body.activo);
        }
        
        // Actualizar producto
        const updated = await productoModel.update(id, updateData);
        
        if (!updated) {
            return res.status(400).json({
                success: false,
                message: 'No se pudo actualizar el producto'
            });
        }
        
        res.json({
            success: true,
            message: 'Producto actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el producto',
            error: error.message
        });
    }
};

// Eliminar producto
exports.deleteProducto = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar si el producto existe
        const existingProducto = await productoModel.findById(id);
        if (!existingProducto) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        // Eliminar producto
        const deleted = await productoModel.delete(id);
        
        if (!deleted) {
            return res.status(400).json({
                success: false,
                message: 'No se pudo eliminar el producto'
            });
        }
        
        res.json({
            success: true,
            message: 'Producto eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el producto',
            error: error.message
        });
    }
};