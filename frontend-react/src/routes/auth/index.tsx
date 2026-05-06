import LoginView from "../../view/LoginView";
import RegisterView from "../../view/RegisterView";

const routerAuth = [
  {
    path: "login",
    element: <LoginView />,
  },
  {
    path: "register",
    element: <RegisterView />,
  },
];

export default routerAuth;