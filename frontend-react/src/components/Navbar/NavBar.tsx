import { Link } from 'react-router';
import styles from './Navbar.module.css';

export const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>Compliance App</div>
      <div className={styles.menu}>
        <Link to="/" className={styles.link}>Inicio</Link>
        <Link to="/upload" className={styles.link}>Subir Archivo</Link>
      </div>
    </nav>
  );
};