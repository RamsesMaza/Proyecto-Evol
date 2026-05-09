import { Routes, Route } from 'react-router-dom';

import SolicitudesLanding from '../components/Solicitudes/SolicitudesLanding/SolicitudesLanding';
import SolicitarServicios from '../components/Solicitudes/SolicitarServicios/SolicitarServicios';
import TransferenciaCertificacion from '../components/Solicitudes/TransferenciaCertificacion/TransferenciaCertificacion';
import OtrasAuditorias from '../components/Solicitudes/OtrasAuditorias/OtrasAuditorias';

export default function Solicitudes() {
  return (
    <Routes>
      <Route index element={<SolicitudesLanding />} />
      <Route path="servicios" element={<SolicitarServicios />} />
      <Route path="transferencia" element={<TransferenciaCertificacion />} />
      <Route path="auditorias" element={<OtrasAuditorias />} />
    </Routes>
  );
}
