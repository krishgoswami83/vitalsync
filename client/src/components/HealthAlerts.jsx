function HealthAlerts({ data }) {

  if (!data) return null

  const alerts = []

  if (data.heartRate > 100) {
    alerts.push("⚠ High heart rate detected")
  }

  if (data.sleepHours < 5) {
    alerts.push("⚠ Low sleep duration")
  }

  if (data.waterIntake < 1) {
    alerts.push("⚠ Low hydration level")
  }

  if (data.steps < 2000) {
    alerts.push("⚠ Low activity today")
  }

  if (alerts.length === 0) {
    return <p style={{color:"green"}}>✓ No health risks detected</p>
  }

  return (
    <div>
      {alerts.map((alert, index) => (
        <p key={index} style={{color:"red"}}>{alert}</p>
      ))}
    </div>
  )
}

export default HealthAlerts