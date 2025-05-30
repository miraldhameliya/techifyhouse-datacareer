import { DataTypes } from "sequelize";
import { sequelize } from "../config/db/mysql.js";

export const DynamicTableInfoLinks = sequelize.define("DynamicTableInfoLinks", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  dynamicTableId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'DynamicTables',
      key: 'id',
    },
  },
  dynamicTableInfoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'DynamicTableInfos',
      key: 'id',
    },
  },
}, {
  // Optional: Add unique constraint on the pair to prevent duplicate links
  indexes: [
    {
      unique: true,
      fields: ['dynamicTableId', 'dynamicTableInfoId']
    }
  ],
  tableName: 'DynamicTableInfoLinks'
});
