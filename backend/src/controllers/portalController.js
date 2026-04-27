const { Cita, Mascota, Veterinario, Usuario, Cliente } = require('../models');
const { Op } = require('sequelize');

// El cliente ve sus propias citas usando su token JWT
const misCitas = async (req, res) => {
  try {
    const id_usuario = req.usuario.id_usuario;

    // Buscar el perfil de cliente del usuario autenticado
    const cliente = await Cliente.findOne({ where: { id_usuario } });
    if (!cliente) {
      return res.status(404).json({ mensaje: 'No se encontró perfil de cliente.' });
    }

    // Buscar mascotas del cliente
    const mascotas = await Mascota.findAll({
      where: { id_cliente: cliente.id_cliente },
      attributes: ['id_mascota']
    });

    const idsMascotas = mascotas.map(m => m.id_mascota);

    if (idsMascotas.length === 0) {
      return res.status(200).json({ citas: [], mensaje: 'No tienes mascotas registradas.' });
    }

    // Buscar citas de todas sus mascotas
    const citas = await Cita.findAll({
      where: {
        id_mascota: { [Op.in]: idsMascotas }
      },
      include: [
        {
          model: Mascota,
          as: 'mascota',
          attributes: ['nombre', 'especie', 'raza']
        },
        {
          model: Veterinario,
          as: 'veterinario',
          include: [{
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre', 'apellido']
          }]
        }
      ],
      order: [['fecha', 'DESC'], ['hora', 'DESC']]
    });

    return res.status(200).json({
      cliente: {
        id_cliente: cliente.id_cliente,
        nombre: req.usuario.nombre,
        apellido: req.usuario.apellido
      },
      total_citas: citas.length,
      citas
    });

  } catch (error) {
    console.error('Error en portal cliente:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

module.exports = { misCitas };