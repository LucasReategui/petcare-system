const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Veterinario = sequelize.define('Veterinario', {
  id_veterinario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  especialidad: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  horario_inicio: {
    type: DataTypes.TIME,
    allowNull: false
  },
  horario_fin: {
    type: DataTypes.TIME,
    allowNull: false
  }
}, {
  tableName: 'veterinarios',
  timestamps: false
});

module.exports = Veterinario;