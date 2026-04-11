import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "../view/Home";
import Error404 from "../view/Error404";


import routerDashboard from "./dashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    //ruta para error 404
    errorElement: <Error404 />,
  },
  ...routerDashboard,
]);

const MyRoutes = () => <RouterProvider router={router} />;

export default MyRoutes;
