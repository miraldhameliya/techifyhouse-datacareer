import { Question } from "../models/Question.js";
import { Op } from "sequelize";


export const createQuestionService = async (data) => {
  const question = await Question.create(data);
  if (!question) {
    throw new Error('Question not created');
  }
  
  return question;
};

export const getAllQuestionsService = async (query) => {
  const { search, companyId, dbType, difficulty, status, page = 1, limit = 10 } = query;

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

  const offset = (page - 1) * limit;
  const questions = await Question.findAll({ where, offset: Number(offset), limit: Number(limit) });
  const total = await Question.count({ where });
  return { questions, total, page: Number(page), limit: Number(limit) };
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

