const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize } = require('./src/models');
const authRoutes = require('./src/routes/authRoutes');
const clienteRoutes = require('./src/routes/clienteRoutes');
const mascotaRoutes = require('./src/routes/mascotaRoutes');
const citaRoutes = require('./src/routes/citaRoutes');
const veterinarioRoutes = require('./src/routes/veterinarioRoutes');
const historiaRoutes = require('./src/routes/historiaRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/mascotas', mascotaRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/veterinarios', veterinarioRoutes);
app.use('/api/historias', historiaRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'API PetCare funcionando correctamente' });
});

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true })
  .then(() => {
    console.log('Base de datos sincronizada correctamente');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error al conectar con la base de datos:', err);
  });