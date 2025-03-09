import { useRoutes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import HomePage from "../pages/homePage";
import LayoutUser from "../layouts/layoutUser";
import LoginPage from "../pages/loginPage";
import RegisterPage from "../pages/registerPage";
import ForgotPasswordPage from "../pages/forgotPasswordPage";
import ResetPasswordPage from "../pages/resetPasswordPage";

import LayoutAdmin from "../layouts/layoutAdmin";
import StaffManagement from "../pages/Staffmanager/StaffManagement";
import AdminDashboard from "../pages/admin/adminDashboard";
import UserManager from "../pages/userManager/userManagement";
import MenuManager from "../pages/menuManager/MenuManagement";
import MenuListPage from "../pages/menuManager/MenuListPage";
import TableManagement from "../pages/tableManager/TableManagement";
import Staff from "../pages/staff/staffDashboard";
import StaffDashboard from "../pages/staff/staffDashboard";

import LayoutStaff from "../layouts/layoutStaff";
const Routes = () => {
  const elements = useRoutes([
    {
      path: "/",
      element: <LayoutUser Page={HomePage} />,
    },

    {
      path: "/user-management",
      element: <LayoutAdmin Page={UserManager} />,
    },
    {
      path: "/admin-dashboard",
      element: <LayoutAdmin Page={AdminDashboard} />,
    },
    {
      path: "/dish-management",
      element: <LayoutAdmin Page={MenuManager} />,
    },
    {
      path: "/table-management",
      element: <LayoutAdmin Page={TableManagement} />,
    },
    {
      path: "/staff-dashboard",
      element: <LayoutStaff Page={Staff} />,
    },

    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/register",
      element: <RegisterPage />,
    },
    {
      path: "/forgot-password",
      element: <ForgotPasswordPage />,
    },

    {
      path: "/reset-password/",
      element: <ResetPasswordPage />,
    },

    {
      path: "/staff-management",
      element: <LayoutAdmin Page={StaffManagement} />,
    },
    {
      path: "/menu",
      element: <LayoutUser Page={MenuListPage} />,
    },
    {
      path: "/staff-dashboard",
      element: <LayoutStaff Page={StaffDashboard} />,
    }
  ]);
  return <div>{elements}</div>;
};
export default Routes;
