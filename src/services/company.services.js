import { Company } from "../models/Company.js";
import { Op } from "sequelize";


export const createCompanyService = async (data) => {
  const { name, domain, category, status, logoUrl } = data;
  return await Company.create({ name, domain, category, status, logoUrl });
};

export const updateCompanyService = async (id, data) => {
  const company = await Company.findByPk(id);
  if (!company) {
    throw new Error('Company not found');
  }

  await company.update(data);
  return company;
};

export const deleteCompanyService = async (id) => {
  const company = await Company.findByPk(id);
  if (!company) {
    throw new Error('Company not found');
  }

  await company.destroy();
  return company;
};

export const getAllCompaniesService = async (query) => {
  const { search, category, status, page = 1, limit = 10 } = query;

  // Build where clause
  let where = {};

  // Search by name or domain (case-insensitive)
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { domain: { [Op.like]: `%${search}%` } }
    ];
  }

  // Filter by category
  if (category && category !== 'null') {
    where.category = category;
  }

  // Filter by status
  if (status && status !== 'null') {
    where.status = status;
  }

  const offset = (page - 1) * limit;
  const companies = await Company.findAll({ where, offset: Number(offset), limit: Number(limit) });
  const total = await Company.count({ where });
  return { companies, total, page: Number(page), limit: Number(limit) };
};


