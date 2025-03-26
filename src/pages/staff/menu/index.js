import React from "react";
import MenuList from "../../../components/productCard/MenuList";

const Menu = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto py-10">
        <h2 className="text-center fw-bold text-primary">Thực Đơn</h2>
        <MenuList />
      </div>
    </div>
  );
};

export default Menu;
