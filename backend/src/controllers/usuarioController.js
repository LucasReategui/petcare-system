const { Usuario, Cliente, Veterinario } = require('../models');
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios
const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id_usuario', 'nombre', 'apellido', 'correo', 'rol', 'activo', 'creado_en']
    });
    return res.status(200).json({ usuarios });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

// Desactivar usuario
const desactivarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    if (usuario.id_usuario === req.usuario.id_usuario) {
      return res.status(400).json({ mensaje: 'No puedes desactivar tu propia cuenta.' });
    }

    await usuario.update({ activo: 0 });

    return res.status(200).json({ mensaje: 'Usuario desactivado correctamente.' });
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

// Activar usuario
const activarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    await usuario.update({ activo: 1 });

    return res.status(200).json({ mensaje: 'Usuario activado correctamente.' });
  } catch (error) {
    console.error('Error al activar usuario:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

// Cambiar rol de usuario
const cambiarRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;

    const rolesValidos = ['ADMINISTRADOR', 'VETERINARIO', 'RECEPCIONISTA', 'CLIENTE'];
    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({ mensaje: 'Rol no válido.' });
    }

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    await usuario.update({ rol });

    return res.status(200).json({ mensaje: `Rol actualizado a ${rol} correctamente.` });
  } catch (error) {
    console.error('Error al cambiar rol:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

// Registrar veterinario
const registrarVeterinario = async (req, res) => {
  try {
    const { nombre, apellido, correo, contrasena, especialidad, horario_inicio, horario_fin } = req.body;

    if (!nombre || !apellido || !correo || !contrasena || !horario_inicio || !horario_fin) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios.' });
    }

    const existe = await Usuario.findOne({ where: { correo } });
    if (existe) {
      return res.status(409).json({ mensaje: 'El correo ya está registrado.' });
    }

    const contrasena_hash = await bcrypt.hash(contrasena, 10);

    const usuario = await Usuario.create({
      nombre, apellido, correo,
      contrasena_hash,
      rol: 'VETERINARIO',
      activo: 1
    });

    const veterinario = await Veterinario.create({
      id_usuario: usuario.id_usuario,
      especialidad: especialidad || null,
      horario_inicio,
      horario_fin
    });

    return res.status(201).json({
      mensaje: 'Veterinario registrado correctamente.',
      veterinario: {
        id_veterinario: veterinario.id_veterinario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        especialidad: veterinario.especialidad,
        horario_inicio: veterinario.horario_inicio,
        horario_fin: veterinario.horario_fin
      }
    });

  } catch (error) {
    console.error('Error al registrar veterinario:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

module.exports = {
  obtenerUsuarios,
  desactivarUsuario,
  activarUsuario,
  cambiarRol,
  registrarVeterinario
};