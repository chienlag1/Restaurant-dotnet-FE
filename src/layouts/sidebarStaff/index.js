import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const SidebarStaff = () => {
  const { logout } = useAuth();

  return (
    <div className="h-screen w-64 bg-gray-900 text-white fixed top-0 left-0 flex flex-col shadow-lg ">
      {/* Header */}
      <div className="py-5 px-6 bg-gray-800 text-xl font-semibold text-center uppercase tracking-wide">
        <a
          href="/"
          className="text-white hover:text-gray-300 transition no-underline"
        >
          Restaurant
        </a>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavLink
          to="/staff-dashboard"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 rounded-lg transition no-underline ${
              isActive
                ? "bg-gray-700 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }`
          }
        >
          <i className="fas fa-columns text-lg mr-3"></i>
          <span className="text-base font-medium">Dashboard</span>
        </NavLink>
        <NavLink
          to="/menu-customer"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 rounded-lg transition no-underline ${
              isActive
                ? "bg-gray-700 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }`
          }
        >
          <i className="fas fa-columns text-lg mr-3"></i>
          <span className="text-base font-medium">Menu</span>
        </NavLink>
        <NavLink
          to="/order-customer"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 rounded-lg transition no-underline ${
              isActive
                ? "bg-gray-700 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }`
          }
        >
          <i className="fas fa-columns text-lg mr-3"></i>
          <span className="text-base font-medium">Danh Sách Order</span>
        </NavLink>
        <NavLink
          to="/promotion"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 rounded-lg transition no-underline ${
              isActive
                ? "bg-gray-700 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }`
          }
        >
          <i className="fas fa-columns text-lg mr-3"></i>
          <span className="text-base font-medium">Discount</span>
        </NavLink>
      </nav>

      {/* Logout Button */}
      <div className="p-4">
        <button
          onClick={logout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg shadow-md transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default SidebarStaff;
