
import express from "express";

import {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    updateMilestone,
    addMilestone,
    addDeliverable
} from "../controllers/projectController.js";

import {
  protect,
  adminOnly
} from "../middleware/authMiddleware.js";

const router = express.Router();

// All project routes require login
router.use(protect);

// Admin and client
router.get("/", getProjects);
router.get("/:id", getProjectById);

// Admin only
router.post("/", adminOnly, createProject);
router.patch("/:id", adminOnly, updateProject);

router.patch(
  "/:id/milestones/:milestoneId",
  adminOnly,
  updateMilestone
);


router.post("/:id/milestones", adminOnly, addMilestone);
router.post("/:id/deliverables", adminOnly, addDeliverable);


export default router;
