import express from "express";
import * as Dashboard from "../controllers/dashboardController.js";
import { authEmployee } from "../middleware/authEmployee.js";

const router = express.Router();

router.get("/stats", authEmployee, Dashboard.getStats);

export default router;
