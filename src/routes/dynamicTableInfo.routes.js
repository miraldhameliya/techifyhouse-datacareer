import express from "express";
import multer from 'multer';
import { ADMIN } from "../constants/constans.js";
import {
    deleteDynamicTableInfo,
    getAllDynamicTableInfo,
    getDynamicTableInfoById,
    saveDynamicTableInfo,
    updateDynamicTableInfo
} from "../controllers/dynamicTableInfo.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const upload = multer(); 
export const dynamicTableInfoRouter = express.Router();

// Get all dynamic table info
dynamicTableInfoRouter.get('/', authenticate, getAllDynamicTableInfo);

// Get dynamic table info by ID
dynamicTableInfoRouter.get('/:id', authenticate, getDynamicTableInfoById);

// Save dynamic table info (schema image and content)
dynamicTableInfoRouter.post(`/${ADMIN}/`, authenticate, authorize('admin'), upload.single('schemaImageUrl'), saveDynamicTableInfo);

// Update dynamic table info
dynamicTableInfoRouter.put(`/${ADMIN}/:id`, authenticate, authorize('admin'), upload.single('schemaImageUrl'), updateDynamicTableInfo);

// Delete dynamic table info
dynamicTableInfoRouter.delete(`/${ADMIN}/:id`, authenticate, authorize('admin'), deleteDynamicTableInfo);

