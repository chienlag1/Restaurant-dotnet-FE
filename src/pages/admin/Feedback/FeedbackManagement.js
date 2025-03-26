import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  MessageSquare, 
  User, 
  Package, 
  FileText, 
  Star, 
  Pencil, 
  Trash2, 
  Check, 
  X,
  AlertTriangle, 
  Loader2 
} from "lucide-react";

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [editForm, setEditForm] = useState({ content: "", rating: "" });

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Please log in to view feedback.");
      }

      const response = await axios.get(
        "http://localhost:5112/api/feedback/get-all-feedback",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const feedbackData = response.data.$values || response.data;
      setFeedbacks(Array.isArray(feedbackData) ? feedbackData : []);
    } catch (err) {
      setError(err.message || "An error occurred while loading feedback.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (feedback) => {
    setEditingFeedback(feedback.feedbackId);
    setEditForm({
      content: feedback.content,
      rating: feedback.rating,
    });
  };

  const handleUpdate = async (feedbackId, orderId) => {
    try {
      const token = localStorage.getItem("authToken");
      const updatedFeedback = {
        customerId: feedbacks.find(f => f.feedbackId === feedbackId).customerId,
        orderId: orderId,
        content: editForm.content,
        rating: parseInt(editForm.rating),
      };

      await axios.put(
        `http://localhost:5112/api/feedback/update-feedback-according-to-orderId/${feedbackId}`,
        updatedFeedback,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFeedbacks(
        feedbacks.map((f) =>
          f.feedbackId === feedbackId
            ? { ...f, content: editForm.content, rating: parseInt(editForm.rating) }
            : f
        )
      );
      setEditingFeedback(null);
    } catch (err) {
      setError("Unable to update feedback: " + err.message);
    }
  };

  const handleDelete = async (feedbackId) => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      try {
        const token = localStorage.getItem("authToken");
        await axios.delete(
          `http://localhost:5112/api/feedback/delete-feedback/${feedbackId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setFeedbacks(feedbacks.filter((f) => f.feedbackId !== feedbackId));
      } catch (err) {
        setError("Unable to delete feedback: " + err.message);
      }
    }
  };

  const cancelEdit = () => {
    setEditingFeedback(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center bg-white p-8 rounded-xl shadow-2xl">
          <Loader2 className="mx-auto h-16 w-16 animate-spin text-blue-600" />
          <p className="mt-6 text-xl text-gray-700 font-semibold">Loading Feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-red-50 to-white">
        <div className="flex items-center bg-white p-8 rounded-xl shadow-2xl text-red-600">
          <AlertTriangle className="mr-4 w-12 h-12" />
          <div>
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p className="text-lg">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 flex items-center">
            <MessageSquare className="mr-4 w-12 h-12 text-blue-600" />
            Feedback Management
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <tr>
                  {[
                    { label: "Feedback ID", icon: FileText },
                    { label: "Customer ID", icon: User },
                    { label: "Order ID", icon: Package },
                    { label: "Content", icon: MessageSquare },
                    { label: "Rating", icon: Star },
                    { label: "Actions", icon: Pencil }
                  ].map(({ label, icon: Icon }) => (
                    <th 
                      key={label}
                      className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider"
                    >
                      <div className="flex items-center">
                        <Icon className="mr-2 w-5 h-5 text-white/80" />
                        {label}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {feedbacks.length > 0 ? (
                  feedbacks.map((feedback) => (
                    <tr 
                      key={feedback.feedbackId} 
                      className="border-b hover:bg-blue-50/50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center">
                          <FileText className="mr-2 w-5 h-5 text-gray-500" />
                          {feedback.feedbackId}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center">
                          <User className="mr-2 w-5 h-5 text-gray-500" />
                          {feedback.customer?.fullName || feedback.customerId}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center">
                          <Package className="mr-2 w-5 h-5 text-gray-500" />
                          {feedback.orderId}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {editingFeedback === feedback.feedbackId ? (
                          <input
                            type="text"
                            value={editForm.content}
                            onChange={(e) =>
                              setEditForm({ ...editForm, content: e.target.value })
                            }
                            className="w-full p-2 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                          />
                        ) : (
                          <div className="flex items-center">
                            <MessageSquare className="mr-2 w-5 h-5 text-gray-500" />
                            {feedback.content}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {editingFeedback === feedback.feedbackId ? (
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={editForm.rating}
                            onChange={(e) =>
                              setEditForm({ ...editForm, rating: e.target.value })
                            }
                            className="w-20 p-2 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                          />
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
                            <Star className="mr-1 w-4 h-4 text-yellow-500" />
                            {feedback.rating} / 5
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center space-x-2">
                          {editingFeedback === feedback.feedbackId ? (
                            <>
                              <button
                                onClick={() => handleUpdate(feedback.feedbackId, feedback.orderId)}
                                className="text-green-600 bg-green-100 hover:bg-green-200 p-2 rounded-full transition-colors"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="text-red-600 bg-red-100 hover:bg-red-200 p-2 rounded-full transition-colors"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(feedback)}
                                className="text-blue-600 bg-blue-100 hover:bg-blue-200 p-2 rounded-full transition-colors"
                              >
                                <Pencil className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(feedback.feedbackId)}
                                className="text-red-600 bg-red-100 hover:bg-red-200 p-2 rounded-full transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-lg text-gray-500 bg-gray-50"
                    >
                      No feedback available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackManagement;