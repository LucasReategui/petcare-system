const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { Cita, Mascota, Veterinario, Cliente, Usuario } = require('../models');
const { Op } = require('sequelize');
require('dotenv').config();

// Configurar transporte de correo Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Función principal que busca citas a 24 horas y envía recordatorio
const enviarRecordatorios = async () => {
  try {
    const ahora = new Date();

    // Calcular ventana de 24 horas: entre 23:30 y 24:30 horas desde ahora
    const desde = new Date(ahora.getTime() + 23.5 * 60 * 60 * 1000);
    const hasta = new Date(ahora.getTime() + 24.5 * 60 * 60 * 1000);

    const fechaDesde = desde.toISOString().split('T')[0];
    const fechaHasta = hasta.toISOString().split('T')[0];
    const horaDesde = desde.toTimeString().split(' ')[0];
    const horaHasta = hasta.toTimeString().split(' ')[0];

    console.log(`⏰ [CRON] Buscando citas entre ${fechaDesde} ${horaDesde} y ${fechaHasta} ${horaHasta}`);

    // Buscar citas pendientes o confirmadas en esa ventana
    const citas = await Cita.findAll({
      where: {
        estado: { [Op.in]: ['PENDIENTE', 'CONFIRMADA'] },
        [Op.or]: [
          {
            fecha: fechaDesde,
            hora: { [Op.between]: [horaDesde, horaHasta] }
          },
          {
            fecha: fechaHasta,
            hora: { [Op.between]: ['00:00:00', horaHasta] }
          }
        ]
      },
      include: [
        {
          model: Mascota,
          as: 'mascota',
          include: [{
            model: Cliente,
            as: 'cliente',
            include: [{
              model: Usuario,
              as: 'usuario',
              attributes: ['nombre', 'apellido', 'correo']
            }]
          }]
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
      ]
    });

    if (citas.length === 0) {
      console.log('⏰ [CRON] No hay citas próximas para recordar.');
      return;
    }

    console.log(`⏰ [CRON] Enviando ${citas.length} recordatorio(s)...`);

    for (const cita of citas) {
      const correoCliente = cita.mascota?.cliente?.usuario?.correo;
      const nombreCliente = cita.mascota?.cliente?.usuario?.nombre;
      const nombreMascota = cita.mascota?.nombre;
      const nombreVet = `Dr. ${cita.veterinario?.usuario?.nombre} ${cita.veterinario?.usuario?.apellido}`;
      const fecha = cita.fecha;
      const hora = cita.hora;

      if (!correoCliente) {
        console.log(`⚠️ [CRON] Cita ${cita.id_cita} sin correo de cliente. Saltando.`);
        continue;
      }

      const mailOptions = {
        from: `"Veterinaria PetCare" <${process.env.EMAIL_USER}>`,
        to: correoCliente,
        subject: '🐾 Recordatorio de Cita — Veterinaria PetCare',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1a6b5c; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">🐾 Veterinaria PetCare</h1>
            </div>
            <div style="padding: 30px; background-color: #f9f9f9;">
              <h2 style="color: #333;">Recordatorio de Cita</h2>
              <p>Hola <strong>${nombreCliente}</strong>,</p>
              <p>Te recordamos que tienes una cita programada para mañana:</p>
              <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>🐶 Mascota:</strong> ${nombreMascota}</p>
                <p><strong>👨‍⚕️ Veterinario:</strong> ${nombreVet}</p>
                <p><strong>📅 Fecha:</strong> ${fecha}</p>
                <p><strong>🕐 Hora:</strong> ${hora}</p>
                <p><strong>📋 Motivo:</strong> ${cita.motivo}</p>
              </div>
              <p>Por favor llega 10 minutos antes de tu cita.</p>
              <p>Si necesitas cancelar o reprogramar, comunícate con nosotros.</p>
              <p style="color: #888; font-size: 12px;">Este es un mensaje automático. No respondas a este correo.</p>
            </div>
          </div>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ [CRON] Recordatorio enviado a ${correoCliente} para cita ${cita.id_cita}`);
      } catch (emailError) {
        console.error(`❌ [CRON] Error enviando correo a ${correoCliente}:`, emailError.message);
      }
    }

  } catch (error) {
    console.error('❌ [CRON] Error en job de recordatorios:', error.message);
  }
};

// Iniciar el job — se ejecuta cada hora
const iniciarRecordatorios = () => {
  console.log('⏰ [CRON] Job de recordatorios automáticos iniciado.');

  // Ejecutar cada hora
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ [CRON] Ejecutando job de recordatorios...');
    await enviarRecordatorios();
  });
};

module.exports = { iniciarRecordatorios, enviarRecordatorios };