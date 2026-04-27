const express = require('express');
const router = express.Router();
const { registrarCita, obtenerCitas, obtenerCitasDelDia, actualizarEstadoCita, cancelarCita } = require('../controllers/citaController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

router.post('/', verificarToken, verificarRol('ADMINISTRADOR', 'RECEPCIONISTA', 'CLIENTE'), registrarCita);
router.get('/', verificarToken, verificarRol('ADMINISTRADOR', 'RECEPCIONISTA', 'VETERINARIO'), obtenerCitas);
router.get('/hoy', verificarToken, obtenerCitasDelDia);
router.put('/:id/estado', verificarToken, verificarRol('ADMINISTRADOR', 'RECEPCIONISTA', 'VETERINARIO'), actualizarEstadoCita);
router.delete('/:id', verificarToken, cancelarCita);

module.exports = router;