const { Cita, Mascota, Veterinario, Usuario, Cliente } = require('../models');
const { Op } = require('sequelize');

// Verificar disponibilidad
const verificarDisponibilidad = async (id_veterinario, fecha, hora, id_cita_excluir = null) => {
  const where = {
    id_veterinario,
    fecha,
    hora,
    estado: { [Op.notIn]: ['CANCELADA', 'INASISTENCIA'] }
  };

  if (id_cita_excluir) {
    where.id_cita = { [Op.ne]: id_cita_excluir };
  }

  const citaExistente = await Cita.findOne({ where });
  return !citaExistente;
};

// Registrar nueva cita
const registrarCita = async (req, res) => {
  try {
    const { id_mascota, id_veterinario, fecha, hora, motivo, observaciones } = req.body;

    if (!id_mascota || !id_veterinario || !fecha || !hora || !motivo) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios.' });
    }

    // Verificar que la mascota existe
    const mascota = await Mascota.findByPk(id_mascota);
    if (!mascota) {
      return res.status(404).json({ mensaje: 'Mascota no encontrada.' });
    }

    // Verificar que el veterinario existe
    const veterinario = await Veterinario.findByPk(id_veterinario);
    if (!veterinario) {
      return res.status(404).json({ mensaje: 'Veterinario no encontrado.' });
    }

    // Verificar disponibilidad en tiempo real
    const disponible = await verificarDisponibilidad(id_veterinario, fecha, hora);
    if (!disponible) {
      // Buscar horarios disponibles cercanos
      const citasDelDia = await Cita.findAll({
        where: {
          id_veterinario, fecha,
          estado: { [Op.notIn]: ['CANCELADA', 'INASISTENCIA'] }
        },
        attributes: ['hora'],
        order: [['hora', 'ASC']]
      });

      const horasOcupadas = citasDelDia.map(c => c.hora);

      return res.status(409).json({
        mensaje: 'El horario seleccionado no está disponible.',
        horarios_ocupados: horasOcupadas
      });
    }

    // Registrar la cita
    const cita = await Cita.create({
      id_mascota, id_veterinario,
      fecha, hora, motivo,
      observaciones: observaciones || null,
      estado: 'PENDIENTE'
    });

    return res.status(201).json({
      mensaje: 'Cita registrada correctamente.',
      cita
    });

  } catch (error) {
    console.error('Error al registrar cita:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

// Obtener todas las citas
const obtenerCitas = async (req, res) => {
  try {
    const citas = await Cita.findAll({
      include: [
        {
          model: Mascota, as: 'mascota',
          include: [{ model: Cliente, as: 'cliente',
            include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'apellido'] }]
          }]
        },
        {
          model: Veterinario, as: 'veterinario',
          include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'apellido'] }]
        }
      ],
      order: [['fecha', 'ASC'], ['hora', 'ASC']]
    });

    return res.status(200).json({ citas });
  } catch (error) {
    console.error('Error al obtener citas:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

// Obtener citas del día
const obtenerCitasDelDia = async (req, res) => {
  try {
    const hoy = new Date().toISOString().split('T')[0];

    const citas = await Cita.findAll({
      where: { fecha: hoy },
      include: [
        {
          model: Mascota, as: 'mascota',
          include: [{ model: Cliente, as: 'cliente',
            include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'apellido'] }]
          }]
        },
        {
          model: Veterinario, as: 'veterinario',
          include: [{ model: Usuario, as: 'usuario', attributes: ['nombre', 'apellido'] }]
        }
      ],
      order: [['hora', 'ASC']]
    });

    return res.status(200).json({ fecha: hoy, total: citas.length, citas });
  } catch (error) {
    console.error('Error al obtener citas del día:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

// Actualizar estado de cita
const actualizarEstadoCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['PENDIENTE', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA', 'INASISTENCIA'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ mensaje: 'Estado no válido.' });
    }

    const cita = await Cita.findByPk(id);
    if (!cita) {
      return res.status(404).json({ mensaje: 'Cita no encontrada.' });
    }

    await cita.update({ estado });

    return res.status(200).json({ mensaje: `Cita actualizada a estado: ${estado}.`, cita });
  } catch (error) {
    console.error('Error al actualizar cita:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

// Cancelar cita
const cancelarCita = async (req, res) => {
  try {
    const { id } = req.params;

    const cita = await Cita.findByPk(id);
    if (!cita) {
      return res.status(404).json({ mensaje: 'Cita no encontrada.' });
    }

    if (cita.estado === 'ATENDIDA') {
      return res.status(400).json({ mensaje: 'No se puede cancelar una cita ya atendida.' });
    }

    await cita.update({ estado: 'CANCELADA' });

    return res.status(200).json({ mensaje: 'Cita cancelada correctamente.' });
  } catch (error) {
    console.error('Error al cancelar cita:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

module.exports = {
  registrarCita,
  obtenerCitas,
  obtenerCitasDelDia,
  actualizarEstadoCita,
  cancelarCita
};