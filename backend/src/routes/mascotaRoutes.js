const express = require('express');
const router = express.Router();
const { registrarMascota, obtenerMascotasPorCliente, obtenerMascotaPorId, actualizarMascota } = require('../controllers/mascotaController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

router.post('/', verificarToken, verificarRol('ADMINISTRADOR', 'RECEPCIONISTA', 'VETERINARIO'), registrarMascota);
router.get('/cliente/:id_cliente', verificarToken, obtenerMascotasPorCliente);
router.get('/:id', verificarToken, obtenerMascotaPorId);
router.put('/:id', verificarToken, verificarRol('ADMINISTRADOR', 'RECEPCIONISTA', 'VETERINARIO'), actualizarMascota);

module.exports = router;