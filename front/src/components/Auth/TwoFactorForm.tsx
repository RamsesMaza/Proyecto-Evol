import React, { useState, useRef, useEffect } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useAuth } from '../../context/AuthContext';
import styles from './Auth.module.scss';

interface TwoFactorFormProps {
  onCancel: () => void;
  email: string;
}

const TwoFactorForm: React.FC<TwoFactorFormProps> = ({ onCancel, email }) => {
  const { partialToken, twoFactorMethod, login, clearTwoFactorChallenge } = useAuth();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const codeInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  useEffect(() => {
    startCooldown();
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Ingresa el código completo de 6 dígitos.');
      return;
    }

    if (!partialToken) {
      setError('Sesión expirada. Inicia sesión nuevamente.');
      return;
    }

    if (!executeRecaptcha) {
      setError('ReCAPTCHA no está listo.');
      return;
    }

    setLoading(true);
    try {
      const captchaToken = await executeRecaptcha('verify_2fa');
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partialToken, code: fullCode, captchaToken }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setError('Demasiados intentos. Inicia sesión nuevamente.');
        } else {
          setError(data.error || 'Código inválido');
        }
        setCode(['', '', '', '', '', '']);
        codeInputsRef.current[0]?.focus();
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      login(data.user, data.token);
      window.location.href = '/panel';
    } catch {
      setError('Error de red. Por favor intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending || !partialToken) return;
    if (!executeRecaptcha) return;

    setResending(true);
    setError('');
    try {
      const captchaToken = await executeRecaptcha('resend_2fa');
      const res = await fetch('/api/auth/2fa/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partialToken, captchaToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al reenviar código');
        return;
      }
      startCooldown();
      setCode(['', '', '', '', '', '']);
    } catch {
      setError('Error de red');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={styles.authFormContainer}>
      <div className={styles.formHeader} />
      <div className={styles.titles}>
        <h2>Verificación en Dos Pasos</h2>
        <p>
          Ingresa el código enviado a{' '}
          <strong>
            {twoFactorMethod === 'sms'
              ? 'tu teléfono'
              : email
                ? `${email.slice(0, 3)}***@${email.split('@')[1]}`
                : 'tu correo'}
          </strong>
        </p>
      </div>
      <div className={styles.formContent}>
        <form onSubmit={handleSubmit}>
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
            <button type="button" onClick={handleResend} disabled={cooldown > 0 || resending}>
              {resending
                ? 'Reenviando...'
                : cooldown > 0
                  ? `Reenviar en ${cooldown}s`
                  : 'Volver a enviar código'}
            </button>
          </div>
          {twoFactorMethod === 'authenticator' && (
            <p style={{ fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 12 }}>
              Abre tu aplicación de autenticación (Google Authenticator, Authy, etc.)
              e ingresa el código de 6 dígitos.
            </p>
          )}
          <div className={`${styles.switchMode} ${styles.animatedGroup}`} style={{ marginTop: 8 }}>
            <button type="button" onClick={() => { clearTwoFactorChallenge(); onCancel(); }}>
              Cancelar y volver al inicio de sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TwoFactorForm;
