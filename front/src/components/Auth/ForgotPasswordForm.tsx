import React, { useState, useRef } from 'react';
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
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const codeInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const startCooldown = () => {
    setCooldown(60);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewPassword(val);
    if (val.length > 0) {
      const validation = validatePassword(val);
      setPasswordError(validation.isValid ? '' : validation.message);
    } else {
      setPasswordError('');
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value.replace(/\D/g, '');
    setCode(newCode);

    if (value && index < 5) {
      codeInputsRef.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeInputsRef.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = paste.split('').concat(Array(6 - paste.length).fill(''));
    setCode(newCode);
    const nextIndex = Math.min(paste.length, 5);
    codeInputsRef.current[nextIndex]?.focus();
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

    setLoading(true);
    try {
      const token = await executeRecaptcha('forgot_password_step1');
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, captchaToken: token }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ocurrió un error al solicitar recuperación');
        return;
      }

      setStep(2);
      startCooldown();
    } catch {
      setError('Error de red. Por favor intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (cooldown > 0 || resending) return;

    if (!executeRecaptcha) return;

    setResending(true);
    setError('');
    try {
      const token = await executeRecaptcha('forgot_password_resend');
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, captchaToken: token }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al reenviar código');
        return;
      }

      startCooldown();
    } catch {
      setError('Error de red. Por favor intenta más tarde.');
    } finally {
      setResending(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Ingresa el código completo de 6 dígitos.');
      return;
    }

    if (!executeRecaptcha) {
      setError('ReCAPTCHA no está listo. Por favor, intenta de nuevo.');
      return;
    }

    setLoading(true);
    try {
      const token = await executeRecaptcha('verify_otp');
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode, captchaToken: token }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setError('Demasiados intentos. Solicita un nuevo código.');
        } else {
          setError(data.error || 'Código inválido');
        }
        setCode(['', '', '', '', '', '']);
        codeInputsRef.current[0]?.focus();
        return;
      }

      setStep(3);
    } catch {
      setError('Error de red. Por favor intenta más tarde.');
    } finally {
      setLoading(false);
    }
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

    if (!executeRecaptcha) {
      setError('ReCAPTCHA no está listo. Por favor, intenta de nuevo.');
      return;
    }

    setLoading(true);
    try {
      const token = await executeRecaptcha('reset_password');
      const fullCode = code.join('');
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode, newPassword, captchaToken: token }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al actualizar contraseña');
        return;
      }

      onSuccess(
        'Tu contraseña ha sido actualizada correctamente. Ahora puedes iniciar sesión con tu nueva clave.',
        '¡Contraseña actualizada!',
        () => onSwitchMode('login'),
      );
    } catch {
      setError('Error de red. Por favor intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authFormContainer}>
      <div className={styles.formHeader} />

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
                disabled={loading}
                required
              />
            </div>
            {error && <p className={`${styles.errorText} ${styles.animatedGroup}`}>{error}</p>}
            <button
              type="submit"
              className={`${styles.submitBtn} ${styles.animatedGroup}`}
              disabled={loading}
            >
              {loading ? <span className={styles.spinner} /> : 'Enviar Código'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2Submit}>
            <div className={`${styles.otpContainer} ${styles.animatedGroup}`}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { codeInputsRef.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(i, e)}
                  onPaste={i === 0 ? handleCodePaste : undefined}
                  className={styles.otpInput}
                  disabled={loading}
                  autoFocus={i === 0}
                />
              ))}
            </div>
            {error && <p className={`${styles.errorText} ${styles.animatedGroup}`}>{error}</p>}
            <button
              type="submit"
              className={`${styles.submitBtn} ${styles.animatedGroup}`}
              disabled={loading || code.join('').length !== 6}
            >
              {loading ? <span className={styles.spinner} /> : 'Verificar Código'}
            </button>
            <div className={`${styles.switchMode} ${styles.animatedGroup}`}>
              <button type="button" onClick={handleResendCode} disabled={cooldown > 0 || resending}>
                {resending
                  ? 'Reenviando...'
                  : cooldown > 0
                    ? `Reenviar en ${cooldown}s`
                    : 'Volver a enviar código'}
              </button>
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
                disabled={loading}
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
                disabled={loading}
                required
              />
            </div>
            {error && <p className={`${styles.errorText} ${styles.animatedGroup}`}>{error}</p>}
            <button
              type="submit"
              className={`${styles.submitBtn} ${styles.animatedGroup}`}
              disabled={loading}
            >
              {loading ? <span className={styles.spinner} /> : 'Guardar Contraseña'}
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
