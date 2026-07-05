import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { initSentry } from './lib/sentry';
import './styles/main.scss';

initSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}>
      <App />
    </GoogleReCaptchaProvider>
  </React.StrictMode>
);
