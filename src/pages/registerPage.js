import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
const RegisterPage = () => {
  const { signup } = useAuth();
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault(); // 🔥 Ngăn chặn reload trang khi submit
    const roleId = "2";

    try {
      await signup(fullname, email, password, roleId);

      alert("Đăng ký thành công! Hãy kiểm tra email để xác thực tài khoản.");
      navigate("/login");
    } catch (error) {
      alert(
        "Lỗi đăng ký: " + (error.message || "Không thể kết nối đến server")
      );
    }
  };

  return (
    <>
      <section style={{ backgroundColor: "white" }} className="vh-100">
        <div className="container py-5 h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col col-xl-10">
              <div className="card" style={{ borderRadius: "1rem" }}>
                <div className="row g-0">
                  <div className="col-md-6 col-lg-5 d-none d-md-block">
                    <img
                      src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/img1.webp"
                      alt="login form"
                      className="img-fluid"
                      style={{ borderRadius: "1rem 0 0 1rem" }}
                    />
                  </div>
                  <div className="col-md-6 col-lg-7 d-flex align-items-center">
                    <div className="card-body p-4 p-lg-5 text-black">
                      <form onSubmit={handleSignup}>
                        <div className="d-flex align-items-center mb-3 pb-1">
                          <i
                            className="fas fa-cubes fa-2x me-3"
                            style={{ color: "#ff6219" }}
                          ></i>
                          <span className="h1 fw-bold mb-0">Logo</span>
                        </div>

                        <h5
                          className="fw-normal mb-3 pb-3"
                          style={{ letterSpacing: "1px" }}
                        >
                          Sign up your account
                        </h5>
                        <div data-mdb-input-init className="form-outline mb-4">
                          <input
                            type="text"
                            value={fullname}
                            id="form2Example17"
                            className="form-control form-control-lg"
                            onChange={(e) => setFullname(e.target.value)}
                          />
                          <label
                            className="form-label"
                            htmlFor="form2Example17"
                          >
                            Username
                          </label>
                        </div>
                        <div data-mdb-input-init className="form-outline mb-4">
                          <input
                            type="email"
                            value={email}
                            id="form2Example17"
                            className="form-control form-control-lg"
                            onChange={(e) => setEmail(e.target.value)}
                          />
                          <label
                            className="form-label"
                            htmlFor="form2Example17"
                          >
                            Email address
                          </label>
                        </div>

                        <div data-mdb-input-init className="form-outline mb-4">
                          <input
                            type="password"
                            value={password}
                            id="form2Example27"
                            className="form-control form-control-lg"
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          <label
                            className="form-label"
                            htmlFor="form2Example27"
                          >
                            Password
                          </label>
                        </div>

                        <div className="pt-1 mb-4">
                          <button
                            data-mdb-button-init
                            data-mdb-ripple-init
                            className="btn btn-dark btn-lg btn-block"
                            style={{ width: "50%" }}
                            type="submit"
                          >
                            Register
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default RegisterPage;
