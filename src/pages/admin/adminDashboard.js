import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  Calendar, 
  DollarSign, 
  LogOut, 
  RefreshCw, 
  AlertTriangle 
} from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [revenueDay, setRevenueDay] = useState(null);
  const [revenueWeek, setRevenueWeek] = useState(null);
  const [revenueMonth, setRevenueMonth] = useState(null);
  const [revenueRange, setRevenueRange] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = "https://berestaurantmanagementv2-cgggezezbyf2f6gr.japanwest-01.azurewebsites.net/api/order";

  // Axios instance with token
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${user?.token || ""}`,
    },
  });

  const fetchRevenueForDay = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/get-revenue-this-day");
      setRevenueDay(response.data.revenue);
    } catch (err) {
      setError("Failed to fetch daily revenue");
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueForWeek = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/get-revenue-this-week");
      setRevenueWeek(response.data.revenue);
    } catch (err) {
      setError("Failed to fetch weekly revenue");
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueForMonth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/get-revenue-this-month");
      setRevenueMonth(response.data.revenue);
    } catch (err) {
      setError("Failed to fetch monthly revenue");
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueInRange = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/get-revenue-in-range", {
        params: { startDate, endDate },
      });
      setRevenueRange(response.data.revenue);
    } catch (err) {
      setError("Failed to fetch revenue for selected range");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.roleId === 2) {
      fetchRevenueForDay();
      fetchRevenueForWeek();
      fetchRevenueForMonth();
    }
  }, [user]);

  return (
    <div className="w-full bg-gray-100 rounded-lg p-0">
      <div className="w-full bg-white shadow-lg rounded-xl p-6">
        {/* Tiêu đề được thêm vào đây */}
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Admin Revenue Dashboard
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <AlertTriangle className="inline mr-2" size={20} />
            {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center mb-4">
            <RefreshCw className="animate-spin text-blue-500" size={24} />
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Daily Revenue */}
          <div className="bg-blue-50 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center mb-4">
              <Calendar className="mr-2 text-blue-600" size={20} />
              Today's Revenue
            </h2>
            <p className="text-2xl font-bold text-green-600">
              {revenueDay !== null ? `$${revenueDay.toFixed(2)}` : "Not fetched"}
            </p>
            <button 
              onClick={fetchRevenueForDay} 
              disabled={loading || !user}
              className="mt-3 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {/* Weekly Revenue */}
          <div className="bg-green-50 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center mb-4">
              <Calendar className="mr-2 text-green-600" size={20} />
              Weekly Revenue
            </h2>
            <p className="text-2xl font-bold text-green-600">
              {revenueWeek !== null ? `$${revenueWeek.toFixed(2)}` : "Not fetched"}
            </p>
            <button 
              onClick={fetchRevenueForWeek} 
              disabled={loading || !user}
              className="mt-3 w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-purple-50 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center mb-4">
              <Calendar className="mr-2 text-purple-600" size={20} />
              Monthly Revenue
            </h2>
            <p className="text-2xl font-bold text-green-600">
              {revenueMonth !== null ? `$${revenueMonth.toFixed(2)}` : "Not fetched"}
            </p>
            <button 
              onClick={fetchRevenueForMonth} 
              disabled={loading || !user}
              className="mt-3 w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600 transition-colors disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Custom Date Range */}
        <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 flex items-center mb-4">
            <Calendar className="mr-2 text-gray-600" size={20} />
            Custom Revenue Range
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button 
            onClick={fetchRevenueInRange} 
            disabled={loading || !user}
            className="mt-4 w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Get Revenue for Range
          </button>
          <p className="mt-4 text-xl font-bold text-green-600 text-center">
            {revenueRange !== null ? `$${revenueRange.toFixed(2)}` : "Select a date range"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;