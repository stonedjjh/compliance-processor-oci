import { Link, useNavigate } from "react-router";
import styles from "./Navbar.module.css";

export const NavBar = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate("/auth/login", { replace: true });
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>Compliance App</div>
      <div className={styles.menu}>
        <Link to="/" className={styles.link}>Inicio</Link>
        
        {isAuthenticated && (
          <Link to="/dashboard/upload" className={styles.link}>Subir Archivo</Link>
        )}

        {isAuthenticated ? (
          <button onClick={handleLogout} className={styles.link} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            Cerrar Sesión
          </button>
        ) : (
          <Link to="/auth/register" className={styles.link}>Registrarse</Link>
        )}
      </div>
    </nav>
  );
};