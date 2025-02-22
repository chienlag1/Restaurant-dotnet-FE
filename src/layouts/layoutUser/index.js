import NavbarUser from "../navbarUser";

const LayoutUser = ({ Page }) => {
  return (
    <div>
      <div>
        <NavbarUser />
      </div>
      <div>
        <Page />
      </div>
    </div>
  );
};

export default LayoutUser;
