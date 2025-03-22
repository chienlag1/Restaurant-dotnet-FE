import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Payment = () => {
  const { orderId } = useParams(); // Lấy orderId từ URL
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [promotions, setPromotions] = useState([]); // State để lưu trữ danh sách mã giảm giá
  const [selectedPromotion, setSelectedPromotion] = useState(""); // State để lưu trữ mã giảm giá được chọn
  const [discountPercentage, setDiscountPercentage] = useState(0); // State để lưu trữ phần trăm giảm giá
  const [discountAmount, setDiscountAmount] = useState(0); // State để lưu trữ số tiền đã được trừ
  const [subtotalAfterDiscount, setSubtotalAfterDiscount] = useState(0); // State để lưu trữ số tiền sau giảm giá
  const [vatAmount, setVatAmount] = useState(0); // State để lưu trữ VAT
  const [finalTotal, setFinalTotal] = useState(0); // State để lưu trữ tổng tiền cuối cùng

  // Lấy thông tin đơn hàng từ API
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!orderId) {
          throw new Error("Không tìm thấy mã đơn hàng.");
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

        console.log("API Response:", response.data); // Kiểm tra dữ liệu trả về từ API
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

  console.log("Total Amount:", totalAmount); // Debug giá trị totalAmount

  // Tính toán tổng tiền sau khi áp dụng giảm giá và VAT
  useEffect(() => {
    console.log("Selected Promotion:", selectedPromotion);
    console.log("Promotions List:", promotions);
    if (selectedPromotion) {
      const selectedPromo = promotions.find(
        (promo) => promo.name === selectedPromotion
      );
      console.log("Found Promotion:", selectedPromo);
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

  // Hiển thị lỗi nếu có
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-2xl">⚠️</div>
          <p className="mt-4 text-gray-700">{error}</p>
          <button
            onClick={() => navigate("/order-customer")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Hiển thị thông tin đơn hàng
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-purple-50 p-4">
      <div className="flex flex-col md:flex-row w-full h-full max-w-6xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Product List Section */}
        <div className="w-full md:w-1/2 p-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            🛒 Danh Sách Sản Phẩm
          </h3>

          {/* Bảng danh sách sản phẩm */}
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

          {/* Tổng tiền */}
          <div className="mt-8">
            <div className="flex justify-between items-center py-3 border-t border-b border-gray-200">
              <span className="font-medium text-gray-700">Tổng Tiền:</span>
              <span className="font-semibold text-lg text-gray-800">
                {totalAmount.toLocaleString()} VND
              </span>
            </div>

            {/* Giảm giá */}
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

            {/* Số tiền sau giảm giá */}
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-700">Số tiền sau giảm giá:</span>
              <span className="font-semibold text-gray-800">
                {subtotalAfterDiscount.toLocaleString()} VND
              </span>
            </div>

            {/* VAT */}
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-700">VAT (10%):</span>
              <span className="font-semibold text-green-600">
                +{vatAmount.toLocaleString()} VND
              </span>
            </div>

            {/* Tổng tiền cuối cùng */}
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

        {/* Payment Information Section */}
        <div className="w-full md:w-1/2 p-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-8">
            💳 Thông Tin Thanh Toán
          </h3>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
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
                value={order?.tableId || ""} // Hiển thị tableId
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                readOnly // Không cho phép chỉnh sửa
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
                value={order?.customer?.fullName || ""} // Hiển thị tên khách hàng
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                readOnly // Không cho phép chỉnh sửa
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="card">Thẻ Tín Dụng</option>
                <option value="cash">Tiền Mặt</option>
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
    </div>
  );
};

export default Payment;
