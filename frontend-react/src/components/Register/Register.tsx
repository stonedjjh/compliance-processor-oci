import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { registerSchema } from '../../utils/validation/register.schema';
import { registerUserAdapter } from '../../api/adapters/auth.adapter';
import styles from './Register.module.css';

const Register = () => {
 const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: yupResolver(registerSchema)
 });

 const onSubmit = async (data: any) => {
  // Aplicamos el adapter antes de enviar al BFF
  const adaptedData = registerUserAdapter(data);
  console.log('Enviando DTO limpio:', adaptedData);
  
  // Aquí vendría la llamada al servicio que integraremos en el punto 4
 };

 return (
  <div className={styles.container}>
   <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
    <h2>Crear Cuenta</h2>
    
    <input {...register('fullName')} placeholder="Nombre Completo" />
    <p className={styles.errorText}>{errors.fullName?.message}</p>

    <input {...register('email')} placeholder="Correo Electrónico" />
    <p className={styles.errorText}>{errors.email?.message}</p>

    <input type="password" {...register('password')} placeholder="Contraseña" />
    <p className={styles.errorText}>{errors.password?.message}</p>

    <input type="password" {...register('confirmPassword')} placeholder="Confirmar Contraseña" />
    <p className={styles.errorText}>{errors.confirmPassword?.message}</p>

    <button type="submit">Registrar</button>
   </form>
  </div>
 );
};

export default Register;