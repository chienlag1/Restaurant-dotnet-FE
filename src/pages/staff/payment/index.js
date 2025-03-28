import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import PaymentFormWrapper from "../../../components/paymentComponents/PaymentForm";

const Payment = () => {
  const { orderId: orderIdFromParams } = useParams();
  const [orderId, setOrderId] = useState(() => {
    return orderIdFromParams || localStorage.getItem("lastOrderId") || null;
  });
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [selectedPromotion, setSelectedPromotion] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [subtotalAfterDiscount, setSubtotalAfterDiscount] = useState(0);
  const [vatAmount, setVatAmount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [selectedPromotionId, setSelectedPromotionId] = useState(null);
  // New state for cash payment confirmation
  const [isCashConfirmationOpen, setIsCashConfirmationOpen] = useState(false);
  const [isCashReceived, setIsCashReceived] = useState(false);

  const openPaymentModal = () => setIsPaymentModalOpen(true);
  const closePaymentModal = () => setIsPaymentModalOpen(false);
  const openCashConfirmation = () => setIsCashConfirmationOpen(true);
  const closeCashConfirmation = () => setIsCashConfirmationOpen(false);

  useEffect(() => {
    if (!orderId || isNaN(orderId)) {
      const savedOrderId = localStorage.getItem("lastOrderId");
      if (savedOrderId && !isNaN(savedOrderId)) {
        setOrderId(savedOrderId);
      } else {
        setError("Không tìm thấy đơn hàng cần thanh toán");
        setLoading(false);
      }
    }
  }, [orderId]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!orderId || isNaN(orderId)) {
          throw new Error("Mã đơn hàng không hợp lệ");
        }

        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }
        const response = await axios.get(
          `https://berestaurantmanagementv2-cgggezezbyf2f6gr.japanwest-01.azurewebsites.net/api/order/get-order-by-id/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.data || !response.data.orderId) {
          // Xóa orderId không hợp lệ khỏi localStorage
          localStorage.removeItem("lastOrderId");
          throw new Error("Không tìm thấy thông tin đơn hàng");
        }

        setOrder(response.data);
      } catch (err) {
        setError(err.message || "Đã xảy ra lỗi khi tải thông tin đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    if (orderId && !isNaN(orderId)) {
      fetchOrder();
    }
  }, [orderId, navigate]);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }
        const response = await axios.get(
          "https://berestaurantmanagementv2-cgggezezbyf2f6gr.japanwest-01.azurewebsites.net/api/Promotions/get-all-promotions",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
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

  const totalAmount =
    order?.orderItems?.$values?.reduce(
      (total, item) => total + item.totalPrice * item.quantity,
      0
    ) || 0;

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

  const handlePromotionChange = async (e) => {
    const selectedPromoName = e.target.value;
    setSelectedPromotion(selectedPromoName);

    // Tìm và lưu promotionId tương ứng
    const selectedPromo = promotions.find(
      (promo) => promo.name === selectedPromoName
    );

    if (!selectedPromo) {
      setSelectedPromotionId(null);
      return;
    }

    setSelectedPromotionId(selectedPromo.promotionId);

    try {
      const token = localStorage.getItem("authToken");
      // Gọi API để áp dụng promotion vào order
      await axios.post(
        "https://berestaurantmanagementv2-cgggezezbyf2f6gr.japanwest-01.azurewebsites.net/api/Promotions/apply-promotion",
        {
          OrderId: parseInt(orderId),
          PromotionId: selectedPromo.promotionId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Cập nhật UI với thông tin giảm giá mới
      const discount = totalAmount * (selectedPromo.discountPercentage / 100);
      setDiscountAmount(discount);
      const subtotal = totalAmount - discount;
      setSubtotalAfterDiscount(subtotal);
      const vat = subtotal * 0.1;
      setVatAmount(vat);
      const final = subtotal + vat;
      setFinalTotal(final);
      setDiscountPercentage(selectedPromo.discountPercentage);
    } catch (error) {
      console.error("Lỗi khi áp dụng mã giảm giá:", error);
      alert(
        `Không thể áp dụng mã giảm giá: ${
          error.response?.data?.error || error.message
        }`
      );
      // Reset selection nếu có lỗi
      setSelectedPromotion("");
      setSelectedPromotionId(null);
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (paymentMethod === "Stripe Card") {
      openPaymentModal();
    } else {
      openCashConfirmation();
    }
  };

  const handleCashPaymentConfirm = async () => {
    if (!isCashReceived) {
      alert("Vui lòng xác nhận đã nhận tiền mặt từ khách hàng");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const paymentData = {
        OrderId: parseInt(orderId),
        PaymentMethod: "Cash",
        Amount: parseFloat(finalTotal.toFixed(2)), // Ensure proper decimal format
        Currency: "USD",
        Status: "Completed",
        PromotionId: selectedPromotionId,
      };

      const response = await axios.post(
        "https://berestaurantmanagementv2-cgggezezbyf2f6gr.japanwest-01.azurewebsites.net/api/payment/process-payment",
        paymentData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.status === 200) {
        alert("Thanh toán bằng tiền mặt thành công!");
        navigate(`/feedback/create/${orderId}/${order.customerId}`); // Chuyển hướng đến feedback
      } else {
        throw new Error(response.data.message || "Thanh toán thất bại");
      }
    } catch (error) {
      console.error("Payment Error Details:", {
        error: error.message,
        response: error.response?.data,
        config: error.config,
      });
      alert(`Lỗi thanh toán: ${error.response?.data?.error || error.message}`);
    } finally {
      closeCashConfirmation();
    }
  };

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
          {/* Product list section */}
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
                          {(item.totalPrice * item.quantity).toLocaleString()}{" "}
                          USD {/* Đổi sang USD để khớp với back-end */}
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
            <div className="mt-8">
              <div className="flex justify-between items-center py-3 border-t border-b border-gray-200">
                <span className="font-medium text-gray-700">Tổng Tiền:</span>
                <span className="font-semibold text-lg text-gray-800">
                  {totalAmount.toLocaleString()} USD
                </span>
              </div>
              {discountPercentage > 0 && (
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-700">
                    Giảm giá ({discountPercentage}%):
                  </span>
                  <span className="font-semibold text-red-500">
                    -{discountAmount.toLocaleString()} USD
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-700">Số tiền sau giảm giá:</span>
                <span className="font-semibold text-gray-800">
                  {subtotalAfterDiscount.toLocaleString()} USD
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-700">VAT (10%):</span>
                <span className="font-semibold text-green-600">
                  +{vatAmount.toLocaleString()} USD
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-t border-gray-200">
                <span className="text-gray-700 font-medium">
                  Tổng tiền cuối cùng:
                </span>
                <span className="font-bold text-2xl text-blue-600">
                  {finalTotal.toLocaleString()} USD
                </span>
              </div>
            </div>
          </div>

          {/* Payment information section */}
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
                  onChange={handlePromotionChange}
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

        {/* Credit card payment modal */}
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
                  navigate(`/feedback/create/${orderId}/${order.customerId}`); // Chuyển hướng đến feedback
                  closePaymentModal();
                }}
                onClose={closePaymentModal}
              />
            </div>
          </div>
        )}

        {/* Cash payment confirmation modal */}
        {isCashConfirmationOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">
                  Xác Nhận Thanh Toán Tiền Mặt
                </h2>
                <button
                  onClick={closeCashConfirmation}
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

              <div className="mb-6">
                <p className="text-lg font-medium mb-2">
                  Tổng số tiền cần thanh toán:
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {finalTotal.toLocaleString()} USD
                </p>
              </div>

              <div className="mb-6">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={isCashReceived}
                    onChange={(e) => setIsCashReceived(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">
                    Tôi đã nhận đủ tiền mặt từ khách hàng
                  </span>
                </label>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={closeCashConfirmation}
                  className="flex-1 py-3 px-4 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                >
                  Quay Lại
                </button>
                <button
                  onClick={handleCashPaymentConfirm}
                  disabled={!isCashReceived}
                  className={`flex-1 py-3 px-4 font-medium rounded-lg transition-colors ${
                    isCashReceived
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Xác Nhận Thanh Toán
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Payment;
