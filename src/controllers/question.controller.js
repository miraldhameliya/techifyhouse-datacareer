import { Op } from 'sequelize';
import { sequelize } from '../config/db/mysql.js';
import { Company, CompanyDomains, Domain, Question, Submission, Topic } from '../models/index.js';
import {
  createQuestionService,
  getAllQuestionsService,
  updateQuestionService
} from "../services/question.service.js";
import { saveToCloud } from '../utils/cloudinary.js';
import { questionSchema } from "../validations/question.validation.js";



export const createQuestion = async (req, res) => {
  try {
    const file = req.file;
    if (typeof req.body.query === 'string') {
      try {
        req.body.query = JSON.parse(req.body.query);
      } catch (e) {
        return res.status(400).json({ message: "Invalid query JSON" });
      }
    }

    const company = await sequelize.models.Company.findByPk(req.body.companyId);
    if (!company) {
      return res.status(400).json({ message: "Invalid companyId: No matching company found" });
    }


    const topic = await sequelize.models.Topic.findByPk(req.body.topicId);
    if (!topic) {
      return res.status(400).json({ message: "Invalid topicId: No matching topic found" });
    }

    const { error } = questionSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map((e) => e.message),
      });
    }

    const { createTable, addData } = req.body.query;

    try {
      await sequelize.query(createTable);
      await sequelize.query(addData);
    } catch (sqlErr) {
      return res.status(400).json({
        message: "SQL Error while executing query",
        error: sqlErr.message,
      });
    }

    let schemaImageUrl = null;
    console.log(req.file);

    if (req.file) {
      schemaImageUrl = await saveToCloud(req.file, 'questions', req.body.companyId || 'general');
    }

    const data = {
      ...req.body,
      schemaImage: schemaImageUrl,
      query: JSON.stringify(req.body.query),
    };


    const question = await createQuestionService(data);

    res.status(201).json({ message: "Question created successfully", question });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};


export const getAllQuestions = async (req, res) => {
  try {
    const { questions } = await getAllQuestionsService(req.query);

    // Get all questions with company and topic details
    const questionsWithDetails = await Question.findAll({
      where: { id: questions.map(q => q.id) },
      attributes: [
        'id',
        'title',
        'companyId',
        'topicId',
        'dbType',
        'difficulty',
        'status',
        'questionContent',
        'schemaContent',
        'schemaImage',
        'solution',
        'query',
        'createdAt',
        'updatedAt'
      ],
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['name']
        },
        {
          model: Topic,
          as: 'topic',
          attributes: ['name']
        }
      ]
    });

    // Transform the response to include company and topic names
    const formattedQuestions = questionsWithDetails.map(question => ({
      ...question.toJSON(),
      company: question.company ? question.company.name : null,
      topic: question.topic ? question.topic.name : null
    }));

    res.status(200).json({
      message: "Questions fetched successfully",
      questions: formattedQuestions
    });
  } catch (error) {
    console.error('Error in getAllQuestions:', error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};


export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findByPk(id, {
      attributes: [
        'id',
        'title',
        'companyId',
        'topicId',
        'dbType',
        'difficulty',
        'status',
        'questionContent',
        'schemaContent',
        'schemaImage',
        'solution',
        'query',
        'createdAt',
        'updatedAt'
      ]
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json({ message: "Question fetched successfully", question });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const file = req.file;
    if (typeof req.body.query === 'string') {
      try {
        req.body.query = JSON.parse(req.body.query);
      } catch (e) {
        return res.status(400).json({ message: "Invalid query JSON" });
      }
    }
    const company = await sequelize.models.Company.findByPk(req.body.companyId);
    if (!company) {
      return res.status(400).json({ message: "Invalid companyId: No matching company found" });
    }

    const topic = await sequelize.models.Topic.findByPk(req.body.topicId);
    if (!topic) {
      return res.status(400).json({ message: "Invalid topicId: No matching topic found" });
    }
    const { error } = questionSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map((e) => e.message),
      });
    }
    const question = await Question.findByPk(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Extract table name from the old query
    const oldQuery = JSON.parse(question.query);
    const oldMatch = oldQuery.createTable.match(/CREATE TABLE(?: IF NOT EXISTS)? (\w+)/i);
    
    // Extract table name from the new query
    const { createTable, addData } = req.body.query;
    const newMatch = createTable.match(/CREATE TABLE(?: IF NOT EXISTS)? (\w+)/i);

    // Drop the old table if it exists
    if (oldMatch) {
      const oldTableName = oldMatch[1];
      await sequelize.query(`DROP TABLE IF EXISTS ${oldTableName}`);
    }

    // Create new table and add data
    try {
      await sequelize.query(createTable);
      await sequelize.query(addData);
    } catch (sqlErr) {
      return res.status(400).json({
        message: "SQL Error while executing query",
        error: sqlErr.message,
      });
    }

    let schemaImageUrl = question.schemaImage; // Keep existing image by default
    if (req.file) {
      schemaImageUrl = await saveToCloud(req.file, 'questions', req.body.companyId || 'general');
    }

    const data = {
      ...req.body,
      schemaImage: schemaImageUrl,
      query: JSON.stringify(req.body.query),
    };

    const updatedQuestion = await updateQuestionService(req.params.id, data);

    res.status(200).json({ message: "Question updated successfully", question: updatedQuestion });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Extract table name from the query
    const query = JSON.parse(question.query);
    const createTable = query.createTable;
    const match = createTable.match(/CREATE TABLE(?: IF NOT EXISTS)? (\w+)/i);

    if (match) {
      const tableName = match[1];
      // Drop the table if it exists
      await sequelize.query(`DROP TABLE IF EXISTS ${tableName}`);
    }

    // Delete the question
    await question.destroy();

    res.status(200).json({ message: "Question and associated table deleted successfully" });
  } catch (error) {
    console.error('Error in deleteQuestion:', error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const filterQuestionsByCompany = async (req, res) => {
  try {
    const {
      companyId,
      topicId,
      domainId,
      difficulty,
      variant,
      search,
    } = req.query;


    let companyWhere = {};
    let companyDomainWhere = {};
    let questionWhere = {
      status: 'active'
    };


    if (search && search.trim() !== '') {
      const searchTerm = search.trim();


      const searchCondition = {
        [Op.or]: [
          { '$Company.name$': { [Op.like]: `%${searchTerm}%` } },
          { '$Company.category$': { [Op.like]: `%${searchTerm}%` } },
          { '$questions.title$': { [Op.like]: `%${searchTerm}%` } },
          { '$questions.difficulty$': { [Op.like]: `%${searchTerm}%` } },
        ]
      };


      companyWhere = {
        ...companyWhere,
        ...searchCondition
      };
    }



    if (companyId) {
      try {
        const companyIds = JSON.parse(companyId);
        companyWhere.id = {
          [Op.in]: Array.isArray(companyIds) ? companyIds : [companyIds]
        };
      } catch (e) {
        return res.status(400).json({ message: "Invalid companyId format" });
      }
    }

    if (domainId) {
      try {
        const domainIds = JSON.parse(domainId);
        companyDomainWhere.domainId = {
          [Op.in]: Array.isArray(domainIds) ? domainIds : [domainIds]
        };
      } catch (e) {
        return res.status(400).json({ message: "Invalid domainId format" });
      }
    }


    if (topicId) {
      const topicIds = JSON.parse(topicId)
      questionWhere.topicId = {
        [Op.in]: Array.isArray(topicIds) ? topicIds : [topicIds]
      };
    }

    if (difficulty) {
      try {

        const cleanDifficulty = difficulty.replace(/\s+/g, '').replace(/([a-zA-Z]+)/g, '"$1"');
        const difficultyIds = JSON.parse(cleanDifficulty);
        questionWhere.difficulty = {
          [Op.in]: Array.isArray(difficultyIds) ? difficultyIds : [difficultyIds]
        };
      } catch (e) {
        return res.status(400).json({
          message: "Invalid difficulty format. Please provide difficulty values as a JSON array of strings, e.g. [\"beginner\",\"advanced\"]"
        });
      }
    }
    if (variant) {
      try {
        // First, clean up the string by removing spaces and ensuring proper JSON format
        const cleanVariant = variant.replace(/\s+/g, '').replace(/([a-zA-Z]+)/g, '"$1"');
        const variantIds = JSON.parse(cleanVariant);
        questionWhere.dbType = {
          [Op.in]: Array.isArray(variantIds) ? variantIds : [variantIds]
        };
      } catch (e) {
        return res.status(400).json({
          message: "Invalid variant format. Please provide variant values as a JSON array of strings, e.g. [\"sql\",\"python\"]"
        });
      }
    }

    const companies = await Company.findAll({
      where: companyWhere,
      attributes: ['id', 'name', 'category', 'logo'],
      include: [
        {
          model: Question,
          as: 'questions',
          attributes: [
            'id', 'title', 'topicId', 'dbType', 'difficulty',
            'questionContent', 'schemaContent', 'schemaImage', 'solution'
          ],
          where: questionWhere, // <-- only apply if `search` or filters exist
          required: false,
          include: [{
            model: Topic,
            as: 'topic',
            required: false
          }]
        },
        {
          model: CompanyDomains,
          where: companyDomainWhere,
          required: true,
          include: [{
            model: Domain,
            attributes: ['id', 'name'],
          }]
        }
      ],
      order: [
        ['name', 'ASC'],
        [{ model: Question, as: 'questions' }, 'title', 'ASC']
      ]
    });

    // After fetching, filter companies to include only those with at least one question
    const filteredCompanies = companies
      .map(c => c.toJSON())
      .filter(c => c.questions && c.questions.length > 0);


    // const filteredCompanies = companies.map(company => ({
    //   ...company.toJSON(),
    //   questions: company.questions
    // }));
    const total = await Company.count({
      where: companyWhere,
      include: [{
        model: Question,
        as: 'questions',
        where: questionWhere,
        required: true
      }]
    });

    res.json({
      companies: filteredCompanies,
      total,
    });

  } catch (error) {
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

export const getQuestionByIdForUser = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findByPk(id, {
      attributes: [
        'id',
        'title',
        'companyId',
        'topicId',
        'dbType',
        'difficulty',
        'status',
        'questionContent',
        'schemaContent',
        'schemaImage',
        'solution',

      ]
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json({ message: "Question fetched successfully", question });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

// export const filterQuestionsByCompany = async (req, res) => {
//   try {
//     const {
//       search,
//       companyId,
//       topic,
//       domain,
//       difficulty,
//       variant,
//       page = 1,
//       limit = 10
//     } = req.query;

//     const companyWhere = {};
//     if (companyId) companyWhere.id = companyId;
//     if (domain) companyWhere.domain = domain;

//     // Question-level filters
//     const questionWhere = { status: 'active' };
//     if (topic) questionWhere.topic = topic;
//     if (difficulty) questionWhere.difficulty = difficulty;
//     if (variant) questionWhere.dbType = variant;

//     // Build question search
//     const questionSearch = search
//       ? {
//           [Op.or]: [
//             { title: { [Op.like]: `%${search}%` } },
//             { topic: { [Op.like]: `%${search}%` } }
//           ]
//         }
//       : null;

//     // Build company search
//     const companySearch = search
//       ? {
//           [Op.or]: [
//             { name: { [Op.like]: `%${search}%` } },
//             { domain: { [Op.like]: `%${search}%` } }
//           ]
//         }
//       : null;

//     if (companySearch) {
//       Object.assign(companyWhere, companySearch);
//     }

//     const companies = await Company.findAll({
//       where: companyWhere,
//       attributes: ['id', 'name', 'domain', 'category', 'logoUrl'],
//       include: [
//         {
//           model: Question,
//           as: 'questions',
//           where: {
//             ...questionWhere,
//             ...(questionSearch || {})
//           },
//           attributes: ['id', 'title', 'topic', 'dbType', 'difficulty', 'Question', 'schema'],
//           required: false
//         }
//       ],
//       order: [
//         ['name', 'ASC'],
//         [{ model: Question, as: 'questions' }, 'title', 'ASC']
//       ]
//     });

//     const filteredCompanies = await Promise.all(
//       companies.map(async (company) => {
//         const companyMatched = search
//           ? (company.name.toLowerCase().includes(search.toLowerCase()) ||
//              company.domain.toLowerCase().includes(search.toLowerCase()))
//           : true;

//         let questions = company.questions || [];

//         // If company matched but has 0 questions due to question search, load all
//         if (companyMatched && search && questions.length === 0) {
//           questions = await Question.findAll({
//             where: {
//               companyId: company.id,
//               status: 'active'
//             },
//             attributes: ['id', 'title', 'topic', 'dbType', 'difficulty', 'Question', 'schema'],
//             order: [['title', 'ASC']]
//           });
//         }

//         // If not matched by company, but has questions, keep it
//         if (companyMatched || questions.length > 0) {
//           return {
//             ...company.toJSON(),
//             questions
//           };
//         }

//         return null;
//       })
//     );

//     const finalCompanies = filteredCompanies.filter(Boolean);

//     res.json({
//       companies: finalCompanies,
//       total: finalCompanies.length,
//       page: parseInt(page),
//       totalPages: Math.ceil(finalCompanies.length / limit)
//     });
//   } catch (error) {
//     console.error('Filter error:', error);
//     res.status(500).json({ message: error.message || 'Internal Server Error' });
//   }
// };

export const getUserProgress = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is available here

    // Find all submissions for the user and include the question's difficulty
    const userSubmissions = await Submission.findAll({
      where: {
        userId: userId
      },
      include: [{
        model: Question,
        as: 'Question',
        attributes: ['difficulty']
      }],
      order: [
        ['questionId', 'ASC'],
        ['submittedAt', 'DESC'] // Order to easily get the latest status per question
      ]
    });

    const progress = {
      totalAttempted: 0,
      totalSolved: 0,
      overallProgress: 0,
      difficultyProgress: {
        beginner: { attempted: 0, solved: 0 },
        intermediate: { attempted: 0, solved: 0 },
        advanced: { attempted: 0, solved: 0 },
      }
    };

    const attemptedQuestions = new Set();
    const solvedQuestions = new Set();
    const attemptedByDifficulty = { beginner: new Set(), intermediate: new Set(), advanced: new Set() };
    const solvedByDifficulty = { beginner: new Set(), intermediate: new Set(), advanced: new Set() };


    userSubmissions.forEach(submission => {
      const questionId = submission.questionId;
      const difficulty = submission.Question.difficulty.toLowerCase();
      const status = submission.status;

      // Count attempted unique questions
      if (!attemptedQuestions.has(questionId)) {
        attemptedQuestions.add(questionId);
        progress.totalAttempted++;
      }

      // Count attempted by difficulty (unique questions per difficulty)
      if (!attemptedByDifficulty[difficulty].has(questionId)) {
        attemptedByDifficulty[difficulty].add(questionId);
        progress.difficultyProgress[difficulty].attempted++;
      }

      // Count solved unique questions (only count the first 'passed' submission for a question)
      if (status === 'passed' && !solvedQuestions.has(questionId)) {
        solvedQuestions.add(questionId);
        progress.totalSolved++;
      }

      // Count solved by difficulty (unique questions per difficulty with status 'passed')
      if (status === 'passed' && !solvedByDifficulty[difficulty].has(questionId)) {
        solvedByDifficulty[difficulty].add(questionId);
        progress.difficultyProgress[difficulty].solved++;
      }
    });


    const totalQuestionsCount = await Question.count(); // Get total number of questions

    // Calculate overall progress percentage
    if (totalQuestionsCount > 0) {
      progress.overallProgress = Math.round((progress.totalSolved / totalQuestionsCount) * 100);
    } else {
      progress.overallProgress = 0;
    }


    res.status(200).json({
      message: "User progress fetched successfully",
      progress
    });

  } catch (error) {
    console.error('Error in getUserProgress:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

export const getQuestionDetailsWithSubmissions = async (req, res) => {
  try {
    const questionId = req.params.id;
    const userId = req.user.id; // Assuming user ID is available here

    // 1. Fetch question details
    const question = await Question.findByPk(questionId, {
      attributes: [
        'id',
        'title',
        'companyId',
        'topicId',
        'dbType',
        'difficulty',
        'status',
        'questionContent',
        'schemaContent',
        'schemaImage',
        'solution',
      ],
      include: [ // Include Company and Topic names for context if needed, based on the SS
        {
          model: Company,
          as: 'company',
          attributes: ['name']
        },
        {
          model: Topic,
          as: 'topic',
          attributes: ['name']
        }
      ]
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // 2. Fetch user's submissions for this question
    const userSubmissions = await Submission.findAll({
      where: {
        userId: userId,
        questionId: questionId
      },
      attributes: [
        'id',
        'code',
        'dbType',
        'score',
        'status',
        'result',
        'error',
        'runTime',
        'submittedAt',
      ],
      order: [
        ['submittedAt', 'DESC'] // Latest submissions first
      ]
    });

    res.status(200).json({
      message: "Question details and user submissions fetched successfully",
      question: question,
      submissions: userSubmissions
    });

  } catch (error) {
    console.error('Error in getQuestionDetailsWithSubmissions:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};
