import SidebarAdmin from "../sidebarAdmin";

const LayoutAdmin = ({ Page }) => {
  return (
    <div className="flex flex-col h-screen bg-[#E3D9C7]">
      <div className="flex flex-1 mt-16" style={{ display: "flex" }}>
        {/* Sidebar sẽ được đặt cố định */}
        <div
          className="fixed top-16 left-0 w-64 h-full bg-[#f9f9f9] z-40"
          style={{
            position: "absolute", // Sử dụng position absolute để không ảnh hưởng đến Layout page
          }}
        >
          <SidebarAdmin />
        </div>

        {/* Nội dung chính: Kích thước page cố định */}
        <div
          className="flex-1 bg-site bg-no-repeat bg-cover overflow-auto p-4"
          style={{ marginLeft: "64px", width: "calc(100% - 64px)" }}
        >
          <Page />
        </div>
      </div>
    </div>
  );
};

export default LayoutAdmin;
