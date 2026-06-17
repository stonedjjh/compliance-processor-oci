import React from "react";
import { Link } from "react-router";
import usePageMetadata from "../../hooks/usePageMetadata";
import styles from "./Error404.module.css";

const Error404: React.FC = () => {
  usePageMetadata({
    title: "Compliance Processor | 404 No encontrado",
    description:
      "Página no encontrada. Verifica la URL o regresa al inicio de la plataforma de cumplimiento.",
    keywords: "404, no encontrado, error, página no encontrada",
  });

  return (
    <div className={styles.divContainer}>
      <h1 className={`${styles.redColor} ${styles.title}`}>404</h1>
      <h2 className={styles.subtitle}>Página no encontrada</h2>
      <p>La página que buscas no existe o ha sido movida.</p>
      <Link className={styles.link} to="/">
        Volver al inicio
      </Link>
    </div>
  );
};

export default Error404;
