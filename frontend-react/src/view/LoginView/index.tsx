import { useLogin } from '../../hooks/auth/useLogin';
import styles from './LoginView.module.css';

const LoginView = () => {

  const { register, handleSubmit, onSubmit, errors } = useLogin();

  return (
    <div className={styles.authWrapper}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.loginCard}>
        <h1>Bienvenido de nuevo</h1>
        
        {/* Campo de Email */}
        <input {...register('email')} placeholder="Email" />
        {errors.email && <span className={styles.errorText}>{errors.email.message}</span>}

        {/* Campo de Password */}
        <input type="password" {...register('password')} placeholder="Contraseña" />
        {errors.password && <span className={styles.errorText}>{errors.password.message}</span>}
        
        {/* Error general del servidor (ej: 401 Unauthorized) */}
        {errors.root && <span className={styles.errorText} style={{ display: 'block', marginBottom: '1rem' }}>
          {errors.root.message}
        </span>}

        <button type="submit">Entrar al Sistema</button>
      </form>
    </div>
  );
};

export default LoginView;