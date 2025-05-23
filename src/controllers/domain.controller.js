// src/controllers/domain.controller.js
import { Domain } from '../models/Domain.js';
import { domainSchema } from '../validations/domain.validation.js';
import { Op } from 'sequelize'; // make sure to import this
export const createDomain = async (req, res) => {
  try {
    const { error } = domainSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ message: "Validation error", errors: error.details.map(e => e.message) });
    }
    const domain = await Domain.create(req.body);
    res.status(201).json({ message: "Domain created successfully", domain });
  } catch (err) {
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

export const UserGetAllDomains = async (req, res) => {
  try {
    const domains = await Domain.findAll({
      attributes:['id','name'],
      order:[['name','ASC']]
    });
    res.status(200).json({ message: "Domains fetched successfully", domains });
  } catch (err) {
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};


export const getAllDomains = async (req, res) => {
  try {
    const { search = '', status } = req.query;

    // Build `where` condition dynamically
    const whereClause = {};

    // 🔍 Search by name or description
    if (search && search.trim() !== '') {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search.trim()}%` } },
        { description: { [Op.like]: `%${search.trim()}%` } }
      ];
    }

    // 🟢 Filter by status (optional)
    if (status && status !== 'All') {
      whereClause.status = status.toLowerCase(); // assuming status is stored as "active"/"inactive"
    }

    const domains = await Domain.findAll({
      where: whereClause,
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      message: "Domains fetched successfully",
      domains
    });

  } catch (err) {
    res.status(500).json({
      message: err.message || "Internal Server Error"
    });
  }
};

export const getDomainById = async (req, res) => {
  try {
    const domain = await Domain.findByPk(req.params.id);
    if (!domain) return res.status(404).json({ message: "Domain not found" });
    res.status(200).json({ message: "Domain fetched successfully", domain });
  } catch (err) {
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

export const updateDomain = async (req, res) => {
  try {
    const { error } = domainSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ message: "Validation error", errors: error.details.map(e => e.message) });
    }
    const domain = await Domain.findByPk(req.params.id);
    if (!domain) return res.status(404).json({ message: "Domain not found" });
    await domain.update(req.body);
    res.status(200).json({ message: "Domain updated successfully", domain });
  } catch (err) {
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

export const deleteDomain = async (req, res) => {
  try {
    const domain = await Domain.findByPk(req.params.id);
    if (!domain) return res.status(404).json({ message: "Domain not found" });
    await domain.destroy();
    res.status(200).json({ message: "Domain deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};