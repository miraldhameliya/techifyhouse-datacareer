import { DynamicTable } from "../models/DynamicTable.js";
import { DynamicTableInfo } from "../models/DynamicTableInfo.js";
import { DynamicTableInfoLinks } from "../models/DynamicTableInfoLinks.js";
import { saveToCloud } from "../utils/cloudinary.js";

export const saveDynamicTableInfo = async (req, res) => {
  try {
    const { dynamicTableIds, schemaContent } = req.body;
    const file = req.file;

    // Parse table IDs
    let tableIds = [];
    try {
      tableIds = JSON.parse(dynamicTableIds);
      if (!Array.isArray(tableIds)) {
        throw new Error("dynamicTableIds must be an array");
      }
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON in dynamicTableIds",
        error: parseError.message
      });
    }

    // Upload schema image if provided
    let schemaImageUrl = null;
    if (file) {
      schemaImageUrl = await saveToCloud(file, 'schemaImage', req.user?.id || 'general');
    }

    // Create DynamicTableInfo record
    let dynamicTableInfo;
    try {
      dynamicTableInfo = await DynamicTableInfo.create({
        schemaImageUrl,
        schemaContent
      });
      console.log("dynamicTableInfo =",dynamicTableInfo)
    } catch (modelError) {
      console.error("DynamicTableInfo creation error:", modelError);
      return res.status(500).json({
        success: false,
        message: "Error saving dynamic table info",
        error: modelError.message
      });
    }
    if (tableIds && tableIds.length > 0) {
      await Promise.all(
        tableIds.map(async (id) => {
          await DynamicTableInfoLinks.create({
            dynamicTableInfoId: dynamicTableInfo.id,
            dynamicTableId: id
          });
        })
      );
    }

    const tableInfoWithLinks = await DynamicTableInfo.findOne({
      where: { id: dynamicTableInfo.id },
      include: [{
        model: DynamicTable,
        as: 'tables',
        through: { attributes: [] }
      }]
    });

    return res.status(201).json({
      success: true,
      message: "Dynamic table info saved and linked successfully",
      data: tableInfoWithLinks
    });

  } catch (error) {
    console.error("Unexpected error in saveDynamicTableInfo:", error);
    return res.status(500).json({
      success: false,
      message: "Unexpected error occurred",
      error: error.message
    });
  }
};

// Get all dynamic table info
export const getAllDynamicTableInfo = async (req, res) => {
  try {
    const tableInfos = await DynamicTableInfo.findAll({
      include: [{
        model: DynamicTable,
        through: { attributes: [] }
      }]
    });

    return res.status(200).json({
      success: true,
      data: tableInfos
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching dynamic table info",
      error: error.message
    });
  }
};

// Get dynamic table info by ID
export const getDynamicTableInfoById = async (req, res) => {
  try {
    const { id } = req.params;
    const tableInfo = await DynamicTableInfo.findOne({
      where: { id },
      include: [{
        model: DynamicTable,
        as: 'tables',
        through: { attributes: [] }
      }]
    });

    if (!tableInfo) {
      return res.status(404).json({
        success: false,
        message: "Dynamic table info not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: tableInfo
    });
  } catch (error) {
    console.error("Error in getDynamicTableInfoById:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching dynamic table info",
      error: error.message
    });
  }
};

// Update dynamic table info
export const updateDynamicTableInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { schemaContent, dynamicTableIds } = req.body;
    const file = req.file;

    // Find the existing record
    const existingInfo = await DynamicTableInfo.findOne({
      where: { id },
      include: [{
        model: DynamicTable,
        as: 'tables',
        through: { attributes: [] }
      }]
    });

    if (!existingInfo) {
      return res.status(404).json({
        success: false,
        message: "Dynamic table info not found"
      });
    }

    // Update schema image if provided
    let schemaImageUrl = existingInfo.schemaImageUrl;
    if (file) {
      schemaImageUrl = await saveToCloud(file, 'schemaImage', req.user?.id || 'general');
    }

    // Update the record
    await existingInfo.update({
      schemaContent: schemaContent || existingInfo.schemaContent,
      schemaImageUrl
    });

    // Update table links if provided
    if (dynamicTableIds) {
      let tableIds = [];
      try {
        tableIds = JSON.parse(dynamicTableIds);
        if (!Array.isArray(tableIds)) {
          throw new Error("dynamicTableIds must be an array");
        }
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON in dynamicTableIds",
          error: parseError.message
        });
      }

      // Remove existing links
      await DynamicTableInfoLinks.destroy({
        where: { dynamicTableInfoId: id }
      });

      // Create new links
      if (tableIds.length > 0) {
        await Promise.all(
          tableIds.map(async (tableId) => {
            await DynamicTableInfoLinks.create({
              dynamicTableInfoId: id,
              dynamicTableId: tableId
            });
          })
        );
      }
    }

    // Get updated record with associations
    const updatedInfo = await DynamicTableInfo.findOne({
      where: { id },
      include: [{
        model: DynamicTable,
        as: 'tables',
        through: { attributes: [] }
      }]
    });

    return res.status(200).json({
      success: true,
      message: "Dynamic table info updated successfully",
      data: updatedInfo
    });
  } catch (error) {
    console.error("Error in updateDynamicTableInfo:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating dynamic table info",
      error: error.message
    });
  }
};

// Delete dynamic table info
export const deleteDynamicTableInfo = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the record
    const existingInfo = await DynamicTableInfo.findOne({
      where: { id }
    });

    if (!existingInfo) {
      return res.status(404).json({
        success: false,
        message: "Dynamic table info not found"
      });
    }

    // Delete associated links first
    await DynamicTableInfoLinks.destroy({
      where: { dynamicTableInfoId: id }
    });

    // Delete the record
    await existingInfo.destroy();

    return res.status(200).json({
      success: true,
      message: "Dynamic table info deleted successfully"
    });
  } catch (error) {
    console.error("Error in deleteDynamicTableInfo:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting dynamic table info",
      error: error.message
    });
  }
};
