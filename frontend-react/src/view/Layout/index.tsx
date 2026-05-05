import { Outlet } from "react-router";
import { NavBar } from "../../components/Navbar/NavBar";
import styles from "./Layout.module.css"; // Importación del estilo

const Layout = () => {
  return (
    <>
      <NavBar />
      <main className={styles["content-container"]}>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;