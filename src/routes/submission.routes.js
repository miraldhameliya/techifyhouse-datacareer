import express from "express";
import { runUserQuery, submitQuery } from "../controllers/submission.controller.js";

export const submissionRouter = express.Router();


submissionRouter.post('/run', runUserQuery);



submissionRouter.post('/query/submit', submitQuery);


