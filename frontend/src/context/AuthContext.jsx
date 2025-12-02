import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const savedUser = localStorage.getItem("openacademy_user");
    const token = localStorage.getItem("openacademy_token");

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      // TODO: You can add token validation here
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log("AuthContext - Attempting login for:", email);
      // Call the global login endpoint
      const data = await authAPI.login(email, password);
      console.log("AuthContext - Login response:", data);

      if (data.success) {
        const { user: userData, token } = data;
        console.log("AuthContext - User data:", userData);

        setUser(userData);
        localStorage.setItem("openacademy_user", JSON.stringify(userData));
        localStorage.setItem("openacademy_token", token);

        return { success: true, user: userData };
      } else {
        return { success: false, error: data.message || "Invalid credentials" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error:
          error.message ||
          "Login failed. Please check your connection and try again.",
      };
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint based on user role
      if (user && user.role) {
        switch (user.role) {
          case "student":
            await authAPI.student.logout();
            break;
          case "teacher":
            await authAPI.teacher.logout();
            break;
          case "admin":
            await authAPI.admin.logout();
            break;
          default:
            console.warn("Unknown user role, proceeding with local logout");
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with local logout even if backend call fails
    } finally {
      setUser(null);
      localStorage.removeItem("openacademy_user");
      localStorage.removeItem("openacademy_token");
    }
  };

  const register = async (userData) => {
    try {
      let data;

      // Call the appropriate register method based on role
      switch (userData.role) {
        case "student":
          data = await authAPI.student.register(userData);
          break;
        case "teacher":
          data = await authAPI.teacher.register(userData);
          break;
        case "admin":
          data = await authAPI.admin.register(userData);
          break;
        default:
          throw new Error("Invalid role specified");
      }

      if (data.success) {
        return {
          success: true,
          message: data.message || "User registered successfully",
        };
      } else {
        return { success: false, error: data.message || "Registration failed" };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error:
          error.message ||
          "Registration failed. Please check your connection and try again.",
      };
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
