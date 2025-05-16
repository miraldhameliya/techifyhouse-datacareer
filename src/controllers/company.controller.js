import { Company } from '../models/Company.js';
import { createCompanyService, deleteCompanyService, updateCompanyService } from "../services/company.services.js";
import { saveToCloud } from '../utils/cloudinary.js';
import { companySchema } from "../validations/company.validation.js";

export const createCompany = async (req, res) => {
  try {
    console.log('BODY:', req.body);
    console.log('FILE:', req.file);
    const { error } = companySchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.details.map((err) => err.message),
      });
    }

    // Parse body fields
    const { name, domain, category, status } = req.body;

    // File upload handle
    let logoUrl = null;
    if (req.file) {
      // Save to Cloudinary
      logoUrl = await saveToCloud(req.file, 'companies', name.replace(/\s/g, ''));
    }

    // Call service with logoUrl
    const company = await createCompanyService({
      name,
      domain,
      category,
      status,
      logoUrl,
    });

    res.status(201).json({ message: 'Company created successfully', company });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { error } = companySchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        error: error.details.map(e => e.message)
      });
    }

    const company = await updateCompanyService(req.params.id, req.body);
    
    res.status(200).json({ message: 'Company updated successfully', company });
  } catch (error) {
    if (error.message === 'Company not found') {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    
    const company = await deleteCompanyService(id);

    res.status(200).json({ message: 'Company deleted successfully', company });

  } catch (error) {

    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

export const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({
      where: { status: 'active' },
      attributes: ['id', 'name', 'domain', 'category', 'logoUrl']
    });
    
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};





