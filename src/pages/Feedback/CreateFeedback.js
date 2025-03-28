import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const CreateFeedback = () => {
  const { orderId, customerId } = useParams(); // Lấy orderId và customerId từ URL
  const navigate = useNavigate();

  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const feedbackData = {
        CustomerId: parseInt(customerId), // Sử dụng customerId từ URL
        OrderId: parseInt(orderId), // Sử dụng orderId từ URL
        Content: content, // Khớp với FeedbackPostDTO.Content
        Rating: rating, // Khớp với FeedbackPostDTO.Rating
      };

      const response = await axios.post(
        "http://localhost:5112/api/feedback/create-feedback",
        feedbackData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        alert("Feedback đã được gửi thành công!");
        navigate("/order-customer"); // Chuyển hướng sau khi gửi thành công
      }
    } catch (err) {
      console.error("Feedback Error Details:", {
        error: err.message,
        response: err.response?.data,
      });
      setError(
        err.response?.data?.message || "Đã xảy ra lỗi khi gửi feedback."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Gửi Feedback
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung feedback
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Nhập ý kiến của bạn..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đánh giá (1-5 sao)
            </label>
            <select
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="0">Chọn số sao</option>
              <option value="1">1 sao</option>
              <option value="2">2 sao</option>
              <option value="3">3 sao</option>
              <option value="4">4 sao</option>
              <option value="5">5 sao</option>
            </select>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Đang gửi..." : "Gửi Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateFeedback;
