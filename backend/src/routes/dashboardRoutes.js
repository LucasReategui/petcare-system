const express = require('express');
const router = express.Router();
const { obtenerDashboard } = require('../controllers/dashboardController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

router.get('/', verificarToken, verificarRol('ADMINISTRADOR', 'VETERINARIO'), obtenerDashboard);

module.exports = router;