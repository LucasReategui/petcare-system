const express = require('express');
const router = express.Router();
const { registrarHistoria, obtenerHistorialPorMascota, obtenerHistoriaPorCita } = require('../controllers/historiaController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

router.post('/', verificarToken, verificarRol('VETERINARIO', 'ADMINISTRADOR'), registrarHistoria);
router.get('/mascota/:id_mascota', verificarToken, obtenerHistorialPorMascota);
router.get('/cita/:id_cita', verificarToken, obtenerHistoriaPorCita);

module.exports = router;