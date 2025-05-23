import { DataTypes } from "sequelize";
import { sequelize } from "../config/db/mysql.js";

export const Question = sequelize.define('Question', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  topicId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'topics',
      key: 'id'
    }
  },
  dbType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  difficulty: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  questionContent: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  schemaContent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  schemaImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  solution: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  query: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'questions'
});