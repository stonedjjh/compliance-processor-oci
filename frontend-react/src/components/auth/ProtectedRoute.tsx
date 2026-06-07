import { Navigate, Outlet } from "react-router";

const ProtectedRoute = () => {
  const user = localStorage.getItem("user");

  if (!user) {
    // Si no hay información de usuario, lo mandamos al login
    return <Navigate to="/auth/login" replace />;
  }

  // Si hay usuario (y la cookie segura se maneja sola), permitimos que vea la ruta
  return <Outlet />;
};

export default ProtectedRoute;
