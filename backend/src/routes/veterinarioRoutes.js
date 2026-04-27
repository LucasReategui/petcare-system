const express = require('express');
const router = express.Router();
const { crearPerfilVeterinario, obtenerVeterinarios } = require('../controllers/veterinarioController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

router.post('/', verificarToken, verificarRol('ADMINISTRADOR'), crearPerfilVeterinario);
router.get('/', verificarToken, obtenerVeterinarios);

module.exports = router;