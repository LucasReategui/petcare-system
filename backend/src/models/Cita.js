const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cita = sequelize.define('Cita', {
  id_cita: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_mascota: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_veterinario: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora: {
    type: DataTypes.TIME,
    allowNull: false
  },
  motivo: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('PENDIENTE', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA', 'INASISTENCIA'),
    allowNull: false,
    defaultValue: 'PENDIENTE'
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'citas',
  timestamps: true,
  createdAt: 'creado_en',
  updatedAt: false
});

module.exports = Cita;