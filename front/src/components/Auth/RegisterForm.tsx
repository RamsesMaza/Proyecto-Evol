import React, { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import styles from './Auth.module.scss';
import { validateEmail, validatePassword } from '../../utils/validators';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

interface RegisterFormProps {
  onSwitchMode: (mode: 'login' | 'register' | 'forgot_password') => void;
  onSuccess: (message: string, title?: string, onClose?: () => void) => void;
  onShowTerms: (content: React.ReactNode, title: string) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchMode, onSuccess, onShowTerms }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (val.length > 0) {
      const validation = validatePassword(val);
      if (!validation.isValid) {
        setPasswordError(validation.message);
      } else {
        setPasswordError('');
      }
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim()) {
      setError('Por favor, ingresa tu nombre y apellido.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Por favor, ingresa un correo válido.');
      return;
    }

    const validation = validatePassword(password);
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!termsAccepted) {
      setError('Debes aceptar los Términos y Condiciones.');
      return;
    }

    const token = recaptchaRef.current?.getValue();
    if (!token) {
      setError('Por favor, verifica que no eres un robot.');
      return;
    }
    recaptchaRef.current?.reset();

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phone, company, password, captchaToken: token })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Ocurrió un error en el registro');
        return;
      }
      
      onSuccess(
        "Tu cuenta ha sido creada exitosamente. Ya puedes iniciar sesión.", 
        "¡Registro Exitoso!",
        () => onSwitchMode('login')
      );
    } catch (err) {
      setError('Error de red. Por favor intenta más tarde.');
    }
  };

  return (
    <div className={styles.authFormContainer}>
      <div className={styles.formHeader}>
      </div>

      <div className={styles.titles}>
        <h2>Crear cuenta</h2>
        <p>Únete a American Certification Service hoy mismo</p>
      </div>

      <div className={styles.formContent}>
        <form onSubmit={handleSubmit}>
          
          <div className={`${styles.formRow} ${styles.animatedGroup}`}>
            <div className={styles.formGroup}>
              <input 
                type="text" 
                placeholder="Nombre(s)" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <input 
                type="text" 
                placeholder="Apellidos" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={`${styles.formRow} ${styles.animatedGroup}`}>
            <div className={styles.formGroup}>
              <input 
                type="email" 
                placeholder="Correo corporativo" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <input 
                type="tel" 
                placeholder="Teléfono (Opcional)" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className={`${styles.formRow} ${styles.animatedGroup}`}>
            <div className={styles.formGroup}>
              <input 
                type="text" 
                placeholder="Empresa (Opcional)" 
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          </div>

          <div className={`${styles.formRow} ${styles.animatedGroup}`}>
            <div className={styles.formGroup}>
              <input 
                type="password" 
                placeholder="Contraseña" 
                value={password}
                onChange={handlePasswordChange}
                required
              />
              {passwordError && <p className={styles.errorText}>{passwordError}</p>}
            </div>
            <div className={styles.formGroup}>
              <input 
                type="password" 
                placeholder="Confirmar Contraseña" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={`${styles.checkboxGroup} ${styles.animatedGroup}`}>
            <label>
              <input 
                type="checkbox" 
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                required
              />
              <span className={styles.checkmark}></span>
              <span>
                He leído y acepto los <button type="button" onClick={(e) => { e.preventDefault(); onShowTerms(<p>Bienvenido a American Certification Service. Al registrarte y utilizar nuestros servicios, aceptas estos términos. Debes mantener tu cuenta segura. No toleramos el mal uso o abuso de la plataforma. Nos reservamos el derecho de suspender cuentas que infrinjan las normas.</p>, 'Términos y Condiciones'); }}>Términos y Condiciones</button> y la <button type="button" onClick={(e) => { e.preventDefault(); onShowTerms(<p>American Certification Service valora tu privacidad. Recolectamos datos de nombre, correo, empresa y teléfono para brindar nuestros servicios de manera efectiva. No venderemos tu información personal a terceros. Puedes solicitar la eliminación de tu cuenta en cualquier momento enviándonos un correo.</p>, 'Política de Privacidad'); }}>Política de Privacidad</button>
              </span>
            </label>
          </div>

          {error && <p className={styles.errorText}>{error}</p>}

          <div className={styles.captchaWrap}>
            <ReCAPTCHA ref={recaptchaRef} sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY} />
          </div>

          <div className={`${styles.divider} ${styles.animatedGroup}`}>o</div>

          <button type="button" className={`${styles.googleBtn} ${styles.animatedGroup}`} onClick={() => window.location.href = '/api/auth/google'}>
            Registrarse con Google <FcGoogle size={20} />
          </button>

          <div className={`${styles.captchaDisclaimer} ${styles.animatedGroup}`}>
            Protegido por reCAPTCHA. Aplican la{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacidad</a> y{' '}
            <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Términos</a> de Google.
          </div>

          <button type="submit" className={`${styles.submitBtn} ${styles.animatedGroup}`}>
            Registrarse
          </button>
        </form>

        <div className={styles.switchMode}>
          ¿Ya tienes una cuenta? 
          <button type="button" onClick={() => onSwitchMode('login')}>Inicia Sesión</button>
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

export default RegisterForm;
