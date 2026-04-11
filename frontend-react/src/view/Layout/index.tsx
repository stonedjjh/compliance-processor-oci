import { Outlet } from "react-router";
import { NavBar } from "../../components/Navbar/NavBar";

const Layout = () => {
  return (
    <>
      <NavBar />
      {/* crear modulo y agregar estilo */}
      <main className="content-container">
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
