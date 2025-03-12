import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../../../components/productCard/index.js";
import EditDetailManagement from "./EditDetailManagement.js";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";

const MenuManagement = () => {
  const [show, setShow] = useState(false);
  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "Món Chính",
    imageUrl: "",
    isAvailable: true,
  });

  // State cho phân trang
  const [currentCategory, setCurrentCategory] = useState("mainDishes");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Lọc danh sách món ăn dựa trên searchTerm
  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Phân loại danh sách món ăn theo danh mục
  const mainDishes = filteredItems.filter(
    (item) => item.category === "Món Chính"
  );
  const desserts = filteredItems.filter(
    (item) => item.category === "Tráng Miệng"
  );
  const drinks = filteredItems.filter((item) => item.category === "Đồ Uống");

  // Lấy danh sách món ăn hiển thị dựa trên danh mục hiện tại
  const getCurrentItems = () => {
    switch (currentCategory) {
      case "mainDishes":
        return mainDishes;
      case "desserts":
        return desserts;
      case "drinks":
        return drinks;
      default:
        return [];
    }
  };

  // Tính toán danh sách món ăn hiển thị trên trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = getCurrentItems().slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Hàm chuyển đổi danh mục
  const handleCategoryChange = (category) => {
    setCurrentCategory(category);
    setCurrentPage(1);
  };

  // Hàm phân trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Component phân trang từ AdminDashboard
  const Pagination = () => {
    const totalPages = Math.ceil(getCurrentItems().length / itemsPerPage);

    return (
      <nav>
        <ul className="pagination justify-content-center">
          {/* Nút Previous */}
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>
          </li>

          {/* Các nút trang */}
          {Array.from({ length: totalPages }, (_, index) => (
            <li
              key={index}
              className={`page-item ${
                currentPage === index + 1 ? "active" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            </li>
          ))}

          {/* Nút Next */}
          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5112/api/menuitem/get-all-menuitems"
      );
      const data = response.data?.$values || [];
      setMenuItems(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách món ăn:", error);
      setMenuItems([]);
    }
  };

  const handleAddItem = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        "http://localhost:5112/api/menuitem/add-new-menuitem",
        newItem,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const addedItem = response.data;
      setMenuItems([...menuItems, addedItem]);

      setNewItem({
        name: "",
        description: "",
        price: "",
        category: "Món Chính",
        imageUrl: "",
        isAvailable: true,
      });

      handleClose();
    } catch (error) {
      console.error("Lỗi khi thêm món ăn:", error.response?.data || error);
    }
  };

  const handleDeleteItem = async (menuItemId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa món ăn này?")) return;

    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(
        `http://localhost:5112/api/menuitem/delete-menuitem-by-id/${menuItemId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedItems = menuItems.filter(
        (item) => item.menuItemId !== menuItemId
      );
      setMenuItems(updatedItems);
    } catch (error) {
      console.error("Lỗi khi xoá món ăn:", error.response?.data || error);
    }
  };

  // Hàm cập nhật danh sách món ăn sau khi chỉnh sửa
  const handleUpdate = (updatedProduct) => {
    setMenuItems((prevItems) =>
      prevItems.map((item) =>
        item.menuItemId === updatedProduct.menuItemId ? updatedProduct : item
      )
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Quản lý món ăn</h1>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm món ăn..."
          className="p-2 border border-gray-300 rounded w-full max-w-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition ml-4"
          onClick={handleShow}
        >
          Thêm món mới
        </button>
      </div>

      {/* Modal thêm món mới */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Thêm món mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>URL hình ảnh</Form.Label>
              <Form.Control
                type="text"
                autoFocus
                value={newItem.imageUrl}
                onChange={(e) =>
                  setNewItem({ ...newItem, imageUrl: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Tên Món Ăn</Form.Label>
              <Form.Control
                type="text"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Giá</Form.Label>
              <Form.Control
                type="number"
                value={newItem.price}
                onChange={(e) =>
                  setNewItem({ ...newItem, price: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Danh Mục</Form.Label>
              <Form.Select
                value={newItem.category}
                onChange={(e) =>
                  setNewItem({ ...newItem, category: e.target.value })
                }
              >
                <option value="Món Chính">Món Chính</option>
                <option value="Tráng Miệng">Tráng Miệng</option>
                <option value="Đồ Uống">Đồ Uống</option>
              </Form.Select>
            </Form.Group>
            <Form.Group
              className="mb-3"
              controlId="exampleForm.ControlTextarea1"
            >
              <Form.Label>Chi tiết</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handleAddItem}>
            Thêm mới
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Nút chuyển đổi danh mục */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => handleCategoryChange("mainDishes")}
          className={`px-4 py-2 rounded-lg ${
            currentCategory === "mainDishes"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Món chính
        </button>
        <button
          onClick={() => handleCategoryChange("desserts")}
          className={`px-4 py-2 rounded-lg ${
            currentCategory === "desserts"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Tráng miệng
        </button>
        <button
          onClick={() => handleCategoryChange("drinks")}
          className={`px-4 py-2 rounded-lg ${
            currentCategory === "drinks"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Đồ uống
        </button>
      </div>

      {/* Hiển thị danh sách món ăn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {currentItems.map((product) => (
          <ProductCard
            key={product.menuItemId}
            product={product}
            onView={() => setSelectedProduct(product)}
            onDelete={handleDeleteItem}
          />
        ))}
      </div>

      {/* Phân trang */}
      <div style={{ marginTop: "16px" }}>
        {" "}
        {/* Thêm margin-top */}
        <Pagination />
      </div>

      {/* Modal chỉnh sửa chi tiết */}
      <EditDetailManagement
        selectedProduct={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onUpdate={handleUpdate} // Truyền hàm handleUpdate vào đây
      />
    </div>
  );
};

export default MenuManagement;
