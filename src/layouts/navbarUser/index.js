import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaUserCircle } from "react-icons/fa";

const NavbarUser = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".profile-dropdown")) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50 py-3">
      <div className="container mx-auto flex justify-between items-center px-6">
        <a
          className="text-xl font-semibold text-gray-800 no-underline"
          href="#page-top"
        >
          Hikari Restaurant
        </a>
        <div className="hidden md:flex space-x-6">
          <a
            className="text-gray-600 hover:text-gray-800 no-underline"
            href="#about"
          >
            About
          </a>
          <a
            className="text-gray-600 hover:text-gray-800 no-underline"
            href="#menu"
          >
            Menu
          </a>
          <a
            className="text-gray-600 hover:text-gray-800 no-underline"
            href="#contact"
          >
            Contact
          </a>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="relative profile-dropdown">
              <button
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <FaUserCircle size={28} />
                <span className="hidden sm:inline font-medium">
                  {user.FullName}
                </span>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg">
                  <button
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => navigate("/profile")}
                  >
                    Hồ sơ cá nhân
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    onClick={logout}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                onClick={() => navigate("/login")}
              >
                Đăng Nhập
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                onClick={() => navigate("/register")}
              >
                Đăng Kí
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavbarUser;
