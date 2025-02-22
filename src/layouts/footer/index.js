import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaClock,
  FaFacebookF,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";

const Footer = () => {
  return (
    <div
      id="contact"
      className="footer w-100"
      style={{
        width: "100vw",
        backgroundColor: "#111",
        color: "white",
        padding: "40px 0",
        marginTop: "40px",
      }}
    >
      <div className="container text-center text-md-start">
        <div className="row justify-content-center">
          {/* Địa chỉ */}
          <div className="col-md-3 col-6 mb-3">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start">
              <FaMapMarkerAlt size={20} color="red" className="me-2" />
              <h6 style={{ fontWeight: "bold", marginBottom: 0 }}>Address</h6>
            </div>
            <p className="mb-0">123 Đường ABC</p>
            <p>Quận XYZ, TP HCM</p>
          </div>

          {/* Liên hệ */}
          <div className="col-md-3 col-6 mb-3">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start">
              <FaPhoneAlt size={20} color="red" className="me-2" />
              <h6 style={{ fontWeight: "bold", marginBottom: 0 }}>Contact</h6>
            </div>
            <p className="mb-0">Phone: 0987 654 321</p>
            <p>Email: info@hikari.com</p>
          </div>

          {/* Giờ mở cửa */}
          <div className="col-md-3 col-6 mb-3">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start">
              <FaClock size={20} color="red" className="me-2" />
              <h6 style={{ fontWeight: "bold", marginBottom: 0 }}>
                Opening Hours
              </h6>
            </div>
            <p className="mb-0">
              <strong>Mon-Sat:</strong> 10:00 AM - 10:00 PM
            </p>
            <p>
              <strong>Sunday:</strong> Closed
            </p>
          </div>

          {/* Mạng xã hội */}
          <div className="col-md-3 col-6 mb-3 text-center text-md-start">
            <h6 style={{ fontWeight: "bold", marginBottom: 0 }}>Follow Us</h6>
            <div className="d-flex justify-content-center justify-content-md-start mt-2">
              <a href="/" className="social-icon me-2 text-light">
                <FaFacebookF size={18} />
              </a>
              <a href="/" className="social-icon me-2 text-light">
                <FaInstagram size={18} />
              </a>
              <a href="/" className="social-icon me-2 text-light">
                <FaLinkedin size={18} />
              </a>
            </div>
          </div>
        </div>

        <hr style={{ backgroundColor: "white", margin: "20px 0" }} />

        <p
          className="text-center"
          style={{ fontSize: "14px", marginBottom: 0 }}
        >
          © 2025 Hikari Restaurant. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
