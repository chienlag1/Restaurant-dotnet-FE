import React from "react";
import { Outlet } from "react-router-dom";

const Promotion = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <h1 className="text-2xl font-bold text-gray-800 p-4 border-b text-center">Promotion Management</h1>
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Promotion;