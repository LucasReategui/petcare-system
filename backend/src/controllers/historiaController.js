const { HistoriaClinica, Cita, Mascota, Veterinario, Usuario, Cliente } = require('../models');

// Registrar historia clínica al cerrar una consulta
const registrarHistoria = async (req, res) => {
  try {
    const { id_cita, diagnostico, tratamiento, observaciones, peso_consulta } = req.body;

    if (!id_cita || !diagnostico || !tratamiento) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios: id_cita, diagnostico y tratamiento.' });
    }

    // Verificar que la cita existe
    const cita = await Cita.findByPk(id_cita);
    if (!cita) {
      return res.status(404).json({ mensaje: 'Cita no encontrada.' });
    }

    // Verificar que no tenga ya una historia clínica
    const historiaExiste = await HistoriaClinica.findOne({ where: { id_cita } });
    if (historiaExiste) {
      return res.status(409).json({ mensaje: 'Esta cita ya tiene una historia clínica registrada.' });
    }

    // Registrar historia clínica
    const historia = await HistoriaClinica.create({
      id_cita,
      id_mascota: cita.id_mascota,
      id_veterinario: cita.id_veterinario,
      fecha_consulta: cita.fecha,
      diagnostico,
      tratamiento,
      observaciones: observaciones || null,
      peso_consulta: peso_consulta || null
    });

    // Actualizar estado de la cita a ATENDIDA
    await cita.update({ estado: 'ATENDIDA' });

    return res.status(201).json({
      mensaje: 'Historia clínica registrada correctamente. Cita marcada como ATENDIDA.',
      historia
    });

  } catch (error) {
    console.error('Error al registrar historia clínica:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

// Obtener historial completo de una mascota
const obtenerHistorialPorMascota = async (req, res) => {
  try {
    const { id_mascota } = req.params;

    const mascota = await Mascota.findByPk(id_mascota);
    if (!mascota) {
      return res.status(404).json({ mensaje: 'Mascota no encontrada.' });
    }

    const historias = await HistoriaClinica.findAll({
      where: { id_mascota },
      include: [
        {
          model: Cita, as: 'cita',
          attributes: ['fecha', 'hora', 'motivo', 'estado']
        },
        {
          model: Veterinario, as: 'veterinario',
          include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'apellido'] }]
        }
      ],
      order: [['fecha_consulta', 'DESC']]
    });

    return res.status(200).json({
      mascota: {
        id_mascota: mascota.id_mascota,
        nombre: mascota.nombre,
        especie: mascota.especie,
        raza: mascota.raza
      },
      total_consultas: historias.length,
      historias
    });

  } catch (error) {
    console.error('Error al obtener historial:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

// Obtener historia clínica por ID de cita
const obtenerHistoriaPorCita = async (req, res) => {
  try {
    const { id_cita } = req.params;

    const historia = await HistoriaClinica.findOne({
      where: { id_cita },
      include: [
        {
          model: Cita, as: 'cita',
          attributes: ['fecha', 'hora', 'motivo']
        },
        {
          model: Mascota, as: 'mascota',
          attributes: ['nombre', 'especie', 'raza']
        },
        {
          model: Veterinario, as: 'veterinario',
          include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'apellido'] }]
        }
      ]
    });

    if (!historia) {
      return res.status(404).json({ mensaje: 'No existe historia clínica para esta cita.' });
    }

    return res.status(200).json({ historia });

  } catch (error) {
    console.error('Error al obtener historia:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

module.exports = {
  registrarHistoria,
  obtenerHistorialPorMascota,
  obtenerHistoriaPorCita
};