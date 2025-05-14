import {
  createTopicService,
  deleteTopicService,
  getAllTopicsService,
  getTopicByIdService,
  updateTopicService,
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

    const topic = await createTopicService(req.body);

    res.status(201).json({ message: "Topic created successfully", topic });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const getAllTopics = async (req, res) => {
  try {
    const topics = await getAllTopicsService(req.query);

    res.status(200).json({ message: "Topics fetched successfully", topics });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
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
