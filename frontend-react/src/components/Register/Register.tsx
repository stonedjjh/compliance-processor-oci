import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerSchema } from "../../utils/validation/register.schema";
import { registerUserAdapter } from "../../api/adapters/auth.adapter";
import { authService } from "../../services/auth.service";
import Card from "../ui/Card/Card";
import Input from "../ui/Input/Input";
import Button from "../ui/Button/Button";
import styles from "./Register.module.css";

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);

    try {
      const adaptedData = registerUserAdapter(data);
      await authService.register(adaptedData);

      alert("¡Registro exitoso! Serás redirigido para iniciar sesión.");
      navigate("/auth/login");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Ocurrió un error inesperado.";
      setError("root", { type: "manual", message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={styles.registerCard} isHoverable={false}>
      <Card.Header
        title="Crear una cuenta"
        subtitle="Complete el formulario para registrarse"
        align="center"
      />

      <Card.Body>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {errors.root && (
            <div className={styles.globalError}>{errors.root.message}</div>
          )}

          <Input
            label="Nombre Completo"
            error={errors.fullName?.message}
            disabled={isLoading}
            {...register("fullName")}
          />
          <Input
            label="Correo Electrónico"
            error={errors.email?.message}
            disabled={isLoading}
            {...register("email")}
          />
          <Input
            label="Contraseña"
            type="password"
            error={errors.password?.message}
            disabled={isLoading}
            {...register("password")}
          />
          <Input
            label="Confirmar Contraseña"
            type="password"
            error={errors.confirmPassword?.message}
            disabled={isLoading}
            {...register("confirmPassword")}
          />

          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? "Registrando..." : "Crear Cuenta"}
          </Button>
        </form>
      </Card.Body>

      <Card.Footer>
        <div className={styles.footerLinks}>
          <span>¿Ya tiene una cuenta?</span>
          <a href="/auth/login">Inicie sesión aquí</a>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default Register;
