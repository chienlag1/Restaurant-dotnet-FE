import { useMemo } from "react";
import Footer from "../layouts/footer";
import MenuList from "../components/productCard/MenuList";
import ChatbaseWidget from "../pages/chatbase";
const HomePage = () => {
  const styles = useMemo(
    () => ({
      overlay: {
        width: "100vw",
        position: "absolute",
        top: 0,
        left: 0,
        height: "100%",
        backgroundImage: `url("https://ipos.vn/wp-content/uploads/2019/08/thiet-ke-nha-hang-5.jpg")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "brightness(50%)",
        zIndex: -1,
      },
    }),
    []
  );

  return (
    <div>
      {/* Background */}
      <div className="relative w-screen h-screen flex flex-col items-center justify-center text-white text-center">
        <div style={styles.overlay}></div>
        <h1 className="text-4xl font-bold mb-3">
          Chào mừng đến với nhà hàng của chúng tôi
        </h1>
        <h3 className="text-2xl mb-5">
          Hương Vị Hoàn Hảo, Trải Nghiệm Đẳng Cấp
        </h3>
      </div>

      {/* About Us */}
      <div id="about" className="container mx-auto my-10 px-6">
        <h2 className="text-center text-3xl font-semibold mb-8">About Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <img
              src="https://www.vietfuntravel.com.vn/image/data/Ha-Noi/am-thuc-ha-noi/tat-ca-nha-hang-co-khong-gian-dep-ha-noi-1.jpg"
              alt="Không gian nhà hàng"
              className="w-full rounded-lg shadow-lg"
            />
          </div>
          <div>
            <p className="mb-4">
              Tại <strong>[Tên Nhà Hàng]</strong>, chúng tôi không chỉ phục vụ
              món ăn mà còn mang đến cho bạn một trải nghiệm ẩm thực tinh tế,
              nơi hội tụ giữa
              <span className="font-semibold"> hương vị truyền thống </span> và
              <span className="font-semibold"> phong cách hiện đại</span>.
            </p>
            <ul className="space-y-3">
              <li>
                🍷 <strong>Không Gian:</strong> Sang trọng, ấm cúng, phù hợp cho
                gia đình, bạn bè và sự kiện.
              </li>
              <li>
                🍽 <strong>Thực Đơn:</strong> Đa dạng, kết hợp giữa món Việt và
                ẩm thực quốc tế.
              </li>
              <li>
                🌿 <strong>Nguyên Liệu:</strong> Tươi sạch, được tuyển chọn kỹ
                lưỡng mỗi ngày.
              </li>
              <li>
                👨‍🍳 <strong>Đội Ngũ Đầu Bếp:</strong> Chuyên nghiệp, đam mê,
                không ngừng sáng tạo.
              </li>
              <li>
                ✨ <strong>Dịch Vụ:</strong> Tận tâm, chu đáo, mang đến sự hài
                lòng tuyệt đối.
              </li>
            </ul>
            <p className="mt-4">
              Hãy đến với <strong>[Tên Nhà Hàng]</strong> để tận hưởng những món
              ăn tuyệt vời và không gian lý tưởng!
            </p>
            <p className="mt-2">
              📍 <strong>Địa chỉ:</strong> [Thêm địa chỉ]
            </p>
            <p>
              📞 <strong>Hotline:</strong> [Thêm số điện thoại]
            </p>
          </div>
        </div>
      </div>

      {/* Danh sách món ăn */}
      <div id="menu" className="container mx-auto my-10 px-6">
        <h2 className="text-center text-3xl font-semibold mb-8">
          Thực Đơn Của Chúng Tôi
        </h2>
        <MenuList />
      </div>
      <ChatbaseWidget />
      <Footer />
    </div>
  );
};

export default HomePage;
