import { useRoutes } from "react-router-dom";
import HomePage from "../pages/homePage";
import LayoutUser from "../layouts/layoutUser";
import LoginPage from "../pages/loginPage";
import RegisterPage from "../pages/registerPage";
import ForgotPasswordPage from "../pages/forgotPasswordPage";

import ResetPasswordPage from "../pages/resetPasswordPage";
import Manager from "../pages/manager/managerDashboard";
//import LayoutAdmin from "../layouts/layoutAdmin";
import StaffManagement from "../pages/Staffmanager/StaffManagement";
import "bootstrap/dist/css/bootstrap.min.css";
import AdminDashboard from "../pages/admin/adminDashboard";
const Routes = () => {
  const elements = useRoutes([
    {
      path: "/",
      element: <LayoutUser Page={HomePage} />,
    },
    {
      path: "/admin-dashboard",
      element: <AdminDashboard />,
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/resigter",
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
      path: "manager-dashboard",
      element: <Manager />,
    },
    {
      path: "/staff-management",
      element: <StaffManagement />,
    }
  ]);
  return <div>{elements}</div>;
};
export default Routes;
