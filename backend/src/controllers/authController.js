const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
require('dotenv').config();

// Almacén temporal de intentos fallidos en memoria
const intentosFallidos = {};
const MAX_INTENTOS = 3;
const TIEMPO_BLOQUEO = 15 * 60 * 1000; // 15 minutos en milisegundos

const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    // Validar campos
    if (!correo || !contrasena) {
      return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios.' });
    }

    // Verificar si la cuenta está bloqueada
    const ahora = Date.now();
    if (intentosFallidos[correo]) {
      const { cantidad, tiempoBloqueo } = intentosFallidos[correo];
      if (cantidad >= MAX_INTENTOS && tiempoBloqueo && ahora < tiempoBloqueo) {
        const minutosRestantes = Math.ceil((tiempoBloqueo - ahora) / 60000);
        return res.status(403).json({
          mensaje: `Cuenta bloqueada temporalmente. Intenta de nuevo en ${minutosRestantes} minuto(s).`
        });
      }
      // Si ya pasó el tiempo de bloqueo, resetear
      if (tiempoBloqueo && ahora >= tiempoBloqueo) {
        delete intentosFallidos[correo];
      }
    }

    // Buscar usuario
    const usuario = await Usuario.findOne({ where: { correo } });
    if (!usuario) {
      // Contar intento fallido aunque el usuario no exista
      registrarIntentoFallido(correo, ahora);
      return res.status(401).json({ mensaje: 'Credenciales incorrectas.' });
    }

    // Verificar si está activo
    if (!usuario.activo) {
      return res.status(403).json({ mensaje: 'Cuenta desactivada. Contacta al administrador.' });
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(contrasena, usuario.contrasena_hash);
    if (!passwordValida) {
      registrarIntentoFallido(correo, ahora);
      const intentos = intentosFallidos[correo]?.cantidad || 0;
      const restantes = MAX_INTENTOS - intentos;

      if (intentos >= MAX_INTENTOS) {
        return res.status(403).json({
          mensaje: `Cuenta bloqueada por ${MAX_INTENTOS} intentos fallidos. Intenta de nuevo en 15 minutos.`
        });
      }

      return res.status(401).json({
        mensaje: `Credenciales incorrectas. Te quedan ${restantes} intento(s).`
      });
    }

    // Login exitoso — resetear intentos fallidos
    delete intentosFallidos[correo];

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

// Función auxiliar para registrar intentos fallidos
const registrarIntentoFallido = (correo, ahora) => {
  if (!intentosFallidos[correo]) {
    intentosFallidos[correo] = { cantidad: 0, tiempoBloqueo: null };
  }
  intentosFallidos[correo].cantidad += 1;

  if (intentosFallidos[correo].cantidad >= MAX_INTENTOS) {
    intentosFallidos[correo].tiempoBloqueo = ahora + TIEMPO_BLOQUEO;
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