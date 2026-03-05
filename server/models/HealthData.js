const mongoose = require("mongoose")

const healthDataSchema = new mongoose.Schema({

    steps:{
        type:Number,
        required:true
    },

    heartRate:{
        type:Number,
        required:true
    },

    sleepHours:{
        type:Number,
        required:true
    },

    waterIntake:{
        type:Number,
        required:true
    },

    date:{
        type:Date,
        default:Date.now
    }

})

module.exports = mongoose.model("HealthData", healthDataSchema)