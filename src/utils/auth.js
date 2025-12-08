/**
 * Authentication Utility Functions
 * Helper functions for checking permissions, roles, and user info
 */

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

/**
 * Get user type (admin or student)
 */
export const getUserType = () => {
  return localStorage.getItem("userType") || null;
};

/**
 * Get user roles
 */
export const getUserRoles = () => {
  try {
    const rolesStr = localStorage.getItem("userRoles");
    return rolesStr ? JSON.parse(rolesStr) : [];
  } catch (error) {
    return [];
  }
};

/**
 * Check if user has a specific role
 * @param {string} roleSlug - Role slug to check (e.g., 'super_admin', 'admin')
 * @returns {boolean}
 */
export const hasRole = (roleSlug) => {
  const roles = getUserRoles();
  return roles.some((role) => role.slug === roleSlug);
};

/**
 * Check if user has any of the specified roles
 * @param {string[]} roleSlugs - Array of role slugs
 * @returns {boolean}
 */
export const hasAnyRole = (roleSlugs) => {
  const roles = getUserRoles();
  return roleSlugs.some((slug) => roles.some((role) => role.slug === slug));
};

/**
 * Check if user has a specific permission
 * @param {string} permission - Permission to check (e.g., 'manage_exams')
 * @returns {boolean}
 */
export const hasPermission = (permission) => {
  const roles = getUserRoles();
  return roles.some((role) => {
    const permissions = role.permissions || [];
    return permissions.includes(permission);
  });
};

/**
 * Check if user has any of the specified permissions
 * @param {string[]} permissions - Array of permissions
 * @returns {boolean}
 */
export const hasAnyPermission = (permissions) => {
  const roles = getUserRoles();
  return permissions.some((permission) => {
    return roles.some((role) => {
      const rolePermissions = role.permissions || [];
      return rolePermissions.includes(permission);
    });
  });
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const user = getCurrentUser();
  return user !== null;
};

/**
 * Check if user is admin
 * @returns {boolean}
 */
export const isAdmin = () => {
  return getUserType() === "admin";
};

/**
 * Check if user is student
 * @returns {boolean}
 */
export const isStudent = () => {
  return getUserType() === "student";
};

/**
 * Logout user (clear all auth data)
 */
export const logout = async () => {
  try {
    // Call logout API
    const API = (await import("../config/API")).default;
    await fetch(`${API.defaults.baseURL}api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Logout API error:", error);
  } finally {
    // Clear localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("userType");
    localStorage.removeItem("userRoles");
  }
};

/**
 * Verify token and refresh user data
 */
export const verifyAuth = async () => {
  try {
    const API = (await import("../config/API")).default;
    const response = await fetch(`${API.defaults.baseURL}api/auth/verify`, {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userType", data.user.userType);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Auth verification error:", error);
    return false;
  }
};

/**
 * Get current user info from API
 */
export const getCurrentUserInfo = async () => {
  try {
    const API = (await import("../config/API")).default;
    const response = await fetch(`${API.defaults.baseURL}api/auth/me`, {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userType", data.user.userType);
        if (data.user.roles) {
          localStorage.setItem("userRoles", JSON.stringify(data.user.roles));
        }
        return data.user;
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching user info:", error);
    return null;
  }
};

