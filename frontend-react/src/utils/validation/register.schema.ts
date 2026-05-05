import * as Yup from 'yup';

export const registerSchema = Yup.object().shape({
 fullName: Yup.string()
  .required('El nombre completo es obligatorio')
  .min(3, 'Mínimo 3 caracteres'),
 email: Yup.string()
  .email('Email inválido')
  .required('El correo es obligatorio'),
 password: Yup.string()
  .required('Contraseña obligatoria')
  .min(8, 'Mínimo 8 caracteres')
  .matches(/[0-9]/, 'Debe incluir al menos un número'),
 confirmPassword: Yup.string()
  .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
  .required('Debes confirmar tu contraseña')
});