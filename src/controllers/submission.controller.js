import { sequelize } from "../config/db/mysql.js";
import { Question } from "../models/Question.js";
import { Submission } from "../models/Submission.js";
import { User } from "../models/User.js";

export const runUserQuery = async (req, res) => {
    const { userId, questionId, code } = req.body;
  
    if (!userId || !questionId || !code) {
      return res.status(400).json({ status: "failure", error: "Missing required fields." });
    }
  
    const submittedAt = new Date();
    const start = performance.now();
    let result = null;
    let error = null;
    let status = "success";
  
    try {
      const [data] = await sequelize.query(code);
      result = data;
    } catch (err) {
      status = "error";
      error = err.message;
    }
  
    const runTime = Math.floor(performance.now() - start);

  
    return res.status(200).json({
      status,
      data: result,
      error,
      submittedAt,
      runTime,
    });
  };
  

  export const submitQuery = async (req, res) => {
    const { userId, questionId, code } = req.body;
  
    if (!userId || !questionId || !code) {
      return res.status(400).json({ status: "failure", error: "Missing required fields." });
    }
  
    const submittedAt = new Date();
    const start = performance.now();
    let result = null;
    let error = null;
    let status = "success";
  
    try {
      const [data] = await sequelize.query(code);
      result = data;
    } catch (err) {
      status = "error";
      error = err.message;
    }
  
    const runTime = Math.floor(performance.now() - start);
  
    const question = await Question.findByPk(questionId);
    const expectedResult = question?.expectedResult ? JSON.parse(question.expectedResult) : null;
  
    if (status !== "error") {
      // compare with expected result
      if (JSON.stringify(result) === JSON.stringify(expectedResult)) {
        status = "correct";
      } else {
        status = "wrong";
      }
    }
  
    const submission = await Submission.create({
      userId,
      questionId,
      code,
      status,
      result: result ? JSON.stringify(result) : null,
      error,
      runTime,
      submittedAt,
      isFinal: true,
    });
  
    const user = await User.findByPk(userId);
  
    return res.status(200).json({
      status,
      data: result,
      error,
      submittedAt,
      runTime,
      submissionId: submission.id,
      user: user ? user.email : null,
      question: question ? question.title : null,
      dbType: question ? question.dbType : null,
      score: submission.score,
    });
  };
  
  
