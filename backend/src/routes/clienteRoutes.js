const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { authMiddleware, canWriteClients } = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Operaciones de lectura - Todos los roles pueden ver clientes
router.get('/', clienteController.getAllClientes);
router.get('/:id', clienteController.getClienteById);

// Operaciones de escritura - Solo admin y editor
// Crear cliente - Todos pueden crear (para reservaciones)
router.post('/', clienteController.createCliente);

// Editar y eliminar - Solo admin y editor
router.put('/:id', canWriteClients, clienteController.updateCliente);
router.delete('/:id', canWriteClients, clienteController.deleteCliente);

module.exports = router;