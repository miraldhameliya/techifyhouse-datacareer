import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

dotenv.config();

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("authHeader",authHeader);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication token is missing or malformed.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Authentication failed: User not found.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Access denied: Your account is inactive or blocked.' });
    }

    req.user = user;
    
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid authentication token.' });
    }

    console.error('Authentication middleware error:', err);
    return res.status(500).json({ message: 'An unexpected error occurred during authentication.' });
  }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'You must be logged in to access this resource.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' });
    }
    console.log("req.user.role",req.user.role);

    next();
  };
};
