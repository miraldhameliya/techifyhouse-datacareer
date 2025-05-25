import { Op } from "sequelize";
import { sequelize } from "../config/db/mysql.js";
import { Question } from "../models/Question.js";
import { Submission } from "../models/Submission.js";
import { User } from "../models/User.js";

export const runUserQuery = async (req, res) => {
  // Get userId from token (req.user)
  const userId = req.user?.id;
  const { questionId, code } = req.body;

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
    userId, // Optionally return userId for debugging
  });
};



export const submitQuery = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { questionId, code, dbType } = req.body;

    if (!userId || !questionId || !code || !dbType) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const submittedAt = new Date();
    const start = performance.now();
    let result = null;
    let error = null;
    let status = 'passed';
    let score = 0;
    const question = await Question.findByPk(questionId);
    if (!question || !question.solutionQuery) {
      return res.status(404).json({ message: "Solution not found for this question." });
    }
    const solutionQuery = question.solutionQuery;
    try {
      const [userResult] = await sequelize.query(code);
      const [solutionResult] = await sequelize.query(solutionQuery);  
      const stringify = JSON.stringify; 
      if(stringify(userResult) === stringify(solutionResult)){
        result = userResult;
        score = 100;
      }else{
        status = 'mismatch';
        error = "Your query's output doesn't match with the solution's output!";
        score = 0;
      }
      // Example scoring logic (adjust as needed)
    } catch (err) {
      status = 'error';
      error = err.message;
      score = 0;
    }

    const runTime = Math.floor(performance.now() - start);

    const submission = await Submission.create({
      userId,
      questionId,
      code,
      dbType,
      score,
      status,
      result,
      error,
      runTime,
      submittedAt,
    });

    return res.status(200).json({
      message: status === 'passed' ? "Correct answer!" :
      status === 'mismatch' ? "Your query's output doesn't match with the solution's output!" :
      "There was an error while executing your query.",
      submission,
    });
  } catch (e) {
    console.error("SubmitQuery Error:", e);
    return res.status(500).json({ message: "Something went wrong!", error: e.message });
  }
};


export const getAllSubmissions = async (req, res) => {
  try {
    // Get filters and search from query params
    const { questionId, dbType, status, search } = req.query;

    // Build where clause for Submission
    const submissionWhere = {};
    if (status) submissionWhere.status = status;

    // Base includes
    const includes = [
      {
        model: User,
        attributes: ['email']
      },
      {
        model: Question,
        attributes: ['title', 'dbType']
      }
    ];

    // Add filters and search conditions
    if (dbType) {
      includes[1].where = { ...includes[1].where, dbType };
    }

    if (questionId) {
      includes[1].where = { ...includes[1].where, id: questionId };
    }

    // If there's a search term, add it to the where clause
    if (search) {
      submissionWhere[Op.or] = [
        { '$User.email$': { [Op.like]: `%${search}%` } },
        { '$Question.title$': { [Op.like]: `%${search}%` } }
      ];
    }

    const submissions = await Submission.findAll({
      where: submissionWhere,
      include: includes,
      order: [
        ['userId', 'ASC'],
        ['questionId', 'ASC'],
        [sequelize.literal(`FIELD(Submission.status, 'passed', 'failed', 'error')`), 'ASC'],
        ['submittedAt', 'DESC']
      ]
    });

    // Filter to only best submission per user-question
    const seen = new Set();
    const filtered = [];
    for (const sub of submissions) {
      const key = `${sub.userId}-${sub.questionId}`;
      if (!seen.has(key)) {
        filtered.push({
          user: sub.User?.email,
          question: sub.Question?.title,
          dbType: sub.Question?.dbType,
          status: sub.status,
          dateTime: sub.submittedAt ? sub.submittedAt.toISOString().replace('T', ' ').substring(0, 19) : '',
          id: sub.id
        });
        seen.add(key);
      }
    }

    res.status(200).json({ 
      message: "Submissions fetched successfully",
      submissions: filtered 
    });
  } catch (error) {
    console.error('Error in getAllSubmissions:', error);
    res.status(500).json({ message: "Failed to fetch submissions", error: error.message });
  }
};

// export const submitQuery = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     const { questionId, code, dbType } = req.body;

//     if (!userId || !questionId || !code || !dbType) {
//       return res.status(400).json({ message: "Missing required fields." });
//     }

//     const submittedAt = new Date();
//     const start = performance.now();
//     let result = null;
//     let error = null;
//     let status = 'passed';
//     let score = 0;

//     try {
//       const [data] = await sequelize.query(code);
//       result = data;

//       // Example scoring logic (adjust as needed)
//       score = 100;
//     } catch (err) {
//       status = 'error';
//       error = err.message;
//       score = 0;
//     }

//     const runTime = Math.floor(performance.now() - start);

//     const submission = await Submission.create({
//       userId,
//       questionId,
//       code,
//       dbType,
//       score,
//       status,
//       result,
//       error,
//       runTime,
//       submittedAt,
//     });

//     return res.status(200).json({
//       message: "Submission saved successfully.",
//       submission,
//     });
//   } catch (e) {
//     console.error("SubmitQuery Error:", e);
//     return res.status(500).json({ message: "Something went wrong!", error: e.message });
//   }
// };