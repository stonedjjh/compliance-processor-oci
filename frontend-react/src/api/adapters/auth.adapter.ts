import type { UserRegisterDTO, UserResponse, UserLoginDTO } from '../../types/auth.types';

export const registerUserAdapter = (formData: any): UserRegisterDTO => {
return {
    // Mapeo: de fullName (React) a full_name (Python)
    full_name: formData.fullName,
    
    // Limpieza: solo enviamos lo que el backend necesita
    email: formData.email.toLowerCase(),
    password: formData.password
  };
};

export const authUserResponseAdapter = (apiResponse: any): UserResponse => {
 return {
  // Soportamos tanto 'id' (Python) como 'uuid' por compatibilidad
  id: apiResponse.user?.id || apiResponse.id || apiResponse.uuid,
  email: apiResponse.user?.email || apiResponse.email,
  token: apiResponse.access_token,
  role: apiResponse.user?.role || apiResponse.role || 'analyst'
 };
};

export const loginUserAdapter = (formData: any): UserLoginDTO => ({
 // Mantenemos 'email' para que coincida con el esquema Pydantic de Python
 email: formData.email.toLowerCase(),
 password: formData.password
});