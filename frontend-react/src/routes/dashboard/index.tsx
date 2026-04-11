
import FormUser from "../../view/FormUser";
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
        element: <FormUser />,
      },
    ],
  },
];



export default routerDashboard;
