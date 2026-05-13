import { Navigate } from "react-router";
import ManagementDocument from "../../view/ManagementDocument";

const routerDashboard = [
  {
    path: "/dashboard",
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard/upload" replace />,
      },
      {
        path: "upload",
        element: <ManagementDocument />,
      },
    ],
  },
];

export default routerDashboard;
