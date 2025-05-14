

import { loginAdminService, loginUserService, registerUserService } from "../services/auth.service.js";
import { loginSchema, registerSchema } from "../validations/auth.validation.js";


export const  signup = async (req, res) => {
  try {
     const { error } = registerSchema.validate(req.body, { abortEarly: false });
     if (error) {
       return res.status(400).json({
         message: 'Validation error',
         errors: error.details.map((err) => err.message),
       });
     }
    
     const result = await registerUserService(req.body);

    res.status(201).json(result);
  } catch (error) {

    console.error(error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

export const  login = async (req, res) => {
  try {
   
    const { error } = loginSchema.validate(req.body, { abortEarly: false });
    
    console.log(error);
    
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.details.map((err) => err.message),
      });
    }
    
    const result = await loginUserService(req.body);

    res.status(201).json(result);
  } catch (error) {

    console.error(error);

    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

export const  adminLogin = async (req, res) => {
  try {

    const { error } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.details.map((err) => err.message),
      });
    }

    const result = await loginAdminService(req.body);

    res.status(201).json(result);
  } catch (error) {
    
    console.error(error);

    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};






