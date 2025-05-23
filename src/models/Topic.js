import { DataTypes } from "sequelize";
import { sequelize } from "../config/db/mysql.js";

export const Topic = sequelize.define('Topic', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'topics'
});
