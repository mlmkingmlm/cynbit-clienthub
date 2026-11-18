
import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending"
    },

    dueDate: {
      type: Date
    }
  },
  { timestamps: true }
);

const deliverableSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    url: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["planning", "in-progress", "completed", "on-hold"],
      default: "planning"
    },

    startDate: {
      type: Date
    },

    deadline: {
      type: Date
    },

    milestones: [milestoneSchema],

    deliverables: [deliverableSchema]

  },
  {
    timestamps: true
  }
);

projectSchema.index({ client: 1, createdAt: -1 });

const Project = mongoose.model("Project", projectSchema);

export default Project;
