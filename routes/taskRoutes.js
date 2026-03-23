import express from "express";
const router = express.Router();
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

// All task routes are protected (logged in)
router.use(protect);

// Users can only view tasks
router.route("/").get(getTasks);

// Only admin can create, update, delete tasks
router.route("/").post(authorize("admin"), createTask);
router.route("/:id").put(authorize("admin"), updateTask).delete(authorize("admin"), deleteTask);

export default router;
