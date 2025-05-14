import { ADMIN } from "../constants/constans.js";

import {
  createCompany,
  deleteCompany,
  getAllCompanies,
  updateCompany,
} from "../controllers/company.controller.js";

import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";

export const companyRouter = express.Router();

companyRouter.post(`/${ADMIN}/create`,authenticate,authorize('admin'), createCompany);

companyRouter.put(`/${ADMIN}/update/:id`,authenticate,authorize('admin'), updateCompany);

companyRouter.delete(`/${ADMIN}/delete/:id`,authenticate,authorize('admin'), deleteCompany);

companyRouter.get(`/${ADMIN}/get-all-companies`,authenticate,authorize('admin'), getAllCompanies);



