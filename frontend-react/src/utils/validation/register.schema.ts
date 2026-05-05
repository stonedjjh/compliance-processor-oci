import * as Yup from 'yup';

// Expresión regular para validar:
// 1. Al menos una mayúscula (?=.*[A-Z])
// 2. Al menos una minúscula (?=.*[a-z])
// 3. Al menos un número (?=.*[0-9])
// 4. Al menos un carácter especial (?=.*[!@#$%^&*])
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;

export const registerSchema = Yup.object().shape({
 fullName: Yup.string()
  .required('El nombre completo es obligatorio')
  .min(3, 'Mínimo 3 caracteres'),
 email: Yup.string()
  .email('Email inválido')
  .required('El correo es obligatorio'),
 password: Yup.string()
  .required('La contraseña es obligatoria')
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .matches(
   passwordRegex,
   'Debe incluir mayúscula, minúscula, número y carácter especial (!@#$%^&*)'
  ),
 confirmPassword: Yup.string()
  .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
  .required('Debes confirmar tu contraseña')
});

