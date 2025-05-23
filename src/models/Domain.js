    // src/models/Domain.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db/mysql.js";

import { Company } from "./Company.js";
import { CompanyDomains } from "./CompanyDomains.js";

export const Domain = sequelize.define("Domain", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  tableName: 'domains',
  timestamps: true
});
// Set up the many-to-many relationship
Domain.belongsToMany(Company, {
  through: CompanyDomains,
  foreignKey: 'domainId',
  otherKey: 'companyId'
});
