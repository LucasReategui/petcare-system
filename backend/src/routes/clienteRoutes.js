const express = require('express');
const router = express.Router();
const { registrarCliente, obtenerClientes, obtenerClientePorId, actualizarCliente } = require('../controllers/clienteController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

router.post('/', verificarToken, verificarRol('ADMINISTRADOR', 'RECEPCIONISTA'), registrarCliente);
router.get('/', verificarToken, verificarRol('ADMINISTRADOR', 'RECEPCIONISTA'), obtenerClientes);
router.get('/:id', verificarToken, obtenerClientePorId);
router.put('/:id', verificarToken, verificarRol('ADMINISTRADOR', 'RECEPCIONISTA'), actualizarCliente);

module.exports = router;