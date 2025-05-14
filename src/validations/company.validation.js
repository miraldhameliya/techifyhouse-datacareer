import Joi from "joi"

export const companySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Company name is required',
    'any.required': 'Company name is required'
  }),
  domain: Joi.string().trim().domain({ tlds: { allow: false } }).required().messages({
    'string.empty': 'Domain is required',
    'any.required': 'Domain is required'
  }),
  category: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'Category is required',
    'any.required': 'Category is required'
  }),
  status: Joi.string().valid('active', 'inactive').required().messages({
    'any.only': 'Status must be either active or inactive',
    'any.required': 'Status is required'
  }),
  logoUrl: Joi.string().uri().allow('', null).messages({
    'string.uri': 'Logo URL must be a valid URL'
  })
});
