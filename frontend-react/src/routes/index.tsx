import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "../view/Home";
import Error404 from "../view/Error404";
import ProtectedRoute from "../components/Auth/ProtectedRoute";
import routerAuth from "./auth"; 
import routerDashboard from "./dashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <Error404 />,
  },
  {
    path: "/auth",
    children: routerAuth, // Ahora vienen de su propio archivo
  },
  {
    /* Las rutas del dashboard ahora son "hijas" del protector */
    element: <ProtectedRoute />, 
    children: routerDashboard, // Eliminamos el spread (...) para pasarlas como grupo
  },
]);

const MyRoutes = () => <RouterProvider router={router} />;
export default MyRoutes;