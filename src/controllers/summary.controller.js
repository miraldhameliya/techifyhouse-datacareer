import { Submission } from '../models/Submission.js';
import { Company } from '../models/Company.js';
import { Question } from '../models/Question.js';
import { User } from '../models/User.js';
// import { Submission } from '../models/Submission.js';



export const getSummaryCounts = async (req, res) => {
  try {
    const totalQuestions = await Question.count();
    const totalCompanies = await Company.count();
    const totalUsers = await User.count();
    const totalSubmissions = await Submission.count();
 


    res.json({
      totalQuestions,
      totalCompanies,
      totalUsers,
      totalSubmissions
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};
