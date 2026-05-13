import React, { type ReactNode } from "react";
import { Outlet, Link } from "react-router";
import { NavBar } from "../../components/Navbar/NavBar";
import styles from "./DashboardLayout.module.css";

interface DashboardLayoutProps {
  children?: ReactNode;
}

// 1. Sub-componentes internos del Dashboard
const DashboardSidebar: React.FC = () => (
  <aside className={styles.sidebar}>
    <nav>
      <ul className={styles.sideList}>
        <li className={styles.sideItem}>
          <Link
            to="/dashboard"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            Panel Principal
          </Link>
        </li>
        <li className={styles.sideItemActive}>
          <Link
            to="/dashboard/upload"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            Subir Documentos
          </Link>
        </li>
        <li className={styles.sideItem}>Historial de Auditoría</li>
        <hr className={styles.divider} />
        <li className={styles.sideItem}>Configuración</li>
      </ul>
    </nav>
  </aside>
);

const DashboardMain: React.FC<DashboardLayoutProps> = ({ children }) => (
  <main className={styles.content}>{children || <Outlet />}</main>
);

// 2. Componente principal del Dashboard
const DashboardLayout: React.FC<DashboardLayoutProps> & {
  Sidebar: React.FC;
  Main: React.FC<DashboardLayoutProps>;
} = ({ children }) => {
  return (
    <div className={styles.appWrapper}>
      {/* Pasamos una prop hipotética 'isInternal' si quieres que la NavBar cambie algo dentro */}
      <NavBar />
      <div className={styles.container}>{children}</div>
    </div>
  );
};

// 3. Asignación al namespace
DashboardLayout.Sidebar = DashboardSidebar;
DashboardLayout.Main = DashboardMain;

export default DashboardLayout;
