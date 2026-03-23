import Task from "../models/Task.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

// @desc    Get all tasks (user-specific, or all if admin)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    let tasks;

    if (req.user.role === "admin") {
      // Admin can see all tasks
      tasks = await Task.find()
        .populate("user", "name username email")
        .populate("assignedBy", "name username");
    } else {
      // Regular user sees only their own tasks
      tasks = await Task.find({ user: req.user._id })
        .populate("user", "name username email")
        .populate("assignedBy", "name username");
    }

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, assignedTo } = req.body;

    if (!title) {
      throw new ApiError("Task title is required", 400);
    }

    if (!assignedTo) {
      throw new ApiError("Please provide a username to assign the task to", 400);
    }

    // Find user by username
    const targetUser = await User.findOne({ username: assignedTo.toLowerCase() });
    if (!targetUser) {
      throw new ApiError(`User with username '${assignedTo}' not found`, 404);
    }

    const task = await Task.create({
      title,
      description,
      status,
      user: targetUser._id,
      assignedBy: req.user._id,
    });

    // Add task to user's tasks array
    await User.findByIdAndUpdate(targetUser._id, {
      $push: { tasks: task._id },
    });

    // Populate user info before sending response
    await task.populate("user", "name username email");
    await task.populate("assignedBy", "name username");

    res.status(201).json({
      success: true,
      message: "Task created and assigned successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      throw new ApiError("Task not found", 404);
    }

    // Check ownership (admin can update any task)
    if (
      task.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      throw new ApiError("Not authorized to update this task", 403);
    }

    // Update only provided fields
    const { title, description, status, assignedTo } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;

    // Admin can reassign task to another user by username
    if (assignedTo) {
      const targetUser = await User.findOne({ username: assignedTo.toLowerCase() });
      if (!targetUser) {
        throw new ApiError(`User with username '${assignedTo}' not found`, 404);
      }

      // Remove task from old user's tasks array
      await User.findByIdAndUpdate(task.user, {
        $pull: { tasks: task._id },
      });

      // Add task to new user's tasks array
      await User.findByIdAndUpdate(targetUser._id, {
        $push: { tasks: task._id },
      });

      task.user = targetUser._id;
    }

    task = await task.save();
    await task.populate("user", "name username email");
    await task.populate("assignedBy", "name username");

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      throw new ApiError("Task not found", 404);
    }

    // Check ownership (admin can delete any task)
    if (
      task.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      throw new ApiError("Not authorized to delete this task", 403);
    }

    // Remove task from user's tasks array
    await User.findByIdAndUpdate(task.user, {
      $pull: { tasks: task._id },
    });

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export { getTasks, createTask, updateTask, deleteTask };
