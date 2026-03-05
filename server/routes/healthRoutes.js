const express = require("express")
const router = express.Router()

const { addHealthData, getHealthData } = require("../controllers/healthController")

router.post("/", addHealthData)

router.get("/", getHealthData)

module.exports = router