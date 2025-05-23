import { Op } from "sequelize";
import { Company } from '../models/Company.js';
import { CompanyDomains } from '../models/CompanyDomains.js';
import { Domain } from '../models/Domain.js';
import { saveToCloud } from '../utils/cloudinary.js';

export const createCompany = async (req, res) => {
  const { name, category, status, domains } = req.body;
  const domainsArray = JSON.parse(domains);
  const file = req.file;

  
  let logourl = null;
  if (file) {
    logourl = await saveToCloud(file, 'companies', req.body.companyId || 'general');
  }

  try {
  
    const company = await Company.create({
      name,
      category,
      status,
      logo: logourl
    });
  
    if (domainsArray && domainsArray.length > 0) {
  
      await Promise.all(
        domainsArray.map(async (domainId) => {
          await CompanyDomains.create({
            companyId: company.id,
            domainId: domainId
          });
        })
      );
    }
 
    const companyWithDomains = await Company.findOne({
      where: { id: company.id },
      include: [{
        model: Domain,
        through: { attributes: [] } 
      }]
    });
  
    return res.status(201).json({ company: companyWithDomains });
  } catch (error) {
    console.log("error",error);
    
    throw new Error(`Error creating company: ${error.message}`);
  }
};

export const updateCompany = async (req, res) => {
  const { name, category, status, domains } = req.body;
  const file = req.file;

  let logourl = null;
  if (file) {
    logourl = await saveToCloud(file, 'companies', req.body.companyId || 'general');
  }

  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
  
    await company.update({
      name,
      category,
      status,
      logo: logourl
    });

    const domainsArray = JSON.parse(domains);
    if (domainsArray && domainsArray.length > 0) {
      await CompanyDomains.destroy({
        where: { companyId: company.id }
      });

      await Promise.all(
        domainsArray.map(async (domainId) => {
          await CompanyDomains.create({
            companyId: company.id,
            domainId: domainId
          });
        })
      );
    }

    const companyWithDomains = await Company.findOne({
      where: { id: company.id },
      include: [{
        model: Domain,
        through: { attributes: [] } 
      }]
    });
    console.log("------------6------------");
    return res.status(200).json({ company: companyWithDomains });
  } catch (error) {
    console.log("error",error);
    throw new Error(`Error updating company: ${error.message}`);
  }
};

export const deleteCompany = async (req, res) => {
  const { id } = req.params;

  try {
    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    await company.destroy();
    return res.status(200).json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.log("error",error);
    throw new Error(`Error deleting company: ${error.message}`);
  }
};

export const getAllCompanies = async (req, res) => {
  try {
    let { search, status, category } = req.query;

    // Convert "null" or "undefined" string to undefined
    if (category === "null" || category === "undefined") category = undefined;
    if (status === "null" || status === "undefined") status = undefined;

    // Build where clause for Company
    let where = {};
    if (status) where.status = status;
    if (category) where.category = category;

    // If search is provided, search in both company name and domain name
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { '$Domains.name$': { [Op.like]: `%${search}%` } }
      ];
    }

    const companies = await Company.findAll({
      where,
      include: [{
        model: Domain,
        through: { attributes: [] }
      }]
    });

    return res.status(200).json({ companies });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ message: `Error getting all companies: ${error.message}` });
  }
};

export const userGetAllCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({
      attributes: ['id', 'name'], 
      where: {
        status: 'Active' 
      },
      order: [['name', 'ASC']] 
    });

    res.status(200).json({ companies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};