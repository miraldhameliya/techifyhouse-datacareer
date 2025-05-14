// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/db/mysql');

import { DataTypes } from "sequelize";
import { sequelize } from "../config/db/mysql.js";

export const Company = sequelize.define('Company', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  logoUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'companies'
});
