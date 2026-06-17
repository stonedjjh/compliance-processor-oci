import Register from "../../components/Register/Register";
import usePageMetadata from "../../hooks/usePageMetadata";
import styles from "./RegisterView.module.css";

const RegisterView = () => {
  usePageMetadata({
    title: "Compliance Processor | Registro",
    description:
      "Crea una cuenta para comenzar a gestionar documentos y cumplir con tus políticas de auditoría.",
    keywords: "registro, crear cuenta, cumplimiento, gestión documental",
  });

  return (
    <div className={styles.authWrapper}>
      <Register />
    </div>
  );
};

export default RegisterView;
