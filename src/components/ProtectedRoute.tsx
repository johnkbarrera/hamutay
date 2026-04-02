import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  // Check if token exists in localStorage
  const token = localStorage.getItem("token");

  if (!token) {
    // Redirect to login if unauthenticated
    return <Navigate to="/login" replace />;
  }

  // Render children (the secure page) if authenticated
  return children;
}
