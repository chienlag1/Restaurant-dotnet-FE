import { useRoutes } from "react-router-dom";
import HomePage from "../pages/homePage";
import LayoutUser from "../layouts/layoutUser";
import LoginPage from "../pages/loginPage";
import RegisterPage from "../pages/registerPage";
const Routes = () => {
  const elements = useRoutes([
    {
      path: "/",
      element: <LayoutUser Page={HomePage} />,
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/resigter",
      element: <RegisterPage />,
    },
  ]);
  return <div>{elements}</div>;
};
export default Routes;
