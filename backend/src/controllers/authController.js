const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario, Cliente, Veterinario } = require('../models');
require('dotenv').config();

const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    // Validar campos
    if (!correo || !contrasena) {
      return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios.' });
    }

    // Buscar usuario
    const usuario = await Usuario.findOne({ where: { correo } });
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas.' });
    }

    // Verificar si está activo
    if (!usuario.activo) {
      return res.status(403).json({ mensaje: 'Cuenta desactivada. Contacta al administrador.' });
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(contrasena, usuario.contrasena_hash);
    if (!passwordValida) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas.' });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Respuesta según rol
    return res.status(200).json({
      mensaje: 'Inicio de sesión exitoso.',
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

const registrarUsuario = async (req, res) => {
  try {
    const { nombre, apellido, correo, contrasena, rol } = req.body;

    // Validar campos obligatorios
    if (!nombre || !apellido || !correo || !contrasena || !rol) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }

    // Verificar correo duplicado
    const existe = await Usuario.findOne({ where: { correo } });
    if (existe) {
      return res.status(409).json({ mensaje: 'El correo ya está registrado en el sistema.' });
    }

    // Hashear contraseña
    const contrasena_hash = await bcrypt.hash(contrasena, 10);

    // Crear usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      apellido,
      correo,
      contrasena_hash,
      rol,
      activo: 1
    });

    return res.status(201).json({
      mensaje: 'Usuario creado correctamente.',
      usuario: {
        id_usuario: nuevoUsuario.id_usuario,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol
      }
    });

  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

module.exports = { login, registrarUsuario };