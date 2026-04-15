import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/header/Header';
import AppRouter from './routes/AppRouter';
import Footer from './components/footer/Footer';

function App() {
  return (
    <Router>
      <Header />
      <main>
        <AppRouter />
      </main>
        <Footer/>
    </Router>
  );
}

export default App;