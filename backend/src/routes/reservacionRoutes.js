const express = require('express');
const router = express.Router();
const reservacionController = require('../controllers/reservacionController');
const { 
    authMiddleware, 
    canCreateReservations, 
    canModifyReservation 
} = require('../middlewares/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas para reservaciones
router.post('/', canCreateReservations, reservacionController.createReservacion);
router.get('/', reservacionController.getAllReservaciones);
router.get('/proxima-semana', reservacionController.getReservacionesProximaSemana);
router.get('/:id', reservacionController.getReservacionById);
router.get('/:id/completa', reservacionController.getReservacionCompleta);
router.put('/:id', canModifyReservation, reservacionController.updateReservacion);
router.delete('/:id', canModifyReservation, reservacionController.deleteReservacion);

// Rutas para productos de reservaciones
router.post('/:reservacion_id/productos', canModifyReservation, reservacionController.addProductoReservacion);
router.put('/productos/:id', reservacionController.updateProductoReservacion);
router.delete('/productos/:id', reservacionController.removeProductoReservacion);

// Rutas para anticipos
router.post('/:reservacion_id/anticipos', canModifyReservation, reservacionController.addAnticipoReservacion);
router.delete('/anticipos/:id', reservacionController.removeAnticipoReservacion);

module.exports = router;