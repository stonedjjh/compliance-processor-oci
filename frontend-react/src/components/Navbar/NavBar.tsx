import { Link, useNavigate, useLocation } from "react-router";
import styles from "./Navbar.module.css";

export const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>Compliance App</div>
      <div className={styles.menu}>
        {!isAuthenticated && location.pathname !== "/" && (
          <Link to="/" className={styles.link}>
            Inicio
          </Link>
        )}

        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className={styles.link}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            Cerrar Sesión
          </button>
        ) : (
          <>
            {location.pathname !== "/auth/login" && (
              <Link to="/auth/login" className={styles.link}>
                Iniciar Sesión
              </Link>
            )}
            {location.pathname !== "/auth/register" && (
              <Link to="/auth/register" className={styles.link}>
                Registrarse
              </Link>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
