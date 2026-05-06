import React, { useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import styles from './Auth.module.scss';
import { validateEmail, validatePassword } from '../../utils/validators';

interface ForgotPasswordFormProps {
  onSwitchMode: (mode: 'login' | 'register' | 'forgot_password') => void;
  onSuccess: (message: string, title?: string, onClose?: () => void) => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSwitchMode, onSuccess }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewPassword(val);
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

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Por favor, ingresa un correo válido.');
      return;
    }

    if (!executeRecaptcha) {
      setError('ReCAPTCHA no está listo. Por favor, intenta de nuevo.');
      return;
    }

    try {
      const token = await executeRecaptcha('forgot_password_step1');
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, captchaToken: token })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Ocurrió un error al solicitar recuperación');
        return;
      }

      onSuccess(
        "Te hemos enviado un código de seguridad de 6 dígitos a tu correo electrónico. Por favor revisa tu bandeja de entrada o spam.", 
        "¡Código enviado!",
        () => setStep(2)
      );
    } catch (err) {
      setError('Error de red. Por favor intenta más tarde.');
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (code.length !== 6) {
      setError('El código debe tener exactamente 6 dígitos.');
      return;
    }

    // Simulando validación de código
    console.log('Step 2 attempt:', { email, code });
    setStep(3);
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      const token = await executeRecaptcha('forgot_password_step3');
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword, captchaToken: token })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Error al actualizar contraseña. Verifica el código.');
        return;
      }

      onSuccess(
        "Tu contraseña ha sido actualizada correctamente. Ahora puedes iniciar sesión con tu nueva clave.", 
        "¡Contraseña actualizada!",
        () => onSwitchMode('login')
      );
    } catch (err) {
      setError('Error de red. Por favor intenta más tarde.');
    }
  };

  return (
    <div className={styles.authFormContainer}>
      <div className={styles.formHeader}></div>

      <div className={styles.titles}>
        {step === 1 && (
          <>
            <h2>Recuperar Contraseña</h2>
            <p>Ingresa tu correo para recibir las instrucciones</p>
          </>
        )}
        {step === 2 && (
          <>
            <h2>Verificar Código</h2>
            <p>Ingresa el código numérico enviado a <strong>{email}</strong></p>
          </>
        )}
        {step === 3 && (
          <>
            <h2>Nueva Contraseña</h2>
            <p>Por seguridad, elige una contraseña fuerte</p>
          </>
        )}
      </div>

      <div className={styles.formContent}>
        {step === 1 && (
          <form onSubmit={handleStep1Submit}>
            <div className={`${styles.formGroup} ${styles.animatedGroup}`}>
              <input 
                type="email" 
                placeholder="Correo corporativo" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {error && <p className={`${styles.errorText} ${styles.animatedGroup}`}>{error}</p>}
            <button type="submit" className={`${styles.submitBtn} ${styles.animatedGroup}`}>
              Enviar Código
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2Submit}>
            <div className={`${styles.formGroup} ${styles.animatedGroup}`}>
              <input 
                type="text" 
                placeholder="Código de 6 dígitos" 
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                required
                style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '8px' }}
              />
            </div>
            {error && <p className={`${styles.errorText} ${styles.animatedGroup}`}>{error}</p>}
            <button type="submit" className={`${styles.submitBtn} ${styles.animatedGroup}`}>
              Verificar Código
            </button>
            <div className={`${styles.switchMode} ${styles.animatedGroup}`}>
              <button type="button" onClick={() => setStep(1)}>Volver a enviar código</button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleStep3Submit}>
            <div className={`${styles.formGroup} ${styles.animatedGroup}`}>
              <input 
                type="password" 
                placeholder="Nueva Contraseña" 
                value={newPassword}
                onChange={handlePasswordChange}
                required
              />
              {passwordError && <p className={styles.errorText}>{passwordError}</p>}
            </div>
            <div className={`${styles.formGroup} ${styles.animatedGroup}`}>
              <input 
                type="password" 
                placeholder="Confirmar Nueva Contraseña" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className={`${styles.errorText} ${styles.animatedGroup}`}>{error}</p>}
            <button type="submit" className={`${styles.submitBtn} ${styles.animatedGroup}`}>
              Guardar Contraseña
            </button>
          </form>
        )}

        {step === 1 && (
          <div className={`${styles.captchaDisclaimer} ${styles.animatedGroup}`} style={{ marginTop: '20px' }}>
            Protegido por reCAPTCHA invisible. Aplican la{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacidad</a> y{' '}
            <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Términos</a> de Google.
          </div>
        )}

        <div className={`${styles.switchMode} ${styles.animatedGroup}`}>
          ¿Recordaste tu contraseña? 
          <button type="button" onClick={() => onSwitchMode('login')}>Inicia Sesión</button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
