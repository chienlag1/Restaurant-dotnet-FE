import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../../components/productCard.js";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";

const MenuManagement = () => {
  const [show, setShow] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
    isAvailable: true,
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5112/api/menuitems/GetAllMenuItems"
      );
      if (response.data?.$values) {
        setMenuItems(response.data.$values);
        setFilteredItems(response.data.$values);
      } else {
        console.error("Dữ liệu trả về không đúng định dạng:", response.data);
        setMenuItems([]);
        setFilteredItems([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách món ăn:", error);
      setMenuItems([]);
      setFilteredItems([]);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    if (value === "") {
      setFilteredItems(menuItems);
    } else {
      const filtered = menuItems.filter((item) =>
        item.name.toLowerCase().includes(value)
      );
      setFilteredItems(filtered);
    }
  };

  const handleAddItem = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        "http://localhost:5112/api/menuitems/AddNewMenu",
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
      setFilteredItems([...menuItems, addedItem]);

      setNewItem({
        name: "",
        description: "",
        price: "",
        category: "",
        imageUrl: "",
        isAvailable: true,
      });
    } catch (error) {
      console.error("Lỗi khi thêm món ăn:", error.response?.data || error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Quản lý món ăn</h1>

      {/* Thanh tìm kiếm và nút thêm món */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm món ăn..."
          className="p-2 border border-gray-300 rounded w-full max-w-md"
          value={searchTerm}
          onChange={handleSearch}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition ml-4"
          onClick={handleShow}
        >
          Thêm món mới
        </button>
      </div>

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
                autoFocus
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
                autoFocus
                value={newItem.price}
                onChange={(e) =>
                  setNewItem({ ...newItem, price: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Danh Mục</Form.Label>
              <Form.Control
                type="text"
                autoFocus
                value={newItem.category}
                onChange={(e) =>
                  setNewItem({ ...newItem, category: e.target.value })
                }
              />
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

      {/* Hiển thị danh sách món ăn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {filteredItems.map((product) => (
          <ProductCard
            key={product.id} // Đảm bảo mỗi item có key duy nhất
            product={product.name}
            onView={() => setSelectedProduct(product)}
            onDelete={() => console.log("Xóa món ăn")}
          />
        ))}
      </div>
    </div>
  );
};

export default MenuManagement;
