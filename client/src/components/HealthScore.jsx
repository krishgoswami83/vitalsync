function HealthScore({ data }) {

  if (!data) return null

  let score = 0

  if (data.steps > 8000) score += 25
  else if (data.steps > 5000) score += 15

  if (data.heartRate >= 60 && data.heartRate <= 100) score += 25
  else score += 10

  if (data.sleepHours >= 7) score += 25
  else if (data.sleepHours >= 5) score += 15

  if (data.waterIntake >= 2) score += 25
  else if (data.waterIntake >= 1) score += 15

  const style = {
    padding: "20px",
    background: "#0f172a",
    color: "white",
    borderRadius: "10px",
    width: "250px",
    textAlign: "center",
    marginBottom: "20px"
  }

  return (
    <div style={style}>
      <h2>Health Score</h2>
      <h1>{score}/100</h1>
    </div>
  )
}

export default HealthScore