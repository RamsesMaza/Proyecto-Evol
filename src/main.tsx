import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import './styles/main.scss'; 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeJ1NwsAAAAAJsS_yFH2OvdQXtmL-eewfKIoRLp"}>
      <App />
    </GoogleReCaptchaProvider>
  </React.StrictMode>
);