import express from "express";
import { ADMIN } from "../constants/constans.js";
import { adminLogin, getAllUsers, login, logout, signup } from "../controllers/auth.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
export const authRouter = express.Router();


authRouter.post('/signup', signup);

authRouter.post('/login', login);

authRouter.post(`/${ADMIN}/login`, adminLogin);

authRouter.post('/logout', authenticate, authorize('admin','user'), logout);

authRouter.get(`/${ADMIN}/users`, authenticate, authorize('admin'), getAllUsers);
