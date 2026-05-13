import { useLogin } from "../../hooks/auth/useLogin";
import Card from "../../components/ui/Card/Card";
import Input from "../../components/ui/Input/Input";
import Button from "../../components/ui/Button/Button";
import styles from "./LoginView.module.css";

const LoginView = () => {
  const { register, handleSubmit, onSubmit, errors } = useLogin();

  return (
    <div className={styles.authWrapper}>
      <Card className={styles.loginCard} isHoverable={false}>
        <Card.Header
          title="Bienvenido de nuevo"
          subtitle="Ingrese sus credenciales para acceder al sistema"
          align="center"
        />

        <Card.Body>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            {/* El componente Input gestiona el label y el error internamente */}
            <Input
              label="Correo Electrónico"
              placeholder="Email"
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="Contraseña"
              error={errors.password?.message}
              {...register("password")}
            />

            {/* Manejo de errores globales del servidor */}
            {errors.root && (
              <div className={styles.globalError}>{errors.root.message}</div>
            )}

            <Button
              type="submit"
              variant="primary"
              className={styles.submitBtn}
            >
              Entrar al Sistema
            </Button>
          </form>
        </Card.Body>

        <Card.Footer>
          <div className={styles.footerLinks}>
            <span>¿No tiene cuenta?</span>
            <a href="/auth/register">Regístrese aquí</a>
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default LoginView;
