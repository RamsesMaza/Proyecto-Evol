import { BrowserRouter as Router } from "react-router-dom";
import Header from "./components/header/Header";
import AppRouter from "./routes/AppRouter";
import Footer from "./components/footer/Footer";
import { FaWhatsapp } from "react-icons/fa";

import styles from "./app.module.scss";

function App() {
  return (
    <Router>
      <Header />
      <main>
        <AppRouter />
        <a
          href="https://wa.me/51999999999"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.whatsapp}
        >
          <FaWhatsapp/>
        </a>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
