import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "../view/Home";
import Error404 from "../view/Error404";
import LoginView from "../view/LoginView";
import RegisterView from "../view/RegisterView"; // Tu vista de registro
import routerDashboard from "./dashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <Error404 />,
  },
  {
    path: "/auth",
    children: [
      { path: "login", element: <LoginView /> },
      { path: "register", element: <RegisterView /> },
    ],
  },
  // Las rutas del dashboard se mantienen separadas
  ...routerDashboard,
]);

const MyRoutes = () => <RouterProvider router={router} />;
export default MyRoutes;