// ── VitalSync AI — Home-built rule-based health chatbot ──────────────────────
// No external API needed. Pure logic based on health data.

function analyzeHealth(data) {
  const { steps, heartRate, sleepHours, waterIntake } = data;
  return {
    steps: {
      value: steps,
      pct: Math.round((steps / 10000) * 100),
      status: steps >= 10000 ? "great" : steps >= 7000 ? "good" : steps >= 4000 ? "low" : "very low",
    },
    heartRate: {
      value: heartRate,
      status: heartRate < 60 ? "low" : heartRate <= 100 ? "normal" : heartRate <= 130 ? "elevated" : "high",
    },
    sleep: {
      value: sleepHours,
      status: sleepHours >= 8 ? "great" : sleepHours >= 7 ? "good" : sleepHours >= 6 ? "low" : "poor",
    },
    water: {
      value: waterIntake,
      status: waterIntake >= 2.5 ? "great" : waterIntake >= 2 ? "good" : waterIntake >= 1.5 ? "low" : "poor",
    },
  };
}

function generateResponse(input, data) {
  const q = input.toLowerCase().trim();
  const h = analyzeHealth(data);

  if (q.match(/step|walk|move|active|exercise/)) {
    if (h.steps.status === "great")
      return `🏃 Amazing! You've hit ${data.steps.toLocaleString()} steps today — that's ${h.steps.pct}% of your 10,000 goal. You're crushing it!`;
    if (h.steps.status === "good")
      return `🏃 Good progress! You're at ${data.steps.toLocaleString()} steps (${h.steps.pct}% of goal). You need ${(10000 - data.steps).toLocaleString()} more steps. A short walk would do it!`;
    if (h.steps.status === "low")
      return `🏃 You've done ${data.steps.toLocaleString()} steps so far. You're halfway to your 10,000 goal. Try a 20-minute walk to boost your count!`;
    return `🏃 Only ${data.steps.toLocaleString()} steps today. Try taking a 10-minute walk every hour — it adds up quickly!`;
  }

  if (q.match(/heart|hr|bpm|pulse|cardio/)) {
    if (h.heartRate.status === "low")
      return `❤️ Your heart rate is ${data.heartRate} bpm which is quite low. This can be normal if you're very fit or resting. If you feel dizzy, check with a doctor.`;
    if (h.heartRate.status === "normal")
      return `❤️ Your heart rate is ${data.heartRate} bpm — perfectly normal! Healthy resting HR is 60-100 bpm. Your cardiovascular health looks great!`;
    if (h.heartRate.status === "elevated")
      return `❤️ Your heart rate is ${data.heartRate} bpm — slightly elevated. Normal after exercise or stress. Try some deep breathing to bring it down.`;
    return `❤️ Your heart rate is ${data.heartRate} bpm — quite high! Rest immediately, avoid caffeine, and try deep breathing. If it stays high, consult a doctor.`;
  }

  if (q.match(/sleep|rest|tired|fatigue|wake|night/)) {
    if (h.sleep.status === "great")
      return `🌙 Excellent sleep! You got ${data.sleepHours} hours last night — above the recommended 7-8 hours. You should be feeling refreshed today!`;
    if (h.sleep.status === "good")
      return `🌙 Good sleep! ${data.sleepHours} hours is within the healthy range. Adults need 7-9 hours for optimal health. You're doing well!`;
    if (h.sleep.status === "low")
      return `🌙 You got ${data.sleepHours} hours — slightly below the 7-hour recommendation. Try going to bed 30 minutes earlier and avoid screens before sleep.`;
    return `🌙 Only ${data.sleepHours} hours — that's not enough. Aim for at least 7 hours. Avoid caffeine after 2pm and keep a consistent sleep schedule.`;
  }

  if (q.match(/water|hydrat|drink|thirst/)) {
    if (h.water.status === "great")
      return `💧 Great hydration! You've had ${data.waterIntake}L today — above the recommended 2.5L. Staying hydrated boosts energy and focus!`;
    if (h.water.status === "good")
      return `💧 Good hydration! ${data.waterIntake}L is close to your goal. Try one more glass of water to hit your 2.5L target.`;
    if (h.water.status === "low")
      return `💧 You've had ${data.waterIntake}L — you need ${(2.5 - data.waterIntake).toFixed(1)}L more today. Set a reminder to drink a glass every hour!`;
    return `💧 Only ${data.waterIntake}L — you're dehydrated! Drink a large glass of water right now. You need ${(2.5 - data.waterIntake).toFixed(1)}L more today.`;
  }

  if (q.match(/overall|summary|how am i|health|today|status|report/)) {
    const scores = [h.steps.status, h.heartRate.status, h.sleep.status, h.water.status];
    const great = scores.filter(s => s === "great").length;
    const good = scores.filter(s => s === "good" || s === "normal").length;
    let overall = great >= 3 ? "You're having an excellent health day! 🌟"
      : great + good >= 3 ? "You're doing pretty well today! 💪"
      : great + good >= 2 ? "Mixed results today — room for improvement! 📈"
      : "Today needs some work — let's get you back on track! 💡";
    return `📊 ${overall}\n\n🏃 Steps: ${data.steps.toLocaleString()} (${h.steps.pct}% of goal)\n❤️ Heart Rate: ${data.heartRate} bpm (${h.heartRate.status})\n🌙 Sleep: ${data.sleepHours} hrs (${h.sleep.status})\n💧 Water: ${data.waterIntake}L (${h.water.status})`;
  }

  if (q.match(/hi|hello|hey|sup|what.s up/)) {
    const hour = new Date().getHours();
    const timeGreet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    return `${timeGreet}! 👋 I'm VitalSync AI. Ask me about your steps, heart rate, sleep, or water intake — or say "summary" for a full health report!`;
  }

  if (q.match(/tip|advice|suggest|improve|better|help/)) {
    const tips = [];
    if (h.steps.status === "low" || h.steps.status === "very low") tips.push("🏃 Take a 20-minute walk to boost your step count");
    if (h.heartRate.status === "elevated" || h.heartRate.status === "high") tips.push("❤️ Try 5 minutes of deep breathing to lower your heart rate");
    if (h.sleep.status === "low" || h.sleep.status === "poor") tips.push("🌙 Set a bedtime alarm 30 minutes earlier tonight");
    if (h.water.status === "low" || h.water.status === "poor") tips.push("💧 Drink a large glass of water right now");
    if (tips.length === 0) return "✅ You're doing great across all metrics! Keep up the consistency — it's the key to long-term health!";
    return `Here are my top tips for you right now:\n\n${tips.join("\n\n")}`;
  }

  if (q.match(/calor|burn|weight/)) {
    const cal = Math.round(data.steps * 0.04);
    return `🔥 Based on your ${data.steps.toLocaleString()} steps, you've burned approximately ${cal} calories today. Try adding some brisk walking to increase this!`;
  }

  if (q.match(/stress|anxi|relax|calm|breath/)) {
    if (h.heartRate.status === "elevated" || h.heartRate.status === "high")
      return `😮‍💨 Your heart rate of ${data.heartRate} bpm suggests some stress. Try the 4-7-8 method: inhale 4 sec, hold 7 sec, exhale 8 sec. Repeat 4 times.`;
    return `😌 Your heart rate of ${data.heartRate} bpm looks calm. Regular exercise, good sleep, and hydration all help keep stress low — and you're tracking all of them!`;
  }

  const suggestions = ["steps", "heart rate", "sleep", "water intake", "overall summary", "health tips"];
  const random = suggestions[Math.floor(Math.random() * suggestions.length)];
  return `🤔 I'm not sure about that! Try asking about your ${random}, or say "summary" for a full health report!`;
}

exports.getHealthInsight = (req, res) => {
  try {
    const { question, data } = req.body;
    if (!question || !data) return res.status(400).json({ answer: "Missing question or health data." });
    const answer = generateResponse(question, data);
    res.json({ answer });
  } catch (error) {
    console.error("CHATBOT ERROR:", error);
    res.status(500).json({ answer: "Something went wrong. Please try again!" });
  }
};