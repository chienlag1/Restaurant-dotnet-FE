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
      // 1. Tạo PaymentMethod (giữ nguyên)
      const cardElement = elements.getElement(CardElement);
      const { paymentMethod, error: methodError } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
          billing_details: {
            name: "Tên khách hàng",
          },
        });

      if (methodError) {
        throw new Error(methodError.message || "Lỗi thông tin thẻ");
      }

      // 2. Gọi API process-payment (giữ nguyên)
      const processResponse = await fetch(
        "https://berestaurantmanagementv2-cgggezezbyf2f6gr.japanwest-01.azurewebsites.net/api/payment/process-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer YOUR_AUTH_TOKEN",
          },
          body: JSON.stringify({
            orderId,
            paymentMethod: "card",
            paymentMethodId: paymentMethod.id,
            amount: Math.round(amount * 100),
            currency: "usd",
          }),
        }
      );

      const processResult = await processResponse.json();
      console.log("Process Payment Result:", processResult);

      if (!processResponse.ok) {
        throw new Error(
          processResult.message ||
            `Lỗi khởi tạo thanh toán (${processResponse.status})`
        );
      }

      if (!processResult.transactionId) {
        throw new Error("Không nhận được transactionId từ server");
      }

      // 3. Gọi API confirm-payment với xử lý response linh hoạt hơn
      const confirmResponse = await fetch(
        "https://berestaurantmanagementv2-cgggezezbyf2f6gr.japanwest-01.azurewebsites.net/api/payment/confirm-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer YOUR_AUTH_TOKEN",
          },
          body: JSON.stringify({
            paymentIntentId: processResult.transactionId,
            paymentMethodId: paymentMethod.id,
            orderId: orderId,
          }),
        }
      );

      const confirmResult = await confirmResponse.json();

      // Xử lý response linh hoạt hơn
      if (confirmResponse.ok || confirmResult.paymentStatus === "succeeded") {
        setPaymentMessage("Thanh toán thành công!");

        // Tự động đóng modal sau 2 giây
        setTimeout(() => {
          if (onPaymentSuccess) onPaymentSuccess(confirmResult);
        }, 2000);
      } else {
        throw new Error(
          confirmResult.message || "Xác nhận thanh toán không thành công"
        );
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
          hidePostalCode: false,
          postalCodeElementOptions: {
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
