import { ADMIN } from "../constants/constans.js";
import {
  createTopic,
  deleteTopic,
  getAllTopics,
  getTopicById,
  updateTopic,
} from "../controllers/topic.controller.js";
import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";

export const topicRouter = express.Router();

topicRouter.post(`/${ADMIN}/create`,authenticate,authorize('admin'), createTopic);

topicRouter.get(`/${ADMIN}/all`,authenticate,authorize('admin'), getAllTopics);

topicRouter.get(`/${ADMIN}/:id`,authenticate,authorize('admin'), getTopicById);

topicRouter.put(`/${ADMIN}/update/:id`,authenticate,authorize('admin'), updateTopic);

topicRouter.delete(`/${ADMIN}/delete/:id`,authenticate,authorize('admin'), deleteTopic);
