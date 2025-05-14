import Joi from "joi";

export const questionSchema = Joi.object({
  title: Joi.string().trim().min(5).max(255).required(),
  companyId: Joi.number().integer().required(),
  topic: Joi.string().trim().required(),
  dbType: Joi.string().trim().required(),
  difficulty: Joi.string().trim().required(),
  status: Joi.string().valid('active', 'inactive').required(),
  Question: Joi.string().trim().required(),
  schema: Joi.string().allow('', null),
  solution: Joi.string().allow('', null)
});