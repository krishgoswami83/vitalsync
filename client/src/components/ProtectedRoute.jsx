import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("vs_token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}