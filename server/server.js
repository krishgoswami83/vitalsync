require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

const healthRoutes = require("./routes/healthRoutes");
const aiRoutes = require("./routes/aiRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/api/health", healthRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/wearable-dashboard")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Wearable Dashboard API Running");
});

io.on("connection", (socket) => {
  console.log("User connected");
  socket.on("disconnect", () => console.log("User disconnected"));
});

// ── Realistic Mock Data Generator ────────────────────────────────────────────
let state = {
  steps: 0,
  heartRate: 62,
  sleepHours: 7.2,
  waterIntake: 0.3,
  lastActivitySpike: 0,
  tickCount: 0,
};

function noise(scale = 1) {
  return (Math.random() + Math.random() + Math.random() - 1.5) * scale;
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function generateHealthData() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const dayOfWeek = now.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const timeOfDay = hour + minute / 60;

  state.tickCount++;

  let stepRate = 0;
  if (timeOfDay >= 6 && timeOfDay < 9)   stepRate = 18;
  if (timeOfDay >= 9 && timeOfDay < 12)  stepRate = 10;
  if (timeOfDay >= 12 && timeOfDay < 13) stepRate = 20;
  if (timeOfDay >= 13 && timeOfDay < 17) stepRate = 8;
  if (timeOfDay >= 17 && timeOfDay < 19) stepRate = 22;
  if (timeOfDay >= 19 && timeOfDay < 22) stepRate = 5;
  if (timeOfDay >= 22 || timeOfDay < 6)  stepRate = 0.5;

  if (isWeekend) stepRate *= 0.65;

  const stepIncrement = Math.max(0, Math.floor(stepRate + noise(4)));
  state.steps = clamp(state.steps + stepIncrement, 0, 18000);

  if (hour === 0 && minute < 1) state.steps = 0;

  let baseHR = 62;
  if (timeOfDay >= 6 && timeOfDay < 9)   baseHR = 72;
  if (timeOfDay >= 9 && timeOfDay < 17)  baseHR = 68;
  if (timeOfDay >= 17 && timeOfDay < 19) baseHR = 78;
  if (timeOfDay >= 22 || timeOfDay < 6)  baseHR = 58;

  const timeSinceSpike = state.tickCount - state.lastActivitySpike;
  if (timeSinceSpike > 8 && Math.random() < 0.15) {
    baseHR += 18 + Math.floor(Math.random() * 20);
    state.lastActivitySpike = state.tickCount;
  }

  const hrDiff = baseHR - state.heartRate;
  state.heartRate = clamp(state.heartRate + hrDiff * 0.3 + noise(2), 45, 165);

  let targetSleep = 7.0;
  if (timeOfDay >= 5 && timeOfDay < 8) {
    targetSleep = clamp(6.5 + noise(1.2), 4.5, 9.5);
  }
  if (timeOfDay >= 5 && timeOfDay < 10) {
    state.sleepHours = clamp(state.sleepHours + (targetSleep - state.sleepHours) * 0.05 + noise(0.05), 4.0, 9.5);
  } else {
    state.sleepHours = clamp(state.sleepHours + noise(0.02), 4.0, 9.5);
  }

  if (hour === 0 && minute < 1) state.waterIntake = 0.1;

  let drinkChance = 0.08;
  if (timeOfDay >= 7 && timeOfDay < 9)   drinkChance = 0.25;
  if (timeOfDay >= 12 && timeOfDay < 14) drinkChance = 0.30;
  if (timeOfDay >= 17 && timeOfDay < 19) drinkChance = 0.20;
  if (timeOfDay >= 22 || timeOfDay < 6)  drinkChance = 0.01;

  if (Math.random() < drinkChance) {
    state.waterIntake = clamp(state.waterIntake + 0.15 + Math.random() * 0.2, 0, 4.0);
  }

  return {
    steps:       Math.round(state.steps),
    heartRate:   Math.round(state.heartRate),
    sleepHours:  Math.round(state.sleepHours * 10) / 10,
    waterIntake: Math.round(state.waterIntake * 10) / 10,
    timestamp:   now.toISOString(),
  };
}

setInterval(() => {
  const data = generateHealthData();
  console.log(`[${new Date().toLocaleTimeString()}] Steps: ${data.steps} | HR: ${data.heartRate} bpm | Sleep: ${data.sleepHours}h | Water: ${data.waterIntake}L`);
  io.emit("healthUpdate", data);
}, 5000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Server running on port " + PORT));