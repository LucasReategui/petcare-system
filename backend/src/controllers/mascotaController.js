const { Mascota, Cliente, Usuario } = require('../models');

// Registrar nueva mascota
const registrarMascota = async (req, res) => {
  try {
    const { id_cliente, nombre, especie, raza, fecha_nacimiento, peso } = req.body;

    if (!id_cliente || !nombre || !especie) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios.' });
    }

    // Verificar que el cliente existe
    const cliente = await Cliente.findByPk(id_cliente);
    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado.' });
    }

    const mascota = await Mascota.create({
      id_cliente, nombre, especie,
      raza: raza || null,
      fecha_nacimiento: fecha_nacimiento || null,
      peso: peso || null
    });

    return res.status(201).json({
      mensaje: 'Mascota registrada correctamente.',
      mascota
    });

  } catch (error) {
    console.error('Error al registrar mascota:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

// Obtener mascotas de un cliente
const obtenerMascotasPorCliente = async (req, res) => {
  try {
    const { id_cliente } = req.params;

    const mascotas = await Mascota.findAll({
      where: { id_cliente }
    });

    return res.status(200).json({ mascotas });
  } catch (error) {
    console.error('Error al obtener mascotas:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

// Obtener mascota por ID
const obtenerMascotaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const mascota = await Mascota.findByPk(id, {
      include: [{
        model: Cliente,
        as: 'cliente',
        include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'apellido', 'correo'] }]
      }]
    });

    if (!mascota) {
      return res.status(404).json({ mensaje: 'Mascota no encontrada.' });
    }

    return res.status(200).json({ mascota });
  } catch (error) {
    console.error('Error al obtener mascota:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

// Actualizar mascota
const actualizarMascota = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, especie, raza, fecha_nacimiento, peso } = req.body;

    const mascota = await Mascota.findByPk(id);
    if (!mascota) {
      return res.status(404).json({ mensaje: 'Mascota no encontrada.' });
    }

    await mascota.update({ nombre, especie, raza, fecha_nacimiento, peso });

    return res.status(200).json({ mensaje: 'Mascota actualizada correctamente.', mascota });
  } catch (error) {
    console.error('Error al actualizar mascota:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

module.exports = {
  registrarMascota,
  obtenerMascotasPorCliente,
  obtenerMascotaPorId,
  actualizarMascota
};