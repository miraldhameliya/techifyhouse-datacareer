import express from "express";
import { ADMIN } from "../constants/constans.js";
import {
  createQuestion,
  deleteQuestion,
  filterQuestionsByCompany,
  getAllQuestions,
  getQuestionById,
  getQuestionDetailsWithSubmissions,
  getUserProgress,
  updateQuestion
} from "../controllers/question.controller.js";

import multer from 'multer';
import { authenticate, authorize } from "../middleware/auth.js";

export const questionRouter = express.Router();
// authenticate,authorize('admin')
const upload = multer(); // No dest, so file is kept in memory (buffer)

questionRouter.post(`/${ADMIN}/create`,authenticate,authorize('admin'), upload.single('schemaImage'), createQuestion);

questionRouter.get(`/${ADMIN}/getAll`,authenticate,authorize('admin'), getAllQuestions);

questionRouter.get(`/${ADMIN}/getById/:id`,authenticate,authorize('admin'), getQuestionById);


questionRouter.put(`/${ADMIN}/update/:id`, upload.single('schemaImage'), updateQuestion);

questionRouter.delete(`/${ADMIN}/delete/:id`,authenticate,authorize('admin'), deleteQuestion);

questionRouter.get(`/filterbycompany`,authenticate,authorize('user'), filterQuestionsByCompany);

questionRouter.get(`/getUserProgress`,authenticate,authorize('user'),getUserProgress)

questionRouter.get('/:id',authenticate, authorize('user'), getQuestionDetailsWithSubmissions);


