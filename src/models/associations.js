import { Company } from './Company.js';
import { Question } from './Question.js';

// Define associations
Company.hasMany(Question, {
  foreignKey: 'companyId',
  as: 'questions'
});

Question.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'company'
});

export { Company, Question };

