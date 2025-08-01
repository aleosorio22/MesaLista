const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

// Ruta para crear el primer usuario administrador (sin autenticación)
router.post('/root', usuarioController.createRootUser);

// Rutas que requieren autenticación
router.post('/', authMiddleware, isAdmin, usuarioController.createUser);
router.get('/', authMiddleware, isAdmin, usuarioController.getAllUsers);
router.get('/:id', authMiddleware, usuarioController.getUserById);
router.get('/:id/full', authMiddleware, isAdmin, usuarioController.getFullUserById);
router.put('/:id', authMiddleware, isAdmin, usuarioController.updateUser);

// Ruta de login (sin autenticación)
router.post('/login', usuarioController.login);

module.exports = router;