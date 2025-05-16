import { ADMIN } from "../constants/constans.js";

import {
  createCompany,
  deleteCompany,
  getAllCompanies,
  updateCompany,
} from "../controllers/company.controller.js";

import express from "express";
import multer from 'multer';
import { authenticate, authorize } from "../middleware/auth.js";

export const companyRouter = express.Router();

const upload = multer();

companyRouter.post(`/${ADMIN}/create`,authenticate,authorize('admin'), upload.single('logo'), createCompany);

companyRouter.put(`/${ADMIN}/update/:id`,authenticate,authorize('admin'), updateCompany);

companyRouter.delete(`/${ADMIN}/delete/:id`,authenticate,authorize('admin'), deleteCompany);

companyRouter.get(`/${ADMIN}/get-all-companies`,authenticate,authorize('admin'), getAllCompanies);



