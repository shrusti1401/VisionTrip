import express from "express";
import runAgent from "../controllers/agentController.js";

const router = express.Router();

router.post("/agent-book", runAgent);

export default router;