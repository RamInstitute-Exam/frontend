import { useState, useEffect } from "react";
import {
  getCurrentUser,
  getUserType,
  getUserRoles,
  hasRole,
  hasPermission,
  isAuthenticated,
  isAdmin,
  isStudent,
  getCurrentUserInfo,
} from "../utils/auth";

/**
 * Custom hook for authentication
 * Provides user data and auth helper functions
 */
export const useAuth = () => {
  const [user, setUser] = useState(getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify auth on mount
    const verifyAuth = async () => {
      try {
        const userInfo = await getCurrentUserInfo();
        if (userInfo) {
          setUser(userInfo);
        }
      } catch (error) {
        console.error("Auth verification error:", error);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  return {
    user,
    userType: getUserType(),
    roles: getUserRoles(),
    isAuthenticated: isAuthenticated(),
    isAdmin: isAdmin(),
    isStudent: isStudent(),
    hasRole,
    hasPermission,
    loading,
    refreshUser: async () => {
      const userInfo = await getCurrentUserInfo();
      if (userInfo) {
        setUser(userInfo);
      }
    },
  };
};

