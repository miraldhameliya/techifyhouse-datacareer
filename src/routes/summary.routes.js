import express from 'express';
import { getSummaryCounts } from '../controllers/summary.controller.js';
import { ADMIN } from '../constants/constans.js';
import { authenticate, authorize } from '../middleware/auth.js';
export const summaryRouter = express.Router();

summaryRouter.get(`/${ADMIN}/getSummaryCounts`, authenticate, authorize('admin'), getSummaryCounts);


