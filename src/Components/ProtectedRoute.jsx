import { Navigate } from "react-router-dom";
import { isAuthenticated, isAdmin, isStudent, hasRole, hasPermission } from "../utils/auth";

/**
 * Protected Route Component
 * Wraps routes that require authentication
 * 
 * Usage:
 * <Route path="/admin" element={<ProtectedRoute userType="admin"><AdminDashboard /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children, userType, requiredRole, requiredPermission }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Check user type
  if (userType === "admin" && !isAdmin()) {
    return <Navigate to="/student" replace />;
  }

  if (userType === "student" && !isStudent()) {
    return <Navigate to="/admin" replace />;
  }

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

