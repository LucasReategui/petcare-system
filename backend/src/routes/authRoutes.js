const express = require('express');
const router = express.Router();
const { login, registrarUsuario } = require('../controllers/authController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/registro - temporal sin protección para crear el primer admin
router.post('/registro', verificarToken, verificarRol('ADMINISTRADOR'), registrarUsuario);
//router.post('/registro', registrarUsuario);

module.exports = router;