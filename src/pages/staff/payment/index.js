import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PaymentFormWrapper from "../../../components/paymentComponents/PaymentForm";

const Payment = () => {
  const { orderId } = useParams(); // Lấy orderId từ URL
  const navigate = useNavigate();

  // State quản lý dữ liệu và trạng thái của trang
  const [order, setOrder] = useState(null); // Lưu thông tin đơn hàng
  const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu
  const [error, setError] = useState(null); // Lưu lỗi nếu có
  const [promotions, setPromotions] = useState([]); // Lưu danh sách mã giảm giá
  const [selectedPromotion, setSelectedPromotion] = useState(""); // Mã giảm giá được chọn
  const [discountPercentage, setDiscountPercentage] = useState(0); // Phần trăm giảm giá
  const [discountAmount, setDiscountAmount] = useState(0); // Số tiền giảm giá
  const [subtotalAfterDiscount, setSubtotalAfterDiscount] = useState(0); // Số tiền sau giảm giá
  const [vatAmount, setVatAmount] = useState(0); // VAT (10%)
  const [finalTotal, setFinalTotal] = useState(0); // Tổng tiền cuối cùng
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false); // Trạng thái modal thanh toán
  const [paymentMethod, setPaymentMethod] = useState("Cash"); // Phương thức thanh toán hiện tại
  // Hàm mở và đóng modal thanh toán
  const openPaymentModal = () => setIsPaymentModalOpen(true);
  const closePaymentModal = () => setIsPaymentModalOpen(false);

  // Lấy thông tin đơn hàng từ API
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Validate orderId
        if (!orderId || isNaN(orderId)) {
          throw new Error("Mã đơn hàng không hợp lệ");
        }

        const token = localStorage.getItem("authToken");
        if (!token) {
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

        // Kiểm tra dữ liệu trả về
        if (!response.data || !response.data.orderId) {
          throw new Error("Không tìm thấy thông tin đơn hàng");
        }

        setOrder(response.data);
      } catch (err) {
        setError(err.message || "Đã xảy ra lỗi khi tải thông tin đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  // Lấy danh sách mã giảm giá từ API
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }
        const response = await axios.get(
          "http://localhost:5112/api/Promotions/get-all-promotions",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Promotions API Response:", response.data); // Debug dữ liệu trả về
        if (response.data && Array.isArray(response.data.$values)) {
          setPromotions(response.data.$values);
        } else {
          console.error("Dữ liệu promotions không hợp lệ:", response.data);
        }
      } catch (err) {
        console.error("Lỗi khi lấy danh sách mã giảm giá:", err);
      }
    };
    fetchPromotions();
  }, [navigate]);

  // Tính tổng tiền của đơn hàng
  const totalAmount =
    order?.orderItems?.$values?.reduce(
      (total, item) => total + item.totalPrice * item.quantity,
      0
    ) || 0;

  // Tính toán tổng tiền sau khi áp dụng giảm giá và VAT
  useEffect(() => {
    if (selectedPromotion) {
      const selectedPromo = promotions.find(
        (promo) => promo.name === selectedPromotion
      );
      if (selectedPromo) {
        const discount = totalAmount * (selectedPromo.discountPercentage / 100);
        setDiscountAmount(discount);
        const subtotal = totalAmount - discount;
        setSubtotalAfterDiscount(subtotal);
        const vat = subtotal * 0.1;
        setVatAmount(vat);
        const final = subtotal + vat;
        setFinalTotal(final);
        setDiscountPercentage(selectedPromo.discountPercentage);
      }
    } else {
      const vat = totalAmount * 0.1;
      setVatAmount(vat);
      setFinalTotal(totalAmount + vat);
      setDiscountPercentage(0);
      setDiscountAmount(0);
      setSubtotalAfterDiscount(totalAmount);
    }
  }, [selectedPromotion, totalAmount, promotions]);

  // Hiển thị loading khi đang tải dữ liệu
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-700">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (paymentMethod === "Stripe Card") {
      openPaymentModal(); // Mở modal nếu phương thức thanh toán là thẻ tín dụng
    } else {
      alert("Thanh toán bằng tiền mặt đã được chọn."); // Xử lý thanh toán tiền mặt
    }
  };

  // Hiển thị lỗi nếu có
  // Trong component Payment
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-red-500 text-4xl mb-4 text-center">⚠️</div>
          <h2 className="text-xl font-bold text-center mb-4">
            Chưa có đơn hàng cần thanh toán
          </h2>

          <div className="flex flex-col space-y-3">
            <button
              onClick={() => navigate("/order-customer")}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Quay lại đơn hàng
            </button>
            <button
              onClick={() => navigate("/menu")}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Quay lại menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 p-4">
        <div className="flex flex-col md:flex-row w-full h-full max-w-6xl bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Section hiển thị danh sách sản phẩm */}
          <div className="w-full md:w-1/2 p-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              🛒 Danh Sách Sản Phẩm
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white divide-y divide-gray-200 rounded-lg shadow-md">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Tên Sản Phẩm
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Giá Tiền
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order?.orderItems?.$values &&
                  Array.isArray(order.orderItems.$values) ? (
                    order.orderItems.$values.map((item) => (
                      <tr
                        key={item.orderItemId}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.menuItem?.name || "Không có tên"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-800">
                          {(item.totalPrice * item.quantity).toLocaleString()}₫
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="2"
                        className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600"
                      >
                        Không có sản phẩm nào trong đơn hàng.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Hiển thị tổng tiền */}
            <div className="mt-8">
              <div className="flex justify-between items-center py-3 border-t border-b border-gray-200">
                <span className="font-medium text-gray-700">Tổng Tiền:</span>
                <span className="font-semibold text-lg text-gray-800">
                  {totalAmount.toLocaleString()} VND
                </span>
              </div>
              {discountPercentage > 0 && (
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-700">
                    Giảm giá ({discountPercentage}%):
                  </span>
                  <span className="font-semibold text-red-500">
                    -{discountAmount.toLocaleString()} VND
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-700">Số tiền sau giảm giá:</span>
                <span className="font-semibold text-gray-800">
                  {subtotalAfterDiscount.toLocaleString()} VND
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-700">VAT (10%):</span>
                <span className="font-semibold text-green-600">
                  +{vatAmount.toLocaleString()} VND
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-t border-gray-200">
                <span className="text-gray-700 font-medium">
                  Tổng tiền cuối cùng:
                </span>
                <span className="font-bold text-2xl text-blue-600">
                  {finalTotal.toLocaleString()} VND
                </span>
              </div>
            </div>
          </div>

          {/* Section hiển thị thông tin thanh toán */}
          <div className="w-full md:w-1/2 p-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-8">
              💳 Thông Tin Thanh Toán
            </h3>
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="tableId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Bàn Số
                </label>
                <input
                  type="text"
                  id="tableId"
                  value={order?.tableId || ""}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  readOnly
                />
              </div>
              <div>
                <label
                  htmlFor="customerName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Tên Khách Hàng
                </label>
                <input
                  type="text"
                  id="customerName"
                  value={order?.customer?.fullName || ""}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  readOnly
                />
              </div>
              <div>
                <label
                  htmlFor="promotionCode"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Mã giảm giá
                </label>
                <select
                  id="promotionCode"
                  value={selectedPromotion}
                  onChange={(e) => setSelectedPromotion(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">Chọn mã giảm giá</option>
                  {promotions.map((promotion) => (
                    <option key={promotion.promotionId} value={promotion.name}>
                      {promotion.name} ({promotion.discountPercentage}%)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="paymentMethod"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phương Thức Thanh Toán
                </label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="Cash">Tiền Mặt</option>
                  <option value="Stripe Card">Thẻ Tín Dụng</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Thanh Toán
              </button>
            </form>
          </div>
        </div>

        {/* Modal thanh toán thẻ tín dụng */}
        {isPaymentModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Thanh Toán Bằng Thẻ</h2>
                <button
                  onClick={closePaymentModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <PaymentFormWrapper
                orderId={orderId}
                amount={finalTotal}
                onPaymentSuccess={(result) => {
                  navigate("/order-customer");
                  closePaymentModal();
                }}
                onClose={closePaymentModal}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Payment;
