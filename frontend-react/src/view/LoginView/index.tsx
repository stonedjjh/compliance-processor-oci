import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '../../utils/validation/login.schema';
import styles from './LoginView.module.css';

const LoginView = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema)
  });

  const onSubmit = (data: any) => {
    // Aquí es donde el punto 3 de la ruta (JWT) entrará en acción
    console.log("Intentando entrar con:", data);
  };

  return (
    <div className={styles.authWrapper}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.loginCard}>
        <h1>Bienvenido de nuevo</h1>
        <input {...register('email')} placeholder="Email" />
        {errors.email && <span className={styles.errorText}>{errors.email.message}</span>}

        <input type="password" {...register('password')} placeholder="Contraseña" />
        {errors.password && <span className={styles.errorText}>{errors.password.message}</span>}
        <button type="submit">Entrar al Sistema</button>
      </form>
    </div>
  );
};

export default LoginView;