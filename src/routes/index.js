import { useRoutes } from "react-router-dom";
import HomePage from "../pages/homePage";
import LayoutUser from "../layouts/layoutUser";
import LoginPage from "../pages/loginPage";
import RegisterPage from "../pages/registerPage";
import Manager from "../pages/manager/managerDashboard";
import LayoutAdmin from "../layouts/layoutAdmin";

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
      element: <LayoutAdmin Page={AdminDashboard} />,
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
      path: "manager-dashboard",
      element: <Manager />,
    },
  ]);
  return <div>{elements}</div>;
};
export default Routes;
