import { useAuth } from "../context/AuthContext";
import UserPanel from "../components/UserPanel/UserPanel";
import SalesPanel from "../components/SalesPanel/SalesPanel";
import AdminTiPanel from "../components/AdminTiPanel/AdminTiPanel";

const PanelRouter = () => {
  const { user } = useAuth();
  if (user?.role === "SALES") return <SalesPanel />;
  if (user?.role === "TI" || user?.role === "ADMIN") return <AdminTiPanel />;
  return <UserPanel />;
};

export default PanelRouter;
