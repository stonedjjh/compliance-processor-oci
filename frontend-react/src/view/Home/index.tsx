import styles from "./Home.module.css";

const Home = () => {
  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h1>Panel de Control de Cumplimiento</h1>
        <p><strong>Gestión centralizada de auditoría y procesamiento de activos.</strong></p>
      </header>

      <hr className={styles.separator} />

      <article className={styles.mainArticle}>
        <h2>Bienvenido al Sistema</h2>
        <p>
          Esta plataforma permite la carga, validación y seguimiento de documentos bajo 
          estándares de seguridad empresarial. El procesamiento se realiza en tiempo real 
          mediante una arquitectura distribuida y escalable.
        </p>
      </article>

      <div className={styles.grid}>
        <section className={styles.card}>
          <h3>Gestión de Documentos</h3>
          <p>Utilice el módulo de subida para procesar nuevos archivos. El procesador extraerá y validará la información automáticamente.</p>
        </section>

        <section className={styles.card}>
          <h3>Acceso y Registro</h3>
          <p>Gestione los perfiles de usuario y niveles de acceso para garantizar la trazabilidad de cada operación en el sistema.</p>
        </section>
      </div>

      <footer className={styles.footer}>
        <p>Estado de la infraestructura: Operacional | Arquitectura: ARM64/x86_64 | v1.0.1-deploy-test</p>
      </footer>
    </section>
  );
};

export default Home;