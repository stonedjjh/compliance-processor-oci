import Register from "../../components/Register/Register";
import styles from "./RegisterView.module.css";

const RegisterView = () => {
  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1>Sistema de Cumplimiento</h1>
        <p>Registro de nuevos analistas</p>
      </header>
      <main className={styles.content}>
        <Register />
      </main>
    </div>
  );
};

export default RegisterView;