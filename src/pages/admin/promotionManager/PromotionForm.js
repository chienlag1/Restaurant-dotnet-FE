import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Calendar,
  Percent,
  Type,
  FileText,
  Activity,
  Loader2,
} from "lucide-react";

const PromotionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discountPercentage: 0,
    startDate: "",
    endDate: "",
    isActive: true,
  });

  // Fetch promotion details when editing
  const fetchPromotionDetails = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `https://berestaurantmanagementv2-cgggezezbyf2f6gr.japanwest-01.azurewebsites.net/api/promotions/get-detail-promotion/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      const promotion = response.data;

      setFormData({
        name: promotion.name || "",
        description: promotion.description || "",
        discountPercentage: promotion.discountPercentage || 0,
        startDate: promotion.startDate ? promotion.startDate.split("T")[0] : "",
        endDate: promotion.endDate ? promotion.endDate.split("T")[0] : "",
        isActive: promotion.isActive || false,
      });
    } catch (error) {
      console.error("Failed to fetch promotion details:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchPromotionDetails();
    }
  }, [id, fetchPromotionDetails]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (id) {
        await axios.put(
          `https://berestaurantmanagementv2-cgggezezbyf2f6gr.japanwest-01.azurewebsites.net/api/promotions/update-promotion/${id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
      } else {
        await axios.post(
          "https://berestaurantmanagementv2-cgggezezbyf2f6gr.japanwest-01.azurewebsites.net/api/promotions/create-promotion",
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
      }
      navigate("/promotion-management");
    } catch (error) {
      console.error("Failed to save promotion:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading promotion data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/promotion-management")}
            className="mr-4 p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Back to list"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {id ? "Edit Promotion" : "Add New Promotion"}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name Field */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <Type size={16} className="mr-2" />
                Name
              </div>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="Enter promotion name"
            />
          </div>

          {/* Description Field */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <FileText size={16} className="mr-2" />
                Description
              </div>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter promotion description"
            />
          </div>

          {/* Discount Percentage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <Percent size={16} className="mr-2" />
                Discount Percentage
              </div>
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="number"
                name="discountPercentage"
                value={formData.discountPercentage}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500">%</span>
              </div>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <label className="block text-sm font-medium text-gray-700">
              <div className="flex items-center">
                <Activity size={16} className="mr-2" />
                Status
              </div>
            </label>
            <div className="relative inline-block w-12 mr-2 align-middle select-none mt-2">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="sr-only"
              />
              <label
                htmlFor="isActive"
                className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                  formData.isActive ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
                    formData.isActive ? "translate-x-6" : "translate-x-0"
                  }`}
                ></span>
              </label>
            </div>
            <span
              className={`text-sm ${
                formData.isActive ? "text-green-600" : "text-gray-500"
              }`}
            >
              {formData.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <Calendar size={16} className="mr-2" />
                Start Date
              </div>
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                <Calendar size={16} className="mr-2" />
                End Date
              </div>
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={() => navigate("/promotion-management")}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              <>
                <Save className="-ml-1 mr-2 h-4 w-4" />
                Save Promotion
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PromotionForm;
