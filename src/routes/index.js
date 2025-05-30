import express from "express";
import { authRouter } from "../routes/auth.routes.js";
import { companyRouter } from "../routes/company.routes.js";
import { domainRouter } from "../routes/domain.routes.js";
import { dynamicTableRouter } from "../routes/dynamicTable.routes.js";
import { dynamicTableInfoRouter } from "../routes/dynamicTableInfo.routes.js";
import { questionRouter } from "../routes/question.routes.js";
import { submissionRouter } from "../routes/submission.routes.js";
import { summaryRouter } from "../routes/summary.routes.js";
import { topicRouter } from "../routes/topic.routes.js";

export const router = express.Router();

router.use('/auth', authRouter);

router.use('/company', companyRouter);

router.use('/question', questionRouter);

router.use('/topic', topicRouter);

router.use('/summary', summaryRouter);

router.use('/submission', submissionRouter);

router.use('/domain', domainRouter);

router.use('/dynamicTable', dynamicTableRouter);

router.use('/dynamicTableInfo', dynamicTableInfoRouter);


