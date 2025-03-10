import React from "react";
import MenuList from "../../../components/productCard/MenuList";

const MenuListPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-4">
        Thực Đơn Của Chúng Tôi
      </h1>
      <MenuList />
    </div>
  );
};

export default MenuListPage;
