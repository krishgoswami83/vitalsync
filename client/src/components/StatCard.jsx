const StatCard = ({ title, value, unit, color }) => {
  const style = {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    width: "180px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    borderLeft: `6px solid ${color}`
  };

  return (
    <div style={style}>
      <h3>{title}</h3>
      <h2>{value} {unit}</h2>
    </div>
  );
};

export default StatCard;