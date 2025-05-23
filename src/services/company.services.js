import { Company } from "../models/Company.js";
import { CompanyDomains } from "../models/CompanyDomains.js";
import { Domain } from "../models/Domain.js";

export const createCompany = async (companyData) => {
  const { name, category, status, logo, domains } = companyData;

  try {
    // Create company
    const company = await Company.create({
      name,
      category,
      status,
      logo
    });

    // If domains are provided, associate them with the company
    if (domains && domains.length > 0) {
      // Add domains to the company
      await Promise.all(
        domains.map(async (domainId) => {
          await CompanyDomains.create({
            companyId: company.id,
            domainId: domainId
          });
        })
      );
    }

    // Fetch the created company with its domains
    const companyWithDomains = await Company.findOne({
      where: { id: company.id },
      include: [{
        model: Domain,
        through: { attributes: [] } // This will exclude the join table attributes
      }]
    });

    return companyWithDomains;
  } catch (error) {
    throw new Error(`Error creating company: ${error.message}`);
  }
};

export const getCompanyById = async (id) => {
  try {
    const company = await Company.findOne({
      where: { id },
      include: [{
        model: Domain,
        through: { attributes: [] }
      }]
    });
    return company;
  } catch (error) {
    throw new Error(`Error fetching company: ${error.message}`);
  }
};

// Your existing updateCompanyService and deleteCompanyService functions...


