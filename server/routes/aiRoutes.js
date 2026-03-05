const express = require("express");
const router = express.Router();

const { getHealthInsight } = require("../controllers/aiController");

router.post("/ask", getHealthInsight);

module.exports = router;