import SidebarStaff from "../sidebarStaff";

const LayoutStaff = ({ Page }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <SidebarStaff />

      {/* Content */}
      <div className="flex-1 ml-64 p-6">
        <Page />
      </div>
    </div>
  );
};

export default LayoutStaff;
