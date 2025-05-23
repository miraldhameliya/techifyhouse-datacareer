import { Op } from "sequelize";
import { Topic } from "../models/Topic.js";

export const createTopicService = async (data) => {
  return await Topic.create(data);
};

export const getAllTopicsService = async (query) => {
  const { search } = query;

  let where = {};
  
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
    ];
  }

  const topics = await Topic.findAll({ where });
  return { topics };
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