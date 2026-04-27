const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Cliente = require('./Cliente');
const Veterinario = require('./Veterinario');
const Mascota = require('./Mascota');
const Cita = require('./Cita');
const HistoriaClinica = require('./HistoriaClinica');

// Usuario → Cliente (1:1)
Usuario.hasOne(Cliente, { foreignKey: 'id_usuario', as: 'cliente' });
Cliente.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// Usuario → Veterinario (1:1)
Usuario.hasOne(Veterinario, { foreignKey: 'id_usuario', as: 'veterinario' });
Veterinario.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });

// Cliente → Mascota (1:N)
Cliente.hasMany(Mascota, { foreignKey: 'id_cliente', as: 'mascotas' });
Mascota.belongsTo(Cliente, { foreignKey: 'id_cliente', as: 'cliente' });

// Mascota → Cita (1:N)
Mascota.hasMany(Cita, { foreignKey: 'id_mascota', as: 'citas' });
Cita.belongsTo(Mascota, { foreignKey: 'id_mascota', as: 'mascota' });

// Veterinario → Cita (1:N)
Veterinario.hasMany(Cita, { foreignKey: 'id_veterinario', as: 'citas' });
Cita.belongsTo(Veterinario, { foreignKey: 'id_veterinario', as: 'veterinario' });

// Cita → HistoriaClinica (1:1)
Cita.hasOne(HistoriaClinica, { foreignKey: 'id_cita', as: 'historia' });
HistoriaClinica.belongsTo(Cita, { foreignKey: 'id_cita', as: 'cita' });

// Mascota → HistoriaClinica (1:N)
Mascota.hasMany(HistoriaClinica, { foreignKey: 'id_mascota', as: 'historias' });
HistoriaClinica.belongsTo(Mascota, { foreignKey: 'id_mascota', as: 'mascota' });

// Veterinario → HistoriaClinica (1:N)
Veterinario.hasMany(HistoriaClinica, { foreignKey: 'id_veterinario', as: 'historias' });
HistoriaClinica.belongsTo(Veterinario, { foreignKey: 'id_veterinario', as: 'veterinario' });

module.exports = {
  sequelize,
  Usuario,
  Cliente,
  Veterinario,
  Mascota,
  Cita,
  HistoriaClinica
};