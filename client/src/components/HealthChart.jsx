import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

const METRICS = [
  { key: "steps",       label: "Steps",      color: "#30d158", unit: "steps", yAxis: "y1" },
  { key: "heartRate",   label: "Heart Rate", color: "#ff375f", unit: "bpm",   yAxis: "y"  },
  { key: "sleepHours",  label: "Sleep",      color: "#0a84ff", unit: "hrs",   yAxis: "y"  },
  { key: "waterIntake", label: "Water",      color: "#5ac8fa", unit: "L",     yAxis: "y"  },
];

function LegendPill({ color, label }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 7,
      background: `${color}12`, border: `1px solid ${color}30`,
      borderRadius: 50, padding: "5px 14px",
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: "50%",
        background: color, boxShadow: `0 0 6px ${color}`,
        display: "block", flexShrink: 0,
      }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{label}</span>
    </div>
  );
}

export default function HealthChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "48px 0", gap: 12,
      }}>
        <div style={{ fontSize: 28 }}>📈</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>No trend data yet…</div>
      </div>
    );
  }

  const labels = data.map((_, i) =>
    i === 0 ? "Start" : i === data.length - 1 ? "Now" : `+${i}`
  );

  const makeGradient = (ctx, color) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 320);
    gradient.addColorStop(0, `${color}30`);
    gradient.addColorStop(1, `${color}00`);
    return gradient;
  };

  const chartData = {
    labels,
    datasets: METRICS.map((m) => ({
      label: m.label,
      data: data.map((d) => d[m.key]),
      borderColor: m.color,
      borderWidth: 2.5,
      pointBackgroundColor: m.color,
      pointBorderColor: "#080808",
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 7,
      pointHoverBackgroundColor: m.color,
      pointHoverBorderColor: "#fff",
      pointHoverBorderWidth: 2,
      tension: 0.45,
      fill: true,
      backgroundColor: (ctx) => {
        const chart = ctx.chart;
        const { ctx: canvasCtx } = chart;
        return makeGradient(canvasCtx, m.color);
      },
      yAxisID: m.yAxis,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: { display: false }, // we render our own
      tooltip: {
        backgroundColor: "rgba(15,15,15,0.92)",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        titleColor: "rgba(255,255,255,0.9)",
        bodyColor: "rgba(255,255,255,0.6)",
        padding: 14,
        cornerRadius: 14,
        titleFont: { size: 13, weight: "600" },
        bodyFont: { size: 12 },
        callbacks: {
          title: (items) => `Reading ${items[0].label}`,
          label: (item) => {
            const metric = METRICS.find((m) => m.label === item.dataset.label);
            return `  ${item.dataset.label}: ${
              typeof item.raw === "number" ? item.raw.toFixed(1) : item.raw
            } ${metric?.unit ?? ""}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(255,255,255,0.04)",
          drawBorder: false,
        },
        ticks: {
          color: "rgba(255,255,255,0.3)",
          font: { size: 11, weight: "500" },
          maxRotation: 0,
        },
        border: { display: false },
      },
      y: {
        position: "left",
        grid: {
          color: "rgba(255,255,255,0.05)",
          drawBorder: false,
        },
        ticks: {
          color: "rgba(255,255,255,0.3)",
          font: { size: 11 },
          padding: 8,
          maxTicksLimit: 6,
        },
        border: { display: false },
      },
      y1: {
        position: "right",
        grid: { drawOnChartArea: false },
        ticks: {
          color: "#30d15870",
          font: { size: 11 },
          padding: 8,
          maxTicksLimit: 6,
          callback: (v) => `${(v / 1000).toFixed(1)}k`,
        },
        border: { display: false },
      },
    },
  };

  return (
    <div>
      {/* custom legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        {METRICS.map((m) => <LegendPill key={m.key} color={m.color} label={m.label} />)}
      </div>

      {/* chart */}
      <div style={{ position: "relative", height: 300, width: "100%" }}>
        <Line data={chartData} options={options} />
      </div>

      {/* axis hint */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>← HR · Sleep · Water (left axis)</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2);" }}>Steps (right axis) →</span>
      </div>
    </div>
  );
}