import { useState } from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import Header from "./components/header/Header";
import AppRouter from "./routes/AppRouter";
import Footer from "./components/footer/Footer";
import { FaWhatsapp, FaShoppingCart } from "react-icons/fa";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import CartDrawer from "./components/CartDrawer/CartDrawer";

import styles from "./app.module.scss";

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname.startsWith("/panel");
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      {!isAuthPage && <Header />}
      <main>
        <AppRouter />
        {!isAuthPage && (
          <>
            <a
              href="https://wa.me/51999999999"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsapp}
            >
              <FaWhatsapp />
            </a>
            <button
              onClick={() => setCartOpen(true)}
              style={{
                position: "fixed", bottom: 100, right: 25, zIndex: 99999,
                width: 62, height: 62, borderRadius: "50%",
                background: "#111", color: "#fff", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, cursor: "pointer", boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                transition: "all 0.3s",
              }}
            >
              <FaShoppingCart />
            </button>
            <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
          </>
        )}
      </main>
      {!isAuthPage && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
