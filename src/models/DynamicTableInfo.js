import { DataTypes } from "sequelize";
import { sequelize } from "../config/db/mysql.js";

export const DynamicTableInfo = sequelize.define("DynamicTableInfo", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  schemaImageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  schemaContent: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
    // Add explicit table name to avoid pluralization issues
    tableName: 'DynamicTableInfos'
}); 