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
  topic: {
    type: DataTypes.STRING,
    allowNull: false
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
  Question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  schema: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  solution: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'questions'
});

// If you want to use associations
// Question.belongsTo(Company, { foreignKey: 'companyId' });
