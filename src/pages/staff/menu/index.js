import React from "react";
import MenuList from "../../../components/productCard/MenuList";

const Menu = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto py-10">
        <h1 className="text-3xl font-bold text-center text-primary ">
          Thực Đơn
        </h1>
        <MenuList />
      </div>
    </div>
  );
};

export default Menu;
