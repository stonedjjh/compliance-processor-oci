import React from "react";
import { Link } from "react-router";
import styles from "./Error404.module.css";

const Error404: React.FC = () => (
  <div className={styles.divContainer}>
    <h1 className={`${styles.redColor} ${styles.title}`}>404</h1>
    <h2 className={styles.subtitle}>Página no encontrada</h2>
    <p>La página que buscas no existe o ha sido movida.</p>
    <Link className={styles.link} to="/">
      Volver al inicio
    </Link>
  </div>
);

export default Error404;
