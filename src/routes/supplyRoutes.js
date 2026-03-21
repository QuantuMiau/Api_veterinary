// routes/supplyRoutes.js
import express from "express";
import * as Supply from "../controllers/supplyController.js";
import { authEmployee } from "../middleware/authEmployee.js";

const router = express.Router();

/// esto para despues xd
router.post("/", authEmployee, Supply.newSupply);
router.put("/:id", authEmployee, Supply.updateSupply);
router.delete("/:id", authEmployee, Supply.deleteSupply);
router.patch("/:id/activate", authEmployee, Supply.activateSupply);
router.get("/", authEmployee, Supply.getAll);

export default router;
