import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import errorHandler from "./middlewares/errorMiddleware.js";

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

// Initialize express app
const app = express();

// ──── Middleware ────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ──── Routes ────
app.get("/", (req, res) => {
  res.send("Task Management API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// ──── Global Error Handler ────
app.use(errorHandler);


const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
