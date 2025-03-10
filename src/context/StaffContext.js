import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const StaffContext = createContext();

export const StaffProvider = ({ children }) => {
  const { user } = useAuth();
  const token = user?.token || localStorage.getItem("authToken");
  const [staffList, setStaffList] = useState([]);

  const fetchStaff = async () => {
    if (!token) return;
    try {
      const res = await axios.get(
        "http://localhost:5112/api/staff/get-all-staff",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStaffList(res.data?.$values || []);
    } catch (error) {
      console.error("Không thể tải danh sách nhân viên.");
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [token]);

  return (
    <StaffContext.Provider value={{ staffList, setStaffList, fetchStaff }}>
      {children}
    </StaffContext.Provider>
  );
};

export const useStaff = () => useContext(StaffContext);
