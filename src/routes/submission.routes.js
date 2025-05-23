import express from "express";
import { ADMIN } from "../constants/constans.js";
import { getAllSubmissions, runUserQuery, submitQuery } from "../controllers/submission.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
export const submissionRouter = express.Router();


submissionRouter.post('/query/run',authenticate,authorize('user'), runUserQuery);



submissionRouter.post('/querys/submit',authenticate,authorize('user'), submitQuery);


submissionRouter.get(`/${ADMIN}/getAll`, authenticate, authorize('admin'), getAllSubmissions);