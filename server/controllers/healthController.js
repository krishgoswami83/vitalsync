const HealthData = require("../models/HealthData")

exports.addHealthData = async (req, res) => {

    try {

        const data = new HealthData(req.body)

        const savedData = await data.save()

        res.status(201).json(savedData)

    } catch (error) {

        res.status(500).json({ message: error.message })

    }

}

exports.getHealthData = async (req, res) => {

    try {

        const data = await HealthData.find().sort({ date: -1 })

        res.status(200).json(data)

    } catch (error) {

        res.status(500).json({ message: error.message })

    }

}