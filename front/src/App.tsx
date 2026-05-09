import { BrowserRouter as Router, useLocation } from "react-router-dom";
import Header from "./components/header/Header";
import AppRouter from "./routes/AppRouter";
import Footer from "./components/footer/Footer";
import { FaWhatsapp } from "react-icons/fa";

import styles from "./app.module.scss";

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login";

  return (
    <>
      {!isAuthPage && <Header />}
      <main>
        <AppRouter />
        {!isAuthPage && (
          <a
            href="https://wa.me/51999999999"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsapp}
          >
            <FaWhatsapp/>
          </a>
        )}
      </main>
      {!isAuthPage && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
