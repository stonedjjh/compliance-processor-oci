import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { registerSchema } from '../../utils/validation/register.schema';
import { registerUserAdapter } from '../../api/adapters/auth.adapter';
import styles from './Register.module.css';
import { authService } from '../../services/auth.service'

const Register = () => {
 const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: yupResolver(registerSchema)
 });

const onSubmit = async (data: any) => {
  // Log para verificar qué sale del formulario
  //console.log('Datos capturados del form:', data);

  try {   
   const adaptedData = registerUserAdapter(data);
   //console.log('Enviando DTO adaptado:', adaptedData);
   
   await authService.register(adaptedData);
      
   //console.log('Respuesta del servidor:', response);
   alert('¡Registro exitoso! Ahora puedes iniciar sesión.');

   // Aquí podrías usar un navigate('/login') si usas react-router
  } catch (error: any) {   
   console.error('Error en el proceso de registro:', error);
   alert(`Error al registrar: ${error.message}`);
  }
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