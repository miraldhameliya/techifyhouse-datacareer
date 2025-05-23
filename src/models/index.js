import { Company } from './Company.js';
import { CompanyDomains } from './CompanyDomains.js';
import { Domain } from './Domain.js';
import { Question } from './Question.js';
import { Submission } from './Submission.js';
import { Topic } from './Topic.js';
import { User } from './User.js';

// Define associations here
User.hasMany(Submission, { foreignKey: 'userId' });
Submission.belongsTo(User, { foreignKey: 'userId' });

Question.hasMany(Submission, { foreignKey: 'questionId' });
Submission.belongsTo(Question, { foreignKey: 'questionId' });

// Set up relationships
Company.belongsToMany(Domain, {
  through: CompanyDomains,
  foreignKey: 'companyId',
  otherKey: 'domainId'
});

Domain.belongsToMany(Company, {
  through: CompanyDomains,
  foreignKey: 'domainId',
  otherKey: 'companyId'
});

// Add direct associations for CompanyDomains
Company.hasMany(CompanyDomains, {
  foreignKey: 'companyId'
});

CompanyDomains.belongsTo(Company, {
  foreignKey: 'companyId'
});

Domain.hasMany(CompanyDomains, {
  foreignKey: 'domainId'
});

CompanyDomains.belongsTo(Domain, {
  foreignKey: 'domainId'
});

// New associations
Company.hasMany(Question, {
  foreignKey: 'companyId',
  as: 'questions'
});

Question.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'company'
});

Topic.hasMany(Question, {
  foreignKey: 'topicId',
  as: 'questions'
});

Question.belongsTo(Topic, {
  foreignKey: 'topicId',
  as: 'topic'
});

export { Company, CompanyDomains, Domain, Question, Submission, Topic, User };

