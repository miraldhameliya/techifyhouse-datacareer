import { Company } from './Company.js';
import { Question } from './Question.js';
import { Topic } from './Topic.js';

// Define associations
Company.hasMany(Question, {
  foreignKey: 'companyId',
  as: 'questions'
});

Question.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'company'
});

// Topic associations
Topic.hasMany(Question, {
  foreignKey: 'topicId',
  as: 'questions'
});

Question.belongsTo(Topic, {
  foreignKey: 'topicId',
  as: 'topic'
});

export { Company, Question, Topic };

