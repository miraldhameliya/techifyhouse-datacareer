// src/models/CompanyDomains.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db/mysql.js";


export const CompanyDomains = sequelize.define("CompanyDomains", {
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  domainId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'domains',
      key: 'id'
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'company_domains',
  timestamps: true
});
