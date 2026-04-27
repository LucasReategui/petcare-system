const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { iniciarRecordatorios } = require('./src/jobs/recordatorios');
require('dotenv').config();
const { sequelize } = require('./src/models');
const authRoutes = require('./src/routes/authRoutes');
const clienteRoutes = require('./src/routes/clienteRoutes');
const mascotaRoutes = require('./src/routes/mascotaRoutes');
const citaRoutes = require('./src/routes/citaRoutes');
const veterinarioRoutes = require('./src/routes/veterinarioRoutes');
const historiaRoutes = require('./src/routes/historiaRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const portalRoutes = require('./src/routes/portalRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Limitador de tasa
const limiterAuth = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limitar cada IP a 100 solicitudes por ventana
  message: { mensaje: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' }
});
app.use('/api/auth', limiterAuth);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/mascotas', mascotaRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/veterinarios', veterinarioRoutes);
app.use('/api/historias', historiaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/portal', portalRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'API PetCare funcionando correctamente' });
});

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true })
  .then(() => {
    console.log('Base de datos sincronizada correctamente');
    iniciarRecordatorios(); // Iniciar el cron job para recordatorios
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error al conectar con la base de datos:', err);
  });