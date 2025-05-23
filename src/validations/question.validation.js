import Joi from "joi";

export const questionSchema = Joi.object({
  title: Joi.string().trim().min(5).max(255).required(),
  companyId: Joi.number().integer().required(),
  topicId: Joi.number().required(),
  dbType: Joi.string().trim().required(),
  difficulty: Joi.string().trim().required(),
  status: Joi.string().valid('active', 'inactive').default('active'),
  questionContent: Joi.string().trim().required(),
  schemaContent: Joi.string().allow('', null),
  schemaImage: Joi.string().allow('', null),
  solution: Joi.string().allow('', null),
  query: Joi.object({
    createTable: Joi.string().required(),
    addData: Joi.string().required()
  }).required()
  
  
});