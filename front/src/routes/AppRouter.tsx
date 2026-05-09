import { Routes, Route } from 'react-router-dom';

import Home from '../pages/Home';
import Nosotros from '../pages/Nosotros';
import Solicitudes from '../pages/Solicitudes';
import Servicios from '../pages/Servicios';
import Contacto from '../pages/Contacto';
import Blog from '../pages/Blog';
import VerifyCertificate from '../pages/VerifyCertificate';
import Auth from '../pages/Auth';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/nosotros" element={<Nosotros />} />
      <Route path="/solicitudes/*" element={<Solicitudes />} />
      <Route path="/servicios" element={<Servicios />} />
      <Route path="/blog" element={<Blog/>} />
      <Route path="/contacto" element={<Contacto />} />
      <Route path="/verifica-tu-certificado" element={<VerifyCertificate/>}/>
      <Route path="/login" element={<Auth />} />
      <Route path="*" element={<div style={{padding: "100px"}}>404 - No encontrado</div>} />
    </Routes>
  );
};

export default AppRouter;