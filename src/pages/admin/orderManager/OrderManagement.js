import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [editedOrderDetails, setEditedOrderDetails] = useState(null);
  const [staffList, setStaffList] = useState([]); // All staff members
  const [kitchenStaffList, setKitchenStaffList] = useState([]); // Kitchen staff only
  const [showDetailModal, setShowDetailModal] = useState(false); // Modal visibility state
  const navigate = useNavigate();

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No token found, redirecting to login...");
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:5112/api/order/get-all-orders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setOrders(
          Array.isArray(response.data.$values) ? response.data.$values : []
        );
      } catch (error) {
        console.error("Error fetching orders:", error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("authToken");
          navigate("/login");
        } else {
          setError("Không thể lấy danh sách đơn hàng. Vui lòng thử lại sau.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  // Fetch staff and kitchen staff list
  useEffect(() => {
    const fetchStaffList = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.");
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:5112/api/staff/get-all-staff", // Get all staff
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const allStaff = response.data.$values || [];
        setStaffList(allStaff.filter((staff) => staff.roleId === 4)); // Lọc nhân viên (roleId = 4)

        // Now fetch kitchen staff separately
        const kitchenStaffResponse = await axios.get(
          "http://localhost:5112/api/staff/get-all-kitchen-staff", // Get kitchen staff
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const kitchenStaff = kitchenStaffResponse.data.$values || [];
        setKitchenStaffList(kitchenStaff); // Lưu nhân viên bếp
      } catch (error) {
        console.error("Error fetching staff list:", error);
        setError("Không thể lấy danh sách nhân viên. Vui lòng thử lại sau.");
      }
    };

    fetchStaffList();
  }, [navigate]);

  // Show order details in the modal
  const handleShowDetail = async (orderId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.");
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `http://localhost:5112/api/order/get-order-by-id/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const orderItems = Array.isArray(response.data.orderItems?.$values)
        ? response.data.orderItems.$values
        : [];

      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );

      const orderDetails = {
        ...response.data,
        orderItems,
        totalAmount,
      };

      setEditedOrderDetails({
        ...orderDetails,
        customerName: orderDetails.customer.fullName,
        staffName: orderDetails.staff.fullName,
        kitchenStaffId: orderDetails.kitchenStaff?.staffId || "",
      });

      setShowDetailModal(true);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("Không thể lấy thông tin chi tiết đơn hàng. Vui lòng thử lại sau.");
    }
  };

  // Handle input change in the modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedOrderDetails({
      ...editedOrderDetails,
      [name]: value,
    });
  };

  // Save changes after editing
  const handleSaveChanges = async () => {
    if (!editedOrderDetails) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.");
        navigate("/login");
        return;
      }

      await axios.put(
        `http://localhost:5112/api/order/update-order/${editedOrderDetails.orderId}`,
        {
          customerName: editedOrderDetails.customerName,
          staffName: editedOrderDetails.staffName,
          kitchenStaffId: editedOrderDetails.kitchenStaffId,
          orderItems: editedOrderDetails.orderItems,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage("Đơn hàng đã được cập nhật thành công!");
      setShowDetailModal(false);
    } catch (error) {
      console.error("Error updating order:", error);
      setError("Cập nhật đơn hàng thất bại. Vui lòng thử lại sau.");
    }
  };

  // Display loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <Spinner animation="border" role="status" className="mx-auto">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
        <p className="mt-2">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-center text-2xl font-bold text-blue-600 mb-6">
        Danh Sách Đơn Hàng
      </h2>

      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccessMessage(null)}
          className="mb-4"
        >
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setError(null)}
          className="mb-4"
        >
          {error}
        </Alert>
      )}

      {orders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <div
              key={order.orderId} // Ensure a unique key is used for each list item
              className="bg-white shadow-lg rounded-lg overflow-hidden"
            >
              <div className="bg-blue-600 text-white p-4">
                <h3 className="text-lg font-bold">Đơn hàng #{order.orderId}</h3>
              </div>
              <div className="p-4">
                <p className="text-gray-700 mb-1">
                  <strong>Khách hàng:</strong> {order.customerName}
                </p>
                <p className="text-gray-700 mb-1">
                  <strong>Nhân viên:</strong> {order.staffName}
                </p>
                <p className="text-gray-700 mb-3">
                  <strong>Ngày đặt:</strong>{" "}
                  {new Date(order.orderDate).toLocaleString()}
                </p>
                <div className="flex justify-between mt-4">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={() => handleShowDetail(order.orderId)} // Gọi hàm hiển thị chi tiết
                  >
                    Chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center bg-white shadow-lg rounded-lg p-8">
          <p className="text-xl text-gray-600">Không có đơn hàng nào.</p>
        </div>
      )}

      {/* Modal chi tiết đơn hàng */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editedOrderDetails ? (
            <>
              <p>
                <strong>ID đơn hàng:</strong> {editedOrderDetails.orderId}
              </p>
              <div>
                <label>
                  <strong>Khách hàng:</strong>
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={editedOrderDetails.customerName}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>

              <div>
                <label>
                  <strong>Nhân viên:</strong>
                </label>
                <select
                  name="staffName"
                  value={editedOrderDetails.staffName}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  {staffList.map((staff) => (
                    <option key={staff.staffId} value={staff.fullName}>
                      {staff.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>
                  <strong>Nhân viên bếp:</strong>
                </label>
                <select
                  name="kitchenStaffId"
                  value={editedOrderDetails.kitchenStaffId}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  {kitchenStaffList.length > 0 ? (
                    kitchenStaffList.map((staff) => (
                      <option key={staff.staffId} value={staff.staffId}>
                        {staff.fullName}
                      </option>
                    ))
                  ) : (
                    <option value="">Không có nhân viên bếp</option>
                  )}
                </select>
              </div>

              <h6 className="font-bold mt-4">Danh sách món ăn:</h6>
              <ul>
                {editedOrderDetails.orderItems.map((item) => (
                  <li key={item.orderItemId} className="mb-2">
                    <p>
                      <strong>Tên món:</strong> {item.menuItem.name}
                    </p>
                    <p>
                      <strong>Giá:</strong>{" "}
                      {item.menuItem.price?.toLocaleString() || "0"} VND
                    </p>
                    <p>
                      <strong>Số lượng:</strong> {item.quantity}
                    </p>
                  </li>
                ))}
              </ul>

              <p className="font-bold mt-4">
                <strong>Tổng tiền đơn hàng:</strong>{" "}
                {editedOrderDetails.totalAmount?.toLocaleString() || "0"} VND
              </p>
            </>
          ) : (
            <p>Đang tải thông tin chi tiết...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Lưu thay đổi
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Order;