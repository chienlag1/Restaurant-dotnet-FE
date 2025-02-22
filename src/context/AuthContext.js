// /context/AuthContext.js

import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Tạo context cho xác thực
const AuthContext = createContext();

// Provider cho AuthContext
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Đăng ký người dùng mới
  const signup = async (FullName, Email, Password, roleId) => {
    try {
      const response = await axios.post(
        "http://localhost:5112/api/auth/register",
        {
          FullName,
          Email,
          Password,
          roleId,
        }
      );
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  };

  // Xác minh mã
  const verifyCode = async (email, code) => {
    try {
      const response = await axios.post("http://localhost:5112/users/verify", {
        email,
        code,
      });
      return { success: response.data };
    } catch (error) {
      throw error.response.data;
    }
  };

  // Đặt lại mật khẩu
  const resetPassword = async (email, newPassword) => {
    try {
      const response = await axios.post(
        "http://localhost:5112/users/reset-password",
        { email, newPassword }
      );
      return { success: response.data };
    } catch (error) {
      throw error.response.data;
    }
  };

  // Đăng nhập
  const login = async (Email, Password) => {
    try {
      const response = await axios.post(
        "http://localhost:5112/api/auth/login",
        {
          Email,
          Password,
        }
      );
      // Lưu trữ thông tin người dùng
      setUser({
        FullName: response.data.username,
        id: response.data.userId,
        Email: response.data.email,
        token: response.data.token,
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  };

  const logout = () => {
    const confirmLogout = window.confirm(
      "Bạn có chắc chắn muốn đăng xuất không?"
    );
    if (confirmLogout) {
      setUser(null);
      navigate("/signin");
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

// Hook để sử dụng AuthContext
export const useAuth = () => useContext(AuthContext);
