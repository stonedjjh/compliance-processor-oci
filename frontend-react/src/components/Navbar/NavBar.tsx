import { Link } from "react-router";
import styles from "./Navbar.module.css";

export const NavBar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>Compliance App</div>
      <div className={styles.menu}>
        <Link to="/" className={styles.link}>
          Inicio
        </Link>
        <Link to="/dashboard/upload" className={styles.link}>
          Subir Archivo
        </Link>
        <Link to="/dashboard/register" className={styles.link}>
          Registrarse
        </Link>
      </div>
    </nav>
  );
};
