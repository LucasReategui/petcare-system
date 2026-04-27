const express = require('express');
const router = express.Router();
const { misCitas } = require('../controllers/portalController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

router.get('/mis-citas', verificarToken, verificarRol('CLIENTE'), misCitas);

module.exports = router;