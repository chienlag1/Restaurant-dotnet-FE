import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Trash2,
  Edit,
  Plus,
  AlertCircle,
  CheckCircle,
  Search,
  RefreshCw,
  TagIcon,
} from "lucide-react";
import Pagination from "././../../../components/pagination"; // Import component Pagination

const PromotionList = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("promotionId");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2; // Declare as a constant

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5112/api/promotions/get-all-promotions",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      console.log("API Response:", response.data);

      if (response.data && response.data.$values) {
        setPromotions(response.data.$values);
      } else {
        console.error("Invalid data format from API:", response.data);
        setPromotions([]);
      }
    } catch (error) {
      console.error("Failed to fetch promotions:", error);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this promotion?")) {
      try {
        await axios.delete(
          `http://localhost:5112/api/promotions/delete-promotion/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        fetchPromotions();
      } catch (error) {
        console.error("Failed to delete promotion:", error);
      }
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredPromotions = promotions
    .filter(
      (promo) =>
        promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.promotionId.toString().includes(searchTerm)
    )
    .sort((a, b) => {
      if (sortField === "discountPercentage") {
        return sortDirection === "asc"
          ? a.discountPercentage - b.discountPercentage
          : b.discountPercentage - a.discountPercentage;
      } else {
        const aValue = a[sortField]?.toString().toLowerCase() || "";
        const bValue = b[sortField]?.toString().toLowerCase() || "";
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
    });

  // Tính toán các items hiển thị trên trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPromotions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1 text-gray-400">
        {sortDirection === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <TagIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">
            Promotion Management
          </h2>
        </div>
        <Link
          to="/promotion-management/create"
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          <Plus size={18} />
          <span>Add New Promotion</span>
        </Link>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-auto sm:flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="text-gray-400" size={18} />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
            placeholder="Search promotions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={fetchPromotions}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md transition-colors w-full sm:w-auto justify-center"
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : Array.isArray(promotions) && filteredPromotions.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("promotionId")}
                  >
                    ID <SortIcon field="promotionId" />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    Name <SortIcon field="name" />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("discountPercentage")}
                  >
                    Discount (%) <SortIcon field="discountPercentage" />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("isActive")}
                  >
                    Status <SortIcon field="isActive" />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((promotion) => (
                  <tr
                    key={promotion.promotionId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {promotion.promotionId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {promotion.name}
                      </div>
                      {promotion.description && (
                        <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                          {promotion.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {promotion.discountPercentage}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {promotion.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/promotion-management/edit/${promotion.promotionId}`}
                          className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 p-2 rounded-full transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(promotion.promotionId)}
                          className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-full transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Hiển thị Pagination */}
          <Pagination
            totalItems={filteredPromotions.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            No promotions found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {searchTerm
              ? "No promotions match your search criteria."
              : "There are no promotions available."}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Display count of promotions */}
      {!loading && filteredPromotions.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          Showing {currentItems.length} of {filteredPromotions.length}{" "}
          promotions
          {searchTerm && " (filtered)"}
        </div>
      )}
    </div>
  );
};

export default PromotionList;
