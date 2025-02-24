import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";

const ResetPasswordPage = () => {
    const { confirmPasswordReset } = useAuth(); // Hàm xác nhận đặt lại mật khẩu
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage("");

        if (newPassword !== confirmNewPassword) {
            setMessage("❌ Mật khẩu nhập lại không khớp!");
            return;
        }

        const resetToken = searchParams.get("token"); // Lấy token từ URL
        if (!resetToken) {
            setMessage("❌ Liên kết đặt lại mật khẩu không hợp lệ.");
            return;
        }

        try {
            await confirmPasswordReset(resetToken, newPassword);
            setMessage("✅ Đặt lại mật khẩu thành công! Đang chuyển hướng...");
            setTimeout(() => navigate("/login"), 3000);
        } catch (error) {
            setMessage("❌ Lỗi: " + (error.message || "Không thể đặt lại mật khẩu."));
        }
    };

    return (
        <section style={{ backgroundColor: "white" }} className="vh-100">
            <div className="container py-5 h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col col-xl-5">
                        <div className="card" style={{ borderRadius: "1rem" }}>
                            <div className="card-body p-4 text-black">
                                <h3 className="fw-bold mb-3 text-center">Reset Password</h3>
                                {message && <div className="alert alert-info">{message}</div>}

                                <form onSubmit={handleResetPassword}>
                                    <div className="form-outline mb-4">
                                        <input
                                            type="password"
                                            className="form-control form-control-lg"
                                            placeholder="New Password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-outline mb-4">
                                        <input
                                            type="password"
                                            className="form-control form-control-lg"
                                            placeholder="Confirm New Password"
                                            value={confirmNewPassword}
                                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <button className="btn btn-dark btn-lg btn-block w-100" type="submit">
                                        Change Password
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

export default ResetPasswordPage;
