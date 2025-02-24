import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const ForgotPasswordPage = () => {
    const { resetPassword } = useAuth(); // Hàm đặt lại mật khẩu từ context
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setMessage(""); // Xóa thông báo cũ

        try {
            await resetPassword(email);
            setMessage("✅ Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn.");
        } catch (error) {
            setMessage("❌ Lỗi: " + (error.message || "Không thể gửi yêu cầu."));
        }
    };

    return (
        <section style={{ backgroundColor: "white" }} className="vh-100">
            <div className="container py-5 h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col col-xl-5">
                        <div className="card" style={{ borderRadius: "1rem" }}>
                            <div className="card-body p-4 text-black">
                                <h3 className="fw-bold mb-3 text-center">Forgot Password?</h3>
                                <p className="text-muted text-center">
                                    Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
                                </p>

                                {message && <div className="alert alert-info">{message}</div>}

                                <form onSubmit={handleForgotPassword}>
                                    <div className="form-outline mb-4">
                                        <input
                                            type="email"
                                            className="form-control form-control-lg"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <button
                                        className="btn btn-dark btn-lg btn-block w-100"
                                        type="submit"
                                    >
                                        Reset Password
                                    </button>
                                </form>

                                <div className="text-center mt-3">
                                    <a href="/login" className="small text-muted">
                                        Back to Login
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ForgotPasswordPage;
