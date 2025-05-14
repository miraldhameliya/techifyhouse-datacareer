import express from "express";
import { ADMIN } from "../constants/constans.js";
import {
  createQuestion,
  deleteQuestion,
  filterQuestionsByCompany,
  getAllQuestions,
  getQuestionById,
  updateQuestion
} from "../controllers/question.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

export const questionRouter = express.Router();

questionRouter.post(`/${ADMIN}/create`,authenticate,authorize('admin'), createQuestion);

questionRouter.get(`/${ADMIN}/getAll`,authenticate,authorize('admin'), getAllQuestions);

questionRouter.get(`/${ADMIN}/getById/:id`,authenticate,authorize('admin'), getQuestionById);

questionRouter.put(`/${ADMIN}/update/:id`,authenticate,authorize('admin'), updateQuestion);

questionRouter.delete(`/${ADMIN}/delete/:id`,authenticate,authorize('admin'), deleteQuestion);



// Filter questions by company
questionRouter.get('/filterbycompany', filterQuestionsByCompany);

// Get a specific question by ID
questionRouter.get('/:id', getQuestionById);

