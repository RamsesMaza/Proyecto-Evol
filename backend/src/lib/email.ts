import nodemailer from 'nodemailer';

const smtpConfigured = !!(
  process.env.SMTP_USER &&
  process.env.SMTP_PASS &&
  !process.env.SMTP_USER.startsWith('tu_')
);

let transporter: nodemailer.Transporter | null = null;

if (smtpConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const appName = 'American Certification Service';

function buildHtml(code: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif; }
    .container { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: #C10E1A; padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; }
    .body { padding: 40px 30px; text-align: center; }
    .body h2 { color: #333; margin: 0 0 10px; font-size: 20px; }
    .body p { color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 25px; }
    .otp-code { display: inline-block; background: #f8f8f8; border: 2px dashed #C10E1A; border-radius: 10px; padding: 16px 40px; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #C10E1A; font-family: 'Courier New', monospace; }
    .footer { padding: 20px 30px; text-align: center; background: #fafafa; border-top: 1px solid #eee; }
    .footer p { color: #999; font-size: 12px; margin: 4px 0; }
    .expiry { color: #999; font-size: 13px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${appName}</h1>
    </div>
    <div class="body">
      <h2>Recuperación de Contraseña</h2>
      <p>Hemos recibido una solicitud para restablecer tu contraseña.<br>Usa el siguiente código para continuar:</p>
      <div class="otp-code">${code}</div>
      <p class="expiry">Este código expira en <strong>5 minutos</strong>.</p>
      <p style="color:#999;font-size:13px;margin-top:25px;">Si no solicitaste este cambio, puedes ignorar este correo.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${appName}. Todos los derechos reservados.</p>
      <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
    </div>
  </div>
</body>
</html>`;
}

export const sendOtpEmail = async (to: string, code: string): Promise<void> => {
  if (!smtpConfigured || !transporter) {
    console.log(`\n===========================================`);
    console.log(`[DEV] Email a: ${to}`);
    console.log(`[DEV] Tu código de recuperación es: ${code}`);
    console.log(`[DEV] SMTP no configurado. Define SMTP_USER y SMTP_PASS en .env para enviar correos reales.`);
    console.log(`===========================================\n`);
    return;
  }

  await transporter.sendMail({
    from: `"${appName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject: 'Código de recuperación de contraseña',
    html: buildHtml(code),
  });
};
