import { Op } from 'sequelize';
import { Company } from '../models/Company.js';
import { Question } from '../models/Question.js';
import {
  createQuestionService,
  deleteQuestionService,
  getAllQuestionsService,
  updateQuestionService
} from "../services/question.service.js";
import { questionSchema } from "../validations/question.validation.js";

export const createQuestion = async (req, res) => {
  try {
    const { error } = questionSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map((e) => e.message),
      });
    }

    const question = await createQuestionService(req.body);

    res
      .status(201)
      .json({ message: "Question created successfully", question });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const getAllQuestions = async (req, res) => {
  try {
    const { questions, total, page, limit } = await getAllQuestionsService(
      req.query
    );

    res.status(200).json({
      message: "Questions fetched successfully",
      questions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};


export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findOne({
      where: {
        id,
        status: 'active'
      },
      attributes: [
        'id',
        'title',
        'topic',
        'dbType',
        'difficulty',
        'Question',
        'schema',
        'solution',

      ]
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { error } = questionSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map((e) => e.message),
      });
    }

    const question = await updateQuestionService(req.params.id, req.body);

    res
      .status(200)
      .json({ message: "Question updated successfully", question });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const question = await deleteQuestionService(req.params.id);

    res
      .status(200)
      .json({ message: "Question deleted successfully", question });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const filterQuestionsByCompany = async (req, res) => {
  try {
    const {
      search,
      companyId,
      topic,
      domain,
      difficulty,
      variant,
      page = 1,
      limit = 10
    } = req.query;

    // Company-level filters
    const companyWhere = {};
    if (companyId) companyWhere.id = companyId;
    if (domain) companyWhere.domain = domain;

    // Question-level filters
    const questionWhere = { status: 'active' };
    if (topic) questionWhere.topic = topic;
    if (difficulty) questionWhere.difficulty = difficulty;
    if (variant) questionWhere.dbType = variant;

    // Search logic
    let companySearch = [];
    let questionSearch = [];
    if (search) {
      questionWhere[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { topic: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (companySearch.length) companyWhere[Op.or] = companySearch;
    if (questionSearch.length) questionWhere[Op.or] = questionSearch;

    // Fetch companies with all their questions (not required)
    const companies = await Company.findAll({
      where: companyWhere,
      attributes: ['id', 'name', 'domain', 'category', 'logoUrl'],
      include: [{
        model: Question,
        as: 'questions',
        where: Object.keys(questionWhere).length > 0 ? questionWhere : undefined,
        attributes: [
          'id', 'title', 'topic', 'dbType', 'difficulty', 'Question', 'schema'
        ],
        required: false // <-- allow companies with 0 questions
      }],
      order: [
        ['name', 'ASC'],
        [{ model: Question, as: 'questions' }, 'title', 'ASC']
      ]
    });

    // Filter: only return companies that match search OR have at least one matching question
    const filteredCompanies = companies
      .map(company => {
        // Check if company matches search
        const companyMatches = search
          ? (company.name.toLowerCase().includes(search.toLowerCase()) ||
             company.domain.toLowerCase().includes(search.toLowerCase()))
          : true;

        let filteredQuestions = company.questions;

        if (search && !companyMatches) {
          // Only filter questions if company does NOT match
          filteredQuestions = company.questions.filter(q =>
            q.title.toLowerCase().includes(search.toLowerCase()) ||
            q.topic.toLowerCase().includes(search.toLowerCase())
          );
        }

        // Only return company if:
        // - company matches search (show all questions)
        // - or at least one question matches search
        if (companyMatches || filteredQuestions.length > 0) {
          return {
            ...company.toJSON(),
            questions: filteredQuestions
          };
        }

        return null;

      })
      .filter(Boolean);

    res.json({
      companies: filteredCompanies,
      total: filteredCompanies.length,
      page: parseInt(page),
      totalPages: Math.ceil(filteredCompanies.length / limit)
    });
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

