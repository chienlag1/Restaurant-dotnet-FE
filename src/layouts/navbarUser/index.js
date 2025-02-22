import { useNavigate } from "react-router-dom";
const NavbarUser = () => {
  const navigate = useNavigate();
  return (
    <>
      <nav
        className="navbar navbar-expand-lg navbar-light fixed-top py-3"
        id="mainNav"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 1030,
          backgroundColor: "white",
          boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="container px-4 px-lg-5">
          <a className="navbar-brand" href="#page-top">
            Hikari Restaurant
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarResponsive"
            aria-controls="navbarResponsive"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="collapse navbar-collapse justify-content-center"
            id="navbarResponsive"
          >
            <ul className="navbar-nav mx-auto my-2 my-lg-0">
              <li className="nav-item">
                <a className="nav-link" href="#about">
                  About
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#menu">
                  Menu
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#contact">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/login")}
            >
              Đăng Nhập
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => navigate("/resigter")}
            >
              Đăng Kí
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};
export default NavbarUser;
