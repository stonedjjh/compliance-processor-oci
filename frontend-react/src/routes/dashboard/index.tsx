
import RegisterView from "../../view/RegisterView";
import Layout from "../../view/Layout";
import ManagementDocument from "../../view/ManagementDocument";

const routerDashboard = [  
  {
    path: "/dashboard",
    element: <Layout />,
    children: [
      {
        path: "upload",
        element: <ManagementDocument />,
      },
      {
        path: "register",
        element: <RegisterView />,
      },
    ],
  },
];



export default routerDashboard;
