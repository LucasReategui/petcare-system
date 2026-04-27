const { Usuario, Cliente } = require('../models');
const bcrypt = require('bcryptjs');

// Registrar nuevo cliente
const registrarCliente = async (req, res) => {
  try {
    const { nombre, apellido, correo, contrasena, telefono, direccion } = req.body;

    if (!nombre || !apellido || !correo || !contrasena || !telefono) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios.' });
    }

    // Verificar correo duplicado
    const existe = await Usuario.findOne({ where: { correo } });
    if (existe) {
      return res.status(409).json({ mensaje: 'El correo ya está registrado.' });
    }

    const contrasena_hash = await bcrypt.hash(contrasena, 10);

    // Crear usuario con rol CLIENTE
    const usuario = await Usuario.create({
      nombre, apellido, correo,
      contrasena_hash,
      rol: 'CLIENTE',
      activo: 1
    });

    // Crear perfil de cliente
    const cliente = await Cliente.create({
      id_usuario: usuario.id_usuario,
      telefono,
      direccion: direccion || null
    });

    return res.status(201).json({
      mensaje: 'Cliente registrado correctamente.',
      cliente: {
        id_cliente: cliente.id_cliente,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        telefono: cliente.telefono
      }
    });

  } catch (error) {
    console.error('Error al registrar cliente:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

// Obtener todos los clientes
const obtenerClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      include: [{
        model: require('../models').Usuario,
        as: 'usuario',
        attributes: ['nombre', 'apellido', 'correo', 'activo']
      }]
    });

    return res.status(200).json({ clientes });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

// Obtener cliente por ID
const obtenerClientePorId = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await Cliente.findByPk(id, {
      include: [{
        model: require('../models').Usuario,
        as: 'usuario',
        attributes: ['nombre', 'apellido', 'correo', 'activo']
      }]
    });

    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado.' });
    }

    return res.status(200).json({ cliente });
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

// Actualizar cliente
const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, telefono, direccion } = req.body;

    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado.' });
    }

    // Actualizar usuario
    await Usuario.update(
      { nombre, apellido },
      { where: { id_usuario: cliente.id_usuario } }
    );

    // Actualizar cliente
    await cliente.update({ telefono, direccion });

    return res.status(200).json({ mensaje: 'Cliente actualizado correctamente.' });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

module.exports = {
  registrarCliente,
  obtenerClientes,
  obtenerClientePorId,
  actualizarCliente
};