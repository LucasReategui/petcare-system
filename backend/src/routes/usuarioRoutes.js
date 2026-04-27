const express = require('express');
const router = express.Router();
const { obtenerUsuarios, desactivarUsuario, activarUsuario, cambiarRol, registrarVeterinario } = require('../controllers/usuarioController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

router.get('/', verificarToken, verificarRol('ADMINISTRADOR'), obtenerUsuarios);
router.put('/:id/desactivar', verificarToken, verificarRol('ADMINISTRADOR'), desactivarUsuario);
router.put('/:id/activar', verificarToken, verificarRol('ADMINISTRADOR'), activarUsuario);
router.put('/:id/rol', verificarToken, verificarRol('ADMINISTRADOR'), cambiarRol);
router.post('/veterinario', verificarToken, verificarRol('ADMINISTRADOR'), registrarVeterinario);

module.exports = router;