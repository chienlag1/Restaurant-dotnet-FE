import React from "react";
import { BrowserRouter } from "react-router-dom";
import Routes from "./routes";
import { AuthProvider } from "./context/AuthContext";

const App = () => {
  return <Routes></Routes>;
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
