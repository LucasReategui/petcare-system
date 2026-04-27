const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HistoriaClinica = sequelize.define('HistoriaClinica', {
  id_historia: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_cita: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  id_mascota: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_veterinario: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha_consulta: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  diagnostico: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tratamiento: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  peso_consulta: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  }
}, {
  tableName: 'historia_clinica',
  timestamps: false
});

module.exports = HistoriaClinica;