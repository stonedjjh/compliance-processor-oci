import { Navigate, Outlet } from 'react-router';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Si no hay token, lo mandamos al login
    return <Navigate to="/auth/login" replace />;
  }

  // Si hay token, permitimos que vea la ruta (el contenido de la ruta hija)
  return <Outlet />;
};

export default ProtectedRoute;