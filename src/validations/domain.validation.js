// src/validations/domain.validation.js
import Joi from "joi";

export const domainSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).required(),
  description: Joi.string().trim().min(2).required(),
  status: Joi.string().valid('active', 'inactive').default('active')
});