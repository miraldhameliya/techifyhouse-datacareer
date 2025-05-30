import { Company } from "./Company.js";
import { CompanyDomains } from "./CompanyDomains.js";
import { Domain } from "./Domain.js";
import { DynamicTable } from "./DynamicTable.js";
import { DynamicTableInfo } from "./DynamicTableInfo.js";
import { DynamicTableInfoLinks } from "./DynamicTableInfoLinks.js";
import { Question } from "./Question.js";
import { Submission } from "./Submission.js";
import { Topic } from "./Topic.js";
import { User } from "./User.js";

// Define Associations
User.hasMany(Question, { foreignKey: 'userId' });
Question.belongsTo(User, { foreignKey: 'userId' });

Topic.hasMany(Question, { foreignKey: 'topicId' });
Question.belongsTo(Topic, { foreignKey: 'topicId' });

Question.hasMany(Submission, { foreignKey: 'questionId' });
Submission.belongsTo(Question, { foreignKey: 'questionId' });

User.hasMany(Submission, { foreignKey: 'userId' });
Submission.belongsTo(User, { foreignKey: 'userId' });

Company.belongsToMany(Domain, { through: CompanyDomains, foreignKey: 'companyId' });
Domain.belongsToMany(Company, { through: CompanyDomains, foreignKey: 'domainId' });

// Dynamic Table Associations
DynamicTable.belongsToMany(DynamicTableInfo, { 
  through: DynamicTableInfoLinks,
  foreignKey: 'dynamicTableId',
  as: 'infos'
});

DynamicTableInfo.belongsToMany(DynamicTable, { 
  through: DynamicTableInfoLinks,
  foreignKey: 'dynamicTableInfoId',
  as: 'tables'
});

DynamicTableInfoLinks.belongsTo(DynamicTable, { 
  foreignKey: 'dynamicTableId',
  as: 'table'
});

DynamicTableInfoLinks.belongsTo(DynamicTableInfo, { 
  foreignKey: 'dynamicTableInfoId',
  as: 'tableInfo'
});

DynamicTable.hasMany(DynamicTableInfoLinks, { 
  foreignKey: 'dynamicTableId',
  as: 'tableLinks'
});

DynamicTableInfo.hasMany(DynamicTableInfoLinks, { 
  foreignKey: 'dynamicTableInfoId',
  as: 'tableLinks'
});

export { Company, CompanyDomains, Domain, DynamicTable, DynamicTableInfo, DynamicTableInfoLinks, Question, Submission, Topic, User };

