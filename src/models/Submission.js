import { DataTypes } from 'sequelize';
import { sequelize } from "../config/db/mysql.js";

// export const Submission = sequelize.define('Submission', {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   userId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   questionId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   code: {
//     type: DataTypes.TEXT,
//     allowNull: false,
//   },
//   status: {
//     type: DataTypes.STRING, // 'success' or 'failure'
//     allowNull: false,
//   },
//   result: {
//     type: DataTypes.TEXT, // store as JSON string
//     allowNull: true,
//   },
//   error: {
//     type: DataTypes.TEXT,
//     allowNull: true,
//   },
//   runTime: {
//     type: DataTypes.INTEGER, // milliseconds
//     allowNull: false,
//   },
//   submittedAt: {
//     type: DataTypes.DATE,
//     allowNull: false,
//     defaultValue: DataTypes.NOW,
//   },
//   isFinal: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false,
//   },
//   dbType: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },
//   score: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     defaultValue: 0
//   },
// }, {
//   tableName: 'submissions',
//   timestamps: false,
// });


export const Submission = sequelize.define('Submission', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  questionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  code: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  dbType: {
    type: DataTypes.STRING,
  },
  score: {
    type: DataTypes.FLOAT,
  },
  status: {
    type: DataTypes.ENUM('passed', 'failed', 'error'),
  },
  result: {
    type: DataTypes.JSON, // or TEXT if storing result as raw string
  },
  error: {
    type: DataTypes.TEXT,
  },
  runTime: {
    type: DataTypes.INTEGER,
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,  
  }
}); 
