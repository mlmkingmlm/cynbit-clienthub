
import mongoose from "mongoose";
import Project from "../models/Project.js";
import User from "../models/user.js";

// Calculate project progress from completed milestones
const calculateProgress = (milestones) => {
  if (!milestones || milestones.length === 0) {
    return 0;
  }

  const completed = milestones.filter(
    (item) => item.status === "completed"
  ).length;

  return Math.round((completed / milestones.length) * 100);
};

// Create project (Admin)
export const createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      clientId,
      startDate,
      deadline,
      milestones
    } = req.body;

    if (!name || !description || !clientId) {
      return res.status(400).json({
        success: false,
        message: "Name, description and client are required"
      });
    }

    if (!mongoose.isValidObjectId(clientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid client ID"
      });
    }

    const client = await User.findOne({
      _id: clientId,
      role: "client"
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found"
      });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description.trim(),
      client: clientId,
      startDate,
      deadline,
      milestones: milestones || []
    });

    const populatedProject = await Project.findById(
      project._id
    ).populate("client", "name email");

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: {
        ...populatedProject.toObject(),
        progress: calculateProgress(project.milestones)
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create project",
      error: error.message
    });
  }
};

// Get all projects
export const getProjects = async (req, res) => {
  try {
    const filter = req.user.role === "admin"
      ? {}
      : { client: req.user._id };

    const projects = await Project.find(filter)
      .populate("client", "name email")
      .sort({ createdAt: -1 });

    const result = projects.map((project) => ({
      ...project.toObject(),
      progress: calculateProgress(project.milestones)
    }));

    return res.status(200).json({
      success: true,
      count: result.length,
      projects: result
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
      error: error.message
    });
  }
};

// Get single project
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID"
      });
    }

    const project = await Project.findById(id)
      .populate("client", "name email");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    if (
      req.user.role !== "admin" &&
      project.client._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this project"
      });
    }

    return res.status(200).json({
      success: true,
      project: {
        ...project.toObject(),
        progress: calculateProgress(project.milestones)
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch project",
      error: error.message
    });
  }
};

// Update project (Admin)
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, startDate, deadline } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID"
      });
    }

    const allowedStatuses = [
      "planning",
      "in-progress",
      "completed",
      "on-hold"
    ];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project status"
      });
    }

    const updates = {};

    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim();
    if (status !== undefined) updates.status = status;
    if (startDate !== undefined) updates.startDate = startDate;
    if (deadline !== undefined) updates.deadline = deadline;

    const project = await Project.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("client", "name email");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: {
        ...project.toObject(),
        progress: calculateProgress(project.milestones)
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update project",
      error: error.message
    });
  }
};


export const updateMilestone = async (req, res) => {
  try {
    const { id, milestoneId } = req.params;
    const { status } = req.body;

    if (
      !mongoose.isValidObjectId(id) ||
      !mongoose.isValidObjectId(milestoneId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid project or milestone ID"
      });
    }

    const allowedStatuses = [
      "pending",
      "in-progress",
      "completed"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid milestone status"
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    const milestone = project.milestones.id(milestoneId);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found"
      });
    }

    milestone.status = status;

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Milestone updated successfully",
      progress: calculateProgress(project.milestones),
      milestones: project.milestones
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update milestone",
      error: error.message
    });
  }
};


export const addMilestone = async (req, res) => {
    try {
        const { title, description, dueDate } = req.body;
        const { id } = req.params;

        if (!title?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Milestone title is required"
            });
        }

        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        project.milestones.push({
            title: title.trim(),
            description: description || "",
            dueDate: dueDate || null,
            status: "pending"
        });

        await project.save();

        res.status(201).json({
            success: true,
            message: "Milestone added successfully",
            project,
            progress: calculateProgress(project.milestones)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const addDeliverable = async (req, res) => {
    try {
        const { title, url } = req.body;
        const { id } = req.params;

        if (!title?.trim() || !url?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title and URL are required"
            });
        }

        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        project.deliverables.push({
            title: title.trim(),
            url: url.trim()
        });

        await project.save();

        res.status(201).json({
            success: true,
            message: "Deliverable added successfully",
            project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

