import { Op } from "sequelize";
import { Company, Question, Topic } from "../models/index.js";


export const createQuestionService = async (data) => {
  const question = await Question.create(data);
  if (!question) {
    throw new Error('Question not created');
  }
  
  return question;
};

export const getAllQuestionsService = async (query) => {
  const { search, companyId, dbType, difficulty, status } = query;

  let where = {};

  
  if (search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { topic: { [Op.like]: `%${search}%` } }
      
    ];
  }


  if (companyId) {
    where.companyId = companyId;
  }


  if (dbType) {
    where.dbType = dbType;
  }

 
  if (difficulty) {
    where.difficulty = difficulty;
  }


  if (status) {
    where.status = status;
  }

  const questions = await Question.findAll({
    where,
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
  return { questions};
};

export const getQuestionByIdService = async (id) => {
  const question = await Question.findByPk(id);
  if (!question) {
    throw new Error('Question not found');
  }
  
  return question;
};  

export const updateQuestionService = async (id, data) => {
  const question = await Question.findByPk(id);
  if (!question) {
    throw new Error('Question not found');
  }
  
  return await question.update(data);
};

export const deleteQuestionService = async (id) => {
  const question = await Question.findByPk(id);
  if (!question) {
    throw new Error('Question not found');
  }
  
  return await question.destroy();
};

