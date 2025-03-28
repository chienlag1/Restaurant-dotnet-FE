import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import { useEffect } from "react";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // useEffect(() => {
  //   const storedToken = localStorage.getItem("authToken");
  //   if (!storedToken) {
  //     navigate("/login");
  //   }
  // }, [navigate]);

  const signup = async (FullName, Email, Password, roleId) => {
    try {
      const { data } = await axios.post(
        "http://localhost:5112/api/auth/register",
        { FullName, Email, Password, roleId }
      );
      return data;
    } catch (error) {
      throw error.response?.data || "Registration failed";
    }
  };

  const verifyCode = async (email, code) => {
    try {
      const { data } = await axios.post("http://localhost:5112/users/verify", {
        email,
        code,
      });
      return { success: data };
    } catch (error) {
      throw error.response?.data || "Verification failed";
    }
  };

  const resetPassword = async (email, newPassword) => {
    try {
      const { data } = await axios.post(
        "http://localhost:5112/users/reset-password",
        { email, newPassword }
      );
      return { success: data };
    } catch (error) {
      throw error.response?.data || "Password reset failed";
    }
  };

  const login = async (Email, Password) => {
    try {
      const { data } = await axios.post(
        "http://localhost:5112/api/auth/login",
        { Email, Password }
      );

      const loggedInUser = {
        FullName: data.username,
        id: data.userId,
        Email: data.email,
        token: data.token,
        roleId: data.roleId,
      };

      setUser(loggedInUser);
      localStorage.setItem("authToken", data.token);

      // Điều hướng dựa trên roleId
      if (loggedInUser.roleId === 1) {
        navigate("/");
      } else if (loggedInUser.roleId === 2) {
        navigate("/admin-dashboard");
      } else if (loggedInUser.roleId === 4) {
        navigate("/staff-dashboard");
        alert("Admin accept this account to service customers");
      } else {
        navigate("/");
      }
    } catch (error) {
      throw error.response?.data || "Login failed";
    }
  };

  const logout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
      setUser(null);
      localStorage.removeItem("authToken");
      navigate("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, signup, login, logout, verifyCode, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
