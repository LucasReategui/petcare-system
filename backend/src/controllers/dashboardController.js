const { Cita, Mascota, HistoriaClinica, Usuario, Cliente } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

const obtenerDashboard = async (req, res) => {
  try {
    const hoy = new Date().toISOString().split('T')[0];

    // Inicio y fin de la semana actual
    const ahora = new Date();
    const diaSemana = ahora.getDay();
    const inicioSemana = new Date(ahora);
    inicioSemana.setDate(ahora.getDate() - diaSemana);
    const finSemana = new Date(ahora);
    finSemana.setDate(ahora.getDate() + (6 - diaSemana));
    const inicioSemanaStr = inicioSemana.toISOString().split('T')[0];
    const finSemanaStr = finSemana.toISOString().split('T')[0];

    // Inicio del mes actual
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
      .toISOString().split('T')[0];

    // 1. Citas del día con conteo por estado
    const citasHoy = await Cita.findAll({
      where: { fecha: hoy },
      attributes: ['estado']
    });

    const resumenCitasHoy = {
      total: citasHoy.length,
      pendientes: citasHoy.filter(c => c.estado === 'PENDIENTE').length,
      confirmadas: citasHoy.filter(c => c.estado === 'CONFIRMADA').length,
      atendidas: citasHoy.filter(c => c.estado === 'ATENDIDA').length,
      canceladas: citasHoy.filter(c => c.estado === 'CANCELADA').length,
      inasistencias: citasHoy.filter(c => c.estado === 'INASISTENCIA').length
    };

    // 2. Tasa de inasistencia de la semana
    const citasSemana = await Cita.findAll({
      where: {
        fecha: { [Op.between]: [inicioSemanaStr, finSemanaStr] }
      },
      attributes: ['estado']
    });

    const totalSemana = citasSemana.length;
    const inasistenciasSemana = citasSemana.filter(c => c.estado === 'INASISTENCIA').length;
    const tasaInasistencia = totalSemana > 0
      ? ((inasistenciasSemana / totalSemana) * 100).toFixed(1)
      : '0.0';

    // 3. Mascotas nuevas registradas en el mes
    const mascotasNuevasMes = await Mascota.count({
      where: {
        creado_en: { [Op.gte]: inicioMes }
      }
    });

    // 4. Total clientes registrados
    const totalClientes = await Cliente.count();

    // 5. Total mascotas registradas
    const totalMascotas = await Mascota.count();

    // 6. Citas del mes agrupadas por motivo (top 3 servicios)
    const citasMes = await Cita.findAll({
      where: {
        fecha: { [Op.gte]: inicioMes },
        estado: { [Op.notIn]: ['CANCELADA'] }
      },
      attributes: ['motivo']
    });

    // Contar motivos manualmente
    const conteoMotivos = {};
    citasMes.forEach(c => {
      const motivo = c.motivo?.trim() || 'Sin especificar';
      conteoMotivos[motivo] = (conteoMotivos[motivo] || 0) + 1;
    });

    const top3Servicios = Object.entries(conteoMotivos)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([motivo, cantidad]) => ({ motivo, cantidad }));

    // 7. Últimas 5 citas registradas
    const ultimasCitas = await Cita.findAll({
      limit: 5,
      order: [['creado_en', 'DESC']],
      include: [
        {
          model: Mascota,
          as: 'mascota',
          attributes: ['nombre', 'especie']
        }
      ],
      attributes: ['id_cita', 'fecha', 'hora', 'motivo', 'estado', 'creado_en']
    });

    return res.status(200).json({
      mensaje: 'Dashboard obtenido correctamente.',
      dashboard: {
        citas_hoy: resumenCitasHoy,
        semana: {
          total_citas: totalSemana,
          inasistencias: inasistenciasSemana,
          tasa_inasistencia_porcentaje: `${tasaInasistencia}%`
        },
        mes: {
          mascotas_nuevas: mascotasNuevasMes,
          top_3_servicios: top3Servicios
        },
        totales: {
          clientes: totalClientes,
          mascotas: totalMascotas
        },
        ultimas_citas: ultimasCitas
      }
    });

  } catch (error) {
    console.error('Error al obtener dashboard:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

module.exports = { obtenerDashboard };