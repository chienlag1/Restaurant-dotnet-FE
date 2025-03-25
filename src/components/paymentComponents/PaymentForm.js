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
      // Bước 1: Tạo PaymentMethod từ CardElement
      const cardElement = elements.getElement(CardElement);
      const { paymentMethod, error: methodError } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
        });

      if (methodError) throw new Error(methodError.message);

      // giá trị của số tiền phải trả có 2 số thập phân
      const roundedAmount = Math.round(amount * 100) / 100;
      // Bước 2: Gọi API process-payment để khởi tạo giao dịch
      const processResponse = await fetch(
        "http://localhost:5112/api/payment/process-payment",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderId,
            paymentMethod: "Card",
            cardToken: paymentMethod.id,
            amount: roundedAmount,
          }),
        }
      );

      if (!processResponse.ok) {
        const errorData = await processResponse.json();
        console.error("Process Payment API Error:", errorData); // Ghi log lỗi
        throw new Error(
          errorData.message ||
            "Không thể xử lý thanh toán. Vui lòng thử lại sau."
        );
      }

      const processResult = await processResponse.json();

      if (!processResult.success) {
        throw new Error(
          processResult.message || "Khởi tạo thanh toán thất bại."
        );
      }

      // Bước 3: Gọi API confirm-payment để xác nhận giao dịch
      const confirmResponse = await fetch(
        "http://localhost:5112/api/payment/confirm-payment",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderId,
            paymentIntentId: processResult.paymentIntentId, // Giả sử API trả về paymentIntentId
          }),
        }
      );

      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json();
        console.error("Confirm Payment API Error:", errorData); // Ghi log lỗi
        throw new Error(
          errorData.message ||
            "Không thể xác nhận thanh toán. Vui lòng thử lại sau."
        );
      }

      const confirmResult = await confirmResponse.json();

      if (confirmResult.success) {
        setPaymentMessage("Thanh toán thành công!");
        if (onPaymentSuccess) onPaymentSuccess(confirmResult);
      } else {
        throw new Error(
          confirmResult.message || "Xác nhận thanh toán thất bại."
        );
      }
    } catch (error) {
      setPaymentMessage(`Lỗi: ${error.message}`);
      console.error("Payment Error:", error); // Ghi log lỗi
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
              "::placeholder": {
                color: "#aab7c4",
              },
            },
            invalid: {
              color: "#9e2146",
            },
          },
        }}
        className="p-4 border border-gray-300 rounded-lg"
      />
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Hủy
        </button>
        <button
          type="submit"
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
