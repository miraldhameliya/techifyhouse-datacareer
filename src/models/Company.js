import { DataTypes } from "sequelize";
import { sequelize } from "../config/db/mysql.js";

export const Company = sequelize.define("Company", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("Active", "Inactive"),
    defaultValue: "Active",
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'companies',
  timestamps: true
});
