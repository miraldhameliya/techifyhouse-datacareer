import express from "express";
import {
    createDynamicTable,
    deleteDynamicTable,
    getAllDynamicTables,
    getDynamicTableById,
    updateDynamicTable
} from "../controllers/dynamicTable.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

export const dynamicTableRouter = express.Router();

// Create a new dynamic table
dynamicTableRouter.post("/",authenticate,authorize('admin'), createDynamicTable);

// Get all dynamic tables
dynamicTableRouter.get("/",authenticate,authorize('admin'), getAllDynamicTables);

// Get a specific dynamic table by ID
dynamicTableRouter.get("/:id",authenticate,authorize('admin'), getDynamicTableById);

// Update a dynamic table
dynamicTableRouter.put("/:id",authenticate,authorize('admin'), updateDynamicTable);

// Delete a dynamic table
dynamicTableRouter.delete("/:id",authenticate,authorize('admin'), deleteDynamicTable); 