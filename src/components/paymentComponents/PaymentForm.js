import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import './PaymentForm.css'; // Tùy chọn: CSS để tùy chỉnh giao diện

// Khởi tạo Stripe với Test Publishable Key
const stripePromise = loadStripe('pk_test_51QzDyOQD9zTcHYFLqILQNTyFc9HXRPobrR4eHGsEOp9Ek2BOaTBFZIXraDjyZzGn0MPoVbtf2A1D8Dhla9A1E2hY00I53rGcLb'); // Thay bằng Publishable Key của bạn

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentMessage, setPaymentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPaymentMessage('Đang xử lý...');
    setIsProcessing(true);

    if (!stripe || !elements) {
      setPaymentMessage('Stripe chưa sẵn sàng.');
      setIsProcessing(false);
      return;
    }

    try {
      // Bước 1: Gọi API để tạo PaymentIntent
      const response = await fetch('https://localhost:7132/api/payment/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 1000, // 10 USD (1000 cent)
          currency: 'usd',
        }),
      });

      if (!response.ok) throw new Error('Không thể tạo PaymentIntent');
      const { clientSecret } = await response.json();

      // Bước 2: Tạo PaymentMethod từ CardElement
      const cardElement = elements.getElement(CardElement);
      const { paymentMethod, error: methodError } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (methodError) {
        throw new Error(methodError.message);
      }

      // Bước 3: Gọi API để xác nhận thanh toán
      const confirmResponse = await fetch('https://localhost:7132/api/payment/confirm-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: clientSecret.split('_secret_')[0],
          paymentMethodId: paymentMethod.id,
        }),
      });

      if (!confirmResponse.ok) throw new Error('Không thể xác nhận thanh toán');
      const confirmResult = await confirmResponse.json();

      if (confirmResult.status === 'succeeded') {
        setPaymentMessage('Thanh toán thành công!');
      } else {
        throw new Error('Thanh toán thất bại');
      }
    } catch (error) {
      setPaymentMessage(`Lỗi: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-container">
      <h2>Thanh toán</h2>
      <form onSubmit={handleSubmit}>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#32325d',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#fa755a',
              },
            },
          }}
        />
        <button type="submit" disabled={!stripe || isProcessing}>
          {isProcessing ? 'Đang xử lý...' : 'Thanh toán 10 USD'}
        </button>
        {paymentMessage && <div className="payment-message">{paymentMessage}</div>}
      </form>
    </div>
  );
};

// Bọc component trong Elements để Stripe hoạt động
const PaymentFormWrapper = () => (
  <Elements stripe={stripePromise}>
    <PaymentForm />
  </Elements>
);

export default PaymentFormWrapper;