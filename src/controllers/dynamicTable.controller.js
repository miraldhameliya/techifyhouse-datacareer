import { sequelize } from "../config/db/mysql.js";
import { DynamicTable } from "../models/DynamicTable.js";
import { DynamicTableInfo } from "../models/DynamicTableInfo.js";
import { saveToCloud } from "../utils/cloudinary.js";

export const createDynamicTable = async (req, res) => {
  try {
    const { tableName, createTableQuery, insertDataQuery } = req.body;

    // Validate required fields
    if (!tableName || !createTableQuery || !insertDataQuery) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        error: "tableName, createTableQuery, and insertDataQuery are required"
      });
    }

    // Extract table name from createTableQuery
    const createTableMatch = createTableQuery.match(/CREATE TABLE (\w+)/i);
    const queryTableName = createTableMatch ? createTableMatch[1] : null;

    // Validate if table names match
    if (queryTableName !== tableName) {
      return res.status(400).json({
        success: false,
        message: "Table name mismatch",
        error: `Table name in createTableQuery (${queryTableName}) must match the tableName field (${tableName})`
      });
    }

    // Validate if table name in insert query matches
    const insertTableMatch = insertDataQuery.match(/INSERT INTO (\w+)/i);
    const insertTableName = insertTableMatch ? insertTableMatch[1] : null;

    if (insertTableName !== tableName) {
      return res.status(400).json({
        success: false,
        message: "Table name mismatch",
        error: `Table name in insertDataQuery (${insertTableName}) must match the tableName field (${tableName})`
      });
    }

    // Check if table already exists in DynamicTable
    const existingTable = await DynamicTable.findOne({
      where: { tableName }
    });

    if (existingTable) {
      return res.status(400).json({
        success: false,
        message: "Table already exists",
        error: `A table with name '${tableName}' already exists`
      });
    }

    // Create record in DynamicTable model
    let dynamicTable;
    try {
      dynamicTable = await DynamicTable.create({
        tableName,
        createTableQuery,
        insertDataQuery,
        status: 'pending'
      });
    } catch (modelError) {
      return res.status(400).json({
        success: false,
        message: "Error creating table record",
        error: modelError.message
      });
    }

    try {
      // Execute the create table query
      await sequelize.query(createTableQuery);
      
      // Execute the insert data query
      await sequelize.query(insertDataQuery);

      // Update status to completed
      await dynamicTable.update({ status: 'completed' });

      res.status(201).json({
        success: true,
        message: "Table created and data inserted successfully",
        data: dynamicTable
      });
    } catch (queryError) {
      // If query execution fails, drop the table if it was created
      try {
        await sequelize.query(`DROP TABLE IF EXISTS ${tableName}`);
      } catch (dropError) {
        console.error("Error dropping table after failed creation:", dropError);
      }

      // Update status to failed
      if (dynamicTable) {
        await dynamicTable.update({ status: 'failed' });
      }

      return res.status(500).json({
        success: false,
        message: "Error executing queries",
        error: queryError.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unexpected error occurred",
      error: error.message
    });
  }
};

export const getAllDynamicTables = async (req, res) => {
  try {
    const tables = await DynamicTable.findAll();
    res.status(200).json({
      success: true,
      data: tables
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching tables",
      error: error.message
    });
  }
};

export const getDynamicTableById = async (req, res) => {
  try {
    const table = await DynamicTable.findByPk(req.params.id);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found"
      });
    }
    res.status(200).json({
      success: true,
      data: table
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching table",
      error: error.message
    });
  }
};

export const updateDynamicTable = async (req, res) => {
  try {
    const { createTableQuery, insertDataQuery } = req.body;
    const table = await DynamicTable.findByPk(req.params.id);
    
    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found"
      });
    }

    // Extract table name from createTableQuery
    const createTableMatch = createTableQuery.match(/CREATE TABLE (\w+)/i);
    const queryTableName = createTableMatch ? createTableMatch[1] : null;

    // Validate if table names match
    if (queryTableName !== table.tableName) {
      return res.status(400).json({
        success: false,
        message: "Table name mismatch",
        error: `Table name in createTableQuery (${queryTableName}) must match the existing table name (${table.tableName})`
      });
    }

    // Validate if table name in insert query matches
    const insertTableMatch = insertDataQuery.match(/INSERT INTO (\w+)/i);
    const insertTableName = insertTableMatch ? insertTableMatch[1] : null;

    if (insertTableName !== table.tableName) {
      return res.status(400).json({
        success: false,
        message: "Table name mismatch",
        error: `Table name in insertDataQuery (${insertTableName}) must match the existing table name (${table.tableName})`
      });
    }

    // Extract columns from CREATE TABLE query
    const columnsMatch = createTableQuery.match(/\((.*)\)/);
    if (!columnsMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid CREATE TABLE query",
        error: "Could not extract columns from CREATE TABLE query"
      });
    }

    const columns = columnsMatch[1].split(',').map(col => col.trim().split(' ')[0]);

    // Extract columns from INSERT query
    const insertColumnsMatch = insertDataQuery.match(/\((.*?)\)/);
    if (!insertColumnsMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid INSERT query",
        error: "Could not extract columns from INSERT query"
      });
    }

    const insertColumns = insertColumnsMatch[1].split(',').map(col => col.trim());

    // Validate if all INSERT columns exist in CREATE TABLE
    const missingColumns = insertColumns.filter(col => !columns.includes(col));
    if (missingColumns.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Column mismatch",
        error: `Columns in INSERT query (${insertColumns.join(', ')}) do not match columns in CREATE TABLE (${columns.join(', ')})`
      });
    }

    // Update the queries
    await table.update({
      createTableQuery,
      insertDataQuery,
      status: 'pending'
    });

    try {
      // Drop the existing table
      await sequelize.query(`DROP TABLE IF EXISTS ${table.tableName}`);

      // Execute the updated queries
      await sequelize.query(createTableQuery);
      await sequelize.query(insertDataQuery);

      // Update status to completed
      await table.update({ status: 'completed' });

      res.status(200).json({
        success: true,
        message: "Table updated successfully",
        data: table
      });
    } catch (queryError) {
      // Update status to failed
      await table.update({ status: 'failed' });

      return res.status(500).json({
        success: false,
        message: "Error executing queries",
        error: queryError.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating table",
      error: error.message
    });
  }
};

export const deleteDynamicTable = async (req, res) => {
  try {
    const table = await DynamicTable.findByPk(req.params.id);
    
    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found"
      });
    }

    // Drop the table
    await sequelize.query(`DROP TABLE IF EXISTS ${table.tableName}`);

    // Delete the record
    await table.destroy();

    res.status(200).json({
      success: true,
      message: "Table deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting table",
      error: error.message
    });
  }
};

export const saveDynamicTableInfo = async (req, res) => {
  try {
    const { dynamicTableId, schemaContent } = req.body;
    const schemaImage = req.file; // Assuming the image is sent as a single file

    // Validate input
    if (!dynamicTableId || !schemaContent || !schemaImage) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        error: "dynamicTableId, schemaContent, and schemaImage are required"
      });
    }

    // Check if the DynamicTable exists
    const dynamicTable = await DynamicTable.findByPk(dynamicTableId);
    if (!dynamicTable) {
      return res.status(404).json({
        success: false,
        message: "DynamicTable not found",
        error: `DynamicTable with ID ${dynamicTableId} not found`
      });
    }

    // Check if info already exists for this table (based on unique constraint in model)
    const existingInfo = await DynamicTableInfo.findOne({
      where: { dynamicTableId }
    });

    if (existingInfo) {
         // If you want to allow updating the info, you'd add logic here
         // For now, assuming unique: true means only one entry per table
         return res.status(400).json({
             success: false,
             message: "Info already exists for this DynamicTable",
             error: `DynamicTableInfo already exists for ID ${dynamicTableId}`
         });
    }

    // Upload image to Cloudinary
    const parentFolder = "dynamic_table_schemas"; // Define a Cloudinary folder
    const userFolderId = dynamicTableId; // Use table ID as user folder for separation

    let schemaImageUrl;
    try {
        schemaImageUrl = await saveToCloud(schemaImage, parentFolder, userFolderId);
    } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({
            success: false,
            message: "Error uploading schema image",
            error: uploadError.message
        });
    }

    // Create record in DynamicTableInfo model
    const dynamicTableInfo = await DynamicTableInfo.create({
      dynamicTableId,
      schemaImageUrl,
      schemaContent,
    });

    res.status(201).json({
      success: true,
      message: "Dynamic table info saved successfully",
      data: dynamicTableInfo
    });
  } catch (error) {
    console.error("Unexpected error in saveDynamicTableInfo:", error);
    res.status(500).json({
      success: false,
      message: "Unexpected error occurred",
      error: error.message
    });
  }
}; 