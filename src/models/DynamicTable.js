import { DataTypes } from "sequelize";
import { sequelize } from "../config/db/mysql.js";

export const DynamicTable = sequelize.define("DynamicTable", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tableName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  createTableQuery: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  insertDataQuery: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}); 