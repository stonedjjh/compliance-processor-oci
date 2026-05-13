import { createBrowserRouter, RouterProvider } from "react-router";
import PublicLayout from "../view/layouts/PublicLayout";
import DashboardLayout from "../view/layouts/DashboardLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";

// Vistas
import Home from "../view/Home";
import Error404 from "../view/Error404";
import routerAuth from "./auth";
import routerDashboard from "./dashboard";

export const router = createBrowserRouter([
  {
    /* SECCIÓN PÚBLICA */
    path: "/",
    element: (
      <PublicLayout>
        <PublicLayout.Header />
        <PublicLayout.Main />
        <PublicLayout.Footer />
      </PublicLayout>
    ),
    errorElement: <Error404 />,
    children: [
      { index: true, element: <Home /> },
      { path: "auth", children: routerAuth },
    ],
  },
  {
    /* SECCIÓN PRIVADA */
    element: <ProtectedRoute />,
    children: [
      {
        element: (
          <DashboardLayout>
            <DashboardLayout.Sidebar />
            <DashboardLayout.Main />
          </DashboardLayout>
        ),
        children: routerDashboard,
      },
    ],
  },
]);

const MyRoutes = () => <RouterProvider router={router} />;
export default MyRoutes;
