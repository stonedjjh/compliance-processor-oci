import React, { type ReactNode } from "react";
import { Outlet } from "react-router";
import { NavBar } from "../../components/Navbar/NavBar";
import styles from "./PublicLayout.module.css";

// Definimos la interfaz para los componentes que aceptan hijos
interface LayoutProps {
  children?: ReactNode;
}

// 1. Sub-componentes con tipado
const PublicHeader: React.FC = () => (
  <header className={styles.header}>
    <NavBar />
  </header>
);

const PublicMain: React.FC<LayoutProps> = ({ children }) => (
  <main className={styles.mainContent}>{children || <Outlet />}</main>
);

const PublicFooter: React.FC = () => (
  <footer className={styles.footer}>
    <p>© 2026 Compliance App - Arquitectura de Alto Rendimiento Distribuida</p>
  </footer>
);

// 2. Componente principal
const PublicLayout: React.FC<LayoutProps> & {
  Header: React.FC;
  Main: React.FC<LayoutProps>;
  Footer: React.FC;
} = ({ children }) => {
  return <div className={styles.wrapper}>{children}</div>;
};

// 3. Asignación al namespace (TS ahora sabe qué componentes cuelgan de aquí)
PublicLayout.Header = PublicHeader;
PublicLayout.Main = PublicMain;
PublicLayout.Footer = PublicFooter;

export default PublicLayout;
