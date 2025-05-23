// src/routes/domain.routes.js
import express from "express";
import { ADMIN } from "../constants/constans.js";
import {
  createDomain,
  getAllDomains,
  getDomainById,
  updateDomain,
  deleteDomain,
  UserGetAllDomains
} from "../controllers/domain.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
export const domainRouter = express.Router();

domainRouter.post(`/${ADMIN}/create`,authenticate,authorize('admin'), createDomain);
domainRouter.get(`/${ADMIN}/getAll`, authenticate,authorize('admin'), getAllDomains);
domainRouter.get(`/getAll`, authenticate,authorize('user'), UserGetAllDomains);
domainRouter.get(`/${ADMIN}/getById/:id`, authenticate,authorize('admin'), getDomainById);
domainRouter.put(`/${ADMIN}/update/:id`, authenticate,authorize('admin'), updateDomain);
domainRouter.delete(`/${ADMIN}/delete/:id`, authenticate,authorize('admin'), deleteDomain);