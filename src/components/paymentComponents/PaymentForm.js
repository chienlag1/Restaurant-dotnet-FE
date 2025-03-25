import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  "pk_test_51QzDyOQD9zTcHYFLqILQNTyFc9HXRPobrR4eHGsEOp9Ek2BOaTBFZIXraDjyZzGn0MPoVbtf2A1D8Dhla9A1E2hY00I53rGcLb"
);

const PaymentForm = ({ orderId, onPaymentSuccess, onClose, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentMessage, setPaymentMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPaymentMessage("Đang xử lý...");
    setIsProcessing(true);

    if (!stripe || !elements) {
      setPaymentMessage("Stripe chưa sẵn sàng.");
      setIsProcessing(false);
      return;
    }

    try {
      // 1. Tạo PaymentMethod
      const cardElement = elements.getElement(CardElement);
      const { paymentMethod, error: methodError } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
          billing_details: {
            // Thêm thông tin billing nếu cần
            name: "Tên khách hàng", // Có thể lấy từ form
          },
        });

      if (methodError) {
        throw new Error(methodError.message || "Lỗi thông tin thẻ");
      }

      // 2. Chuẩn bị dữ liệu gửi lên server
      const paymentData = {
        orderId: orderId,
        paymentMethod: "card", // Thay "Card" thành "card" để chuẩn Stripe
        paymentMethodId: paymentMethod.id, // Thay cardToken thành paymentMethodId
        amount: Math.round(amount * 100), // Gửi amount dưới dạng cents (số nguyên)
        currency: "vnd", // Thêm currency nếu server yêu cầu
        metadata: {
          // Thêm metadata nếu cần
          order_id: orderId,
        },
      };

      // 3. Gọi API process-payment
      const processResponse = await fetch(
        "http://localhost:5112/api/payment/process-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer YOUR_AUTH_TOKEN", // Thêm nếu API yêu cầu
          },
          body: JSON.stringify(paymentData),
        }
      );

      const processResult = await processResponse.json();

      if (!processResponse.ok) {
        console.error("Chi tiết lỗi từ server:", processResult);
        throw new Error(
          processResult.message ||
            processResult.error ||
            "Không thể xử lý thanh toán. Mã lỗi: " + processResponse.status
        );
      }

      // 4. Xử lý kết quả
      if (processResult.requires_action && processResult.client_secret) {
        // Xác nhận thanh toán 3D Secure nếu cần
        const { error: confirmError, paymentIntent } =
          await stripe.confirmCardPayment(processResult.client_secret);

        if (confirmError) {
          throw new Error(
            confirmError.message || "Xác nhận thanh toán thất bại"
          );
        }

        if (paymentIntent.status === "succeeded") {
          setPaymentMessage("Thanh toán thành công!");
          if (onPaymentSuccess) onPaymentSuccess(paymentIntent);
        }
      } else if (processResult.success) {
        setPaymentMessage("Thanh toán thành công!");
        if (onPaymentSuccess) onPaymentSuccess(processResult);
      } else {
        throw new Error("Khởi tạo thanh toán thất bại");
      }
    } catch (error) {
      console.error("Payment Error Details:", error);
      setPaymentMessage(`Lỗi: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <CardElement
        options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#424770",
              "::placeholder": { color: "#aab7c4" },
            },
            invalid: { color: "#9e2146" },
          },
          hidePostalCode: false, // Hiển thị trường postal code
          postalCodeElementOptions: {
            // Tuỳ chỉnh trường postal code nếu cần
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
              },
            },
          },
        }}
        className="p-4 border border-gray-300 rounded-lg"
      />

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!stripe || isProcessing}
          className={`px-4 py-2 text-white rounded ${
            isProcessing || !stripe
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isProcessing ? "Đang xử lý..." : "Xác nhận thanh toán"}
        </button>
      </div>

      {paymentMessage && (
        <div
          className={`p-3 rounded ${
            paymentMessage.includes("thành công")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {paymentMessage}
        </div>
      )}
    </div>
  );
};

const PaymentFormWrapper = ({ orderId, onPaymentSuccess, onClose, amount }) => (
  <Elements stripe={stripePromise}>
    <PaymentForm
      orderId={orderId}
      onPaymentSuccess={onPaymentSuccess}
      onClose={onClose}
      amount={amount}
    />
  </Elements>
);

export default PaymentFormWrapper;
