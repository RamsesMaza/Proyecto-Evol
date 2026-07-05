import { useAuth } from "../context/AuthContext";
import UserPanel from "../components/UserPanel/UserPanel";
import SalesPanel from "../components/SalesPanel/SalesPanel";
import AdminTiPanel from "../components/AdminTiPanel/AdminTiPanel";
import AdminPanel from "../components/AdminPanel/AdminPanel";
import MarketingPanel from "../components/MarketingPanel/MarketingPanel";
import AuditorPanel from "../components/AuditorPanel/AuditorPanel";

const PanelRouter = () => {
  const { user } = useAuth();
  if (user?.role === "SALES") return <SalesPanel />;
  if (user?.role === "TI") return <AdminTiPanel />;
  if (user?.role === "ADMIN") return <AdminPanel />;
  if (user?.role === "MARKETING") return <MarketingPanel />;
  if (user?.role === "AUDITOR") return <AuditorPanel />;
  return <UserPanel />;
};

export default PanelRouter;
