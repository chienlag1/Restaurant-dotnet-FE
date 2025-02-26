import SidebarAdmin from "../sidebarAdmin";

const LayoutAdmin = ({ Page }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <SidebarAdmin />

      {/* Content */}
      <div className="flex-1 ml-64 p-6">
        <Page />
      </div>
    </div>
  );
};

export default LayoutAdmin;
