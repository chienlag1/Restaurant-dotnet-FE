import { useMemo } from "react";

import Footer from "../layouts/footer";

const HomePage = () => {
  const styles = useMemo(
    () => ({
      container: {
        position: "relative",
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        textAlign: "center",
        flexDirection: "column",
      },
      overlay: {
        width: "100vw",
        position: "absolute",
        top: 0,
        left: 0,

        height: "100%",
        backgroundImage: `url("https://media.cooky.vn/images/blog-2016/nghe-thuat-trinh-bay-va-chup-anh-mon-an%202.jpg")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "brightness(50%)",
        zIndex: -1,
      },
      img: {
        width: "100%", // Ảnh full width trong cột
        borderRadius: "10px",
      },
    }),
    []
  );

  return (
    <div>
      {/* Phần Background */}
      <div className="container-fluid p-0" style={styles.container}>
        <div style={styles.overlay}></div>
        <h1 className="mb-3">Chào mừng đến với nhà hàng của chúng tôi</h1>
        <h3 className="mb-5">Hương Vị Hoàn Hảo, Trải Nghiệm Đẳng Cấp</h3>
      </div>

      {/* Phần About Us */}
      <div className="container my-5">
        <h2 className="text-center mb-4">About Us</h2>
        <div className="row align-items-center">
          <div className="col-md-6">
            <img
              src="https://www.vietfuntravel.com.vn/image/data/Ha-Noi/am-thuc-ha-noi/tat-ca-nha-hang-co-khong-gian-dep-ha-noi-1.jpg"
              alt="Không gian nhà hàng"
              style={styles.img}
            />
          </div>
          <div className="col-md-6">
            <p className="mb-3">
              Tại <strong>[Tên Nhà Hàng]</strong>, chúng tôi không chỉ phục vụ
              món ăn mà còn mang đến cho bạn một trải nghiệm ẩm thực tinh tế,
              nơi hội tụ giữa **hương vị truyền thống** và **phong cách hiện
              đại**.
            </p>
            <ul className="list-unstyled">
              <li>
                🍷 **Không Gian:** Sang trọng, ấm cúng, phù hợp cho gia đình,
                bạn bè và sự kiện.
              </li>
              <li>
                🍽 **Thực Đơn:** Đa dạng, kết hợp giữa món Việt và ẩm thực quốc
                tế.
              </li>
              <li>
                🌿 **Nguyên Liệu:** Tươi sạch, được tuyển chọn kỹ lưỡng mỗi
                ngày.
              </li>
              <li>
                👨‍🍳 **Đội Ngũ Đầu Bếp:** Chuyên nghiệp, đam mê, không ngừng sáng
                tạo.
              </li>
              <li>
                ✨ **Dịch Vụ:** Tận tâm, chu đáo, mang đến sự hài lòng tuyệt
                đối.
              </li>
            </ul>
            <p className="mt-3">
              Hãy đến với **[Tên Nhà Hàng]** để tận hưởng những món ăn tuyệt vời
              và không gian lý tưởng!
            </p>
            <p>
              📍 <strong>Địa chỉ:</strong> [Thêm địa chỉ]
            </p>
            <p>
              📞 <strong>Hotline:</strong> [Thêm số điện thoại]
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
