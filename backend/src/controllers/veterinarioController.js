const { Veterinario, Usuario } = require('../models');

const crearPerfilVeterinario = async (req, res) => {
  try {
    const { id_usuario, especialidad, horario_inicio, horario_fin } = req.body;

    if (!id_usuario || !horario_inicio || !horario_fin) {
      return res.status(400).json({ mensaje: 'id_usuario, horario_inicio y horario_fin son obligatorios.' });
    }

    // Verificar que el usuario exista y sea VETERINARIO
    const usuario = await Usuario.findOne({ where: { id_usuario, rol: 'VETERINARIO' } });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'No se encontró un usuario con rol VETERINARIO para ese id.' });
    }

    // Verificar que no tenga ya un perfil
    const existe = await Veterinario.findOne({ where: { id_usuario } });
    if (existe) {
      return res.status(409).json({ mensaje: 'Este veterinario ya tiene un perfil creado.' });
    }

    const perfil = await Veterinario.create({
      id_usuario,
      especialidad: especialidad || null,
      horario_inicio,
      horario_fin
    });

    return res.status(201).json({
      mensaje: 'Perfil de veterinario creado correctamente.',
      veterinario: {
        id_veterinario: perfil.id_veterinario,
        id_usuario: perfil.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        especialidad: perfil.especialidad,
        horario_inicio: perfil.horario_inicio,
        horario_fin: perfil.horario_fin
      }
    });

  } catch (error) {
    console.error('Error al crear perfil veterinario:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

const obtenerVeterinarios = async (req, res) => {
  try {
    const veterinarios = await Veterinario.findAll({
      include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'apellido', 'correo'] }]
    });
    return res.status(200).json({ veterinarios });
  } catch (error) {
    console.error('Error al obtener veterinarios:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

module.exports = { crearPerfilVeterinario, obtenerVeterinarios };