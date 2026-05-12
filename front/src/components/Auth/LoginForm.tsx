import React, { useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import styles from './Auth.module.scss';
import { validateEmail } from '../../utils/validators';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

interface LoginFormProps {
  onSwitchMode: (mode: 'login' | 'register' | 'forgot_password') => void;
  onSuccess: (message: string, title?: string, onClose?: () => void) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchMode, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Por favor, ingresa un correo válido.');
      return;
    }

    if (!executeRecaptcha) {
      setError('ReCAPTCHA no está listo. Por favor, intenta de nuevo en unos segundos.');
      return;
    }

    const captchaToken = await executeRecaptcha('login');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, captchaToken })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Credenciales inválidas');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      onSuccess("Has iniciado sesión exitosamente. ¡Bienvenido a American Certification Service!", "¡Bienvenido!", () => { window.location.href = '/panel'; });
    } catch (err) {
      setError('Error de red. Por favor intenta más tarde.');
    }
  };

  return (
    <div className={styles.authFormContainer}>
      <div className={styles.formHeader}>
      </div>

      <div className={styles.titles}>
        <h2>Hola de nuevo</h2>
        <p>Bienvenido a American Certification Service</p>
      </div>

      <div className={styles.formContent}>
        <form onSubmit={handleSubmit}>
          <div className={`${styles.formGroup} ${styles.animatedGroup}`}>
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={`${styles.formGroup} ${styles.animatedGroup}`}>
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className={`${styles.forgotPassword} ${styles.animatedGroup}`}>
            <button type="button" onClick={() => onSwitchMode('forgot_password')}>¿Olvidaste tu contraseña?</button>
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <div className={`${styles.divider} ${styles.animatedGroup}`}>o</div>

          <button type="button" className={`${styles.googleBtn} ${styles.animatedGroup}`}>
            Iniciar sesión con Google <FcGoogle size={20} />
          </button>

          <div className={`${styles.captchaDisclaimer} ${styles.animatedGroup}`}>
            Protegido por reCAPTCHA invisible. Aplican la{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacidad</a> y{' '}
            <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Términos</a> de Google.
          </div>

          <button type="submit" className={`${styles.submitBtn} ${styles.animatedGroup}`}>
            Login
          </button>
        </form>

        <div className={styles.switchMode}>
          ¿No tienes una cuenta? 
          <button type="button" onClick={() => onSwitchMode('register')}>Regístrate</button>
        </div>

        <div className={styles.socialFooter}>
          <a href="#"><FaFacebook /></a>
          <a href="#"><FaTwitter /></a>
          <a href="#"><FaLinkedin /></a>
          <a href="#"><FaInstagram /></a>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
