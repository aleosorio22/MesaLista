const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Solo los administradores pueden gestionar productos
// GET - Todos pueden ver productos (para reservaciones)
router.get('/', productoController.getAllProductos);
router.get('/:id', productoController.getProductoById);

// CRUD solo para administradores
router.post('/', isAdmin, productoController.createProducto);
router.put('/:id', isAdmin, productoController.updateProducto);
router.delete('/:id', isAdmin, productoController.deleteProducto);

module.exports = router;