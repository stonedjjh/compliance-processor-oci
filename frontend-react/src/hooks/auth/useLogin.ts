import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router";
import { loginSchema } from "../../utils/validation/login.schema";
import { authService } from "../../services/auth.service";

export const useLogin = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      // Llamamos al servicio que definiste
      await authService.login(data.email, data.password);

      // Redirigimos al dashboard (la sesión segura ya está en la cookie HttpOnly)
      navigate("/dashboard");
    } catch (error: any) {
      // Aquí manejamos el error visualmente en el formulario
      setError("root", {
        message: error.message,
      });
    }
  };

  return { register, handleSubmit, onSubmit, errors };
};
