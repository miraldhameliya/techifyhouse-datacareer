import { Op } from "sequelize";
import { Topic } from "../models/Topic.js";

export const createTopicService = async (data) => {
  return await Topic.create(data);
};

export const getAllTopicsService = async (query) => {
  const { search } = query;
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  let where = {};
  
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { relatedDomain: { [Op.like]: `%${search}%` } }
    ];
  }

  const offset = (page - 1) * limit;
  const { count, rows: topics } = await Topic.findAndCountAll({ where, offset, limit });
  return { topics, total: count, page, limit };
};

export const getTopicByIdService = async (id) => {
  return await Topic.findByPk(id);
};

export const updateTopicService = async (id, data) => {
  const topic = await Topic.findByPk(id);
  if (!topic) throw new Error('Topic not found');
  return await topic.update(data);
};

export const deleteTopicService = async (id) => {
  const topic = await Topic.findByPk(id);
  if (!topic) throw new Error('Topic not found');
  return await topic.destroy();
};