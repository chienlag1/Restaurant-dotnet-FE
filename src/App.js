import React from "react";
import { BrowserRouter } from "react-router-dom";
import Routes from "./routes";
import { AuthProvider } from "./context/AuthContext";

const App = () => {
  return (
    <>
      {/* Routes chính của ứng dụng */}
      <Routes />
      {/* Đặt PaymentFormWrapper bên ngoài Routes để test nhanh */}
    </>
  );
};

// Wrap the App component with BrowserRouter
const AppWithRouter = () => (
  <BrowserRouter>
    <AuthProvider>
      <App></App>
    </AuthProvider>
  </BrowserRouter>
);

export default AppWithRouter;
