import type { UserRegisterDTO, UserResponse } from '../../types/auth.types';

export const registerUserAdapter = (formData: any): UserRegisterDTO => {
 return {
  full_name: formData.fullName,
  email: formData.email.toLowerCase(),
  password: formData.password
 };
};

export const authUserResponseAdapter = (apiResponse: any): UserResponse => {
 return {
  id: apiResponse.uuid || apiResponse.id,
  username: apiResponse.email,
  token: apiResponse.access_token,
  role: apiResponse.role || 'user'
 };
};

export const loginUserAdapter = (formData: any) => ({
  username: formData.email, // El API a veces pide 'username' en lugar de 'email'
  password: formData.password
});