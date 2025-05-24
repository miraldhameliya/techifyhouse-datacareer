import { Op } from "sequelize";
import { sequelize } from "../config/db/mysql.js";
import { Topic } from "../models/index.js";
import {
  createTopicService,
  deleteTopicService,
  getTopicByIdService,
  updateTopicService
} from "../services/topic.service.js";
import { topicSchema } from "../validations/topic.validation.js";

export const createTopic = async (req, res) => {
  try {
    const { error } = topicSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map((e) => e.message),
      });
    }

    // Check if topic with same name exists
    const existingTopic = await Topic.findOne({
      where: {
        name: req.body.name
      }
    });

    if (existingTopic) {
      return res.status(400).json({ 
        message: "Topic with this name already exists" 
      });
    }

    const topic = await createTopicService(req.body);

    res.status(201).json({ message: "Topic created successfully", topic });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const getAllTopics = async (req, res) => {
  try {
    const { search } = req.query;

    // Build where clause for search
    const whereClause = search ? {
      name: {
        [Op.like]: `%${search}%`
      }
    } : {};

    const topics = await Topic.findAll({
      where: whereClause,
      attributes: [
        'id',
        'name',
        'createdAt',
        'updatedAt',
        [sequelize.literal('(SELECT COUNT(*) FROM questions WHERE questions.topicId = Topic.id)'), 'questionCount']
      ],
      order: [
        ['name', 'ASC'] // Order by name in ascending order
      ]
    });

    // Format the response
    const formattedTopics = topics.map(topic => ({
      ...topic.toJSON(),
      questionCount: parseInt(topic.getDataValue('questionCount'))
    }));

    res.status(200).json({ 
      message: "Topics fetched successfully", 
      topics: formattedTopics 
    });
  } catch (error) {
    console.error('Error in getAllTopics:', error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const userGetAllTopic = async (req, res) => {
  try {
    const topic = await Topic.findAll({
      attributes: ['id', 'name'], 
      order: [['name', 'ASC']] 
    });

    res.status(200).json({ topic });
  } catch (error) {
    console.error('Error fetching topic:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getTopicById = async (req, res) => {
  try {
    const topic = await getTopicByIdService(req.params.id);
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    res.status(200).json({ message: "Topic fetched successfully", topic });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const updateTopic = async (req, res) => {
  try {
    const { error } = topicSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map((e) => e.message),
      });
    }

    // Check if topic with same name exists (excluding current topic)
    const existingTopic = await Topic.findOne({
      where: {
        name: req.body.name,
        id: { [Op.ne]: req.params.id } // exclude current topic
      }
    });

    if (existingTopic) {
      return res.status(400).json({ 
        message: "Topic with this name already exists" 
      });
    }

    const topic = await updateTopicService(req.params.id, req.body);

    res.status(200).json({ message: "Topic updated successfully", topic });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const deleteTopic = async (req, res) => {
  try {
    const topic = await deleteTopicService(req.params.id);

    res.status(200).json({ message: "Topic deleted successfully", topic });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};
