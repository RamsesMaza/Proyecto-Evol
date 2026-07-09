import { logger } from './logger';

const BREVO_API = 'https://api.brevo.com/v3/smtp/email';
const brevoApiKey = process.env.BREVO_API_KEY;
const brevoConfigured = !!(brevoApiKey && !brevoApiKey.startsWith('tu_'));

const appName = 'American Certification Service';
const fromEmail = process.env.BREVO_FROM || 'noreply@acsperu.com';

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

function build2faHtml(code: string): string {
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
    <div class="header"><h1>${appName}</h1></div>
    <div class="body">
      <h2>Autenticación de Dos Factores</h2>
      <p>Ingresa el siguiente código para completar tu inicio de sesión:</p>
      <div class="otp-code">${code}</div>
      <p class="expiry">Este código expira en <strong>5 minutos</strong>.</p>
      <p style="color:#999;font-size:13px;margin-top:25px;">Si no intentaste iniciar sesión, alguien tiene tu contraseña. Cambíala inmediatamente.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${appName}. Todos los derechos reservados.</p>
      <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
    </div>
  </div>
</body>
</html>`;
}

function buildInvoiceHtml(orderId: number): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body { margin:0; padding:0; background:#f4f4f4; font-family:Arial,Helvetica,sans-serif; }
  .container { max-width:560px; margin:40px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08); }
  .header { background:#C10E1A; padding:30px; text-align:center; }
  .header h1 { color:#fff; margin:0; font-size:22px; }
  .body { padding:40px 30px; text-align:center; }
  .body h2 { color:#333; margin:0 0 10px; font-size:20px; }
  .body p { color:#666; font-size:15px; line-height:1.6; margin:0 0 10px; }
  .footer { padding:20px 30px; text-align:center; background:#fafafa; border-top:1px solid #eee; }
  .footer p { color:#999; font-size:12px; margin:4px 0; }
</style></head>
<body>
  <div class="container">
    <div class="header"><h1>${appName}</h1></div>
    <div class="body">
      <h2>¡Gracias por tu compra!</h2>
      <p>Hemos recibido tu pedido <strong>#${orderId}</strong>.</p>
      <p>Adjunto encontrarás tu comprobante de pago en PDF.</p>
      <p style="color:#999;font-size:13px;margin-top:20px;">Si tienes alguna consulta, responde a este correo.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${appName}. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>`;
}

function extractCode(html: string): string {
  return html.match(/\d{6}/)?.[0] || '(sin código visible)';
}

function logToConsole(to: string, subject: string, code: string): void {
  console.log(`\n===========================================`);
  console.log(`[BREVO] Email a: ${to}`);
  console.log(`[BREVO] Asunto: ${subject}`);
  console.log(`[BREVO] Código: ${code}`);
  console.log(`===========================================\n`);
}

async function sendViaBrevo(
  to: string,
  subject: string,
  htmlContent: string,
  attachment?: { filename: string; content: Buffer; contentType: string },
): Promise<void> {
  const payload: any = {
    sender: { name: appName, email: fromEmail },
    to: [{ email: to }],
    subject,
    htmlContent,
  };

  if (attachment) {
    payload.attachment = [
      {
        name: attachment.filename,
        content: attachment.content.toString('base64'),
      },
    ];
  }

  const res = await fetch(BREVO_API, {
    method: 'POST',
    headers: {
      'api-key': brevoApiKey!,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Brevo error ${res.status}: ${errBody}`);
  }
}

async function trySend(
  to: string,
  subject: string,
  html: string,
  attachment?: { filename: string; content: Buffer; contentType: string },
): Promise<void> {
  const code = extractCode(html);
  logToConsole(to, subject, code);

  if (!brevoConfigured) {
    return;
  }

  try {
    await sendViaBrevo(to, subject, html, attachment);
    logger.info({ to, subject }, 'Correo enviado exitosamente vía Brevo');
  } catch (err) {
    logger.error({ err, to, subject }, 'Error enviando correo vía Brevo');
  }
}

export const sendOtpEmail = async (to: string, code: string): Promise<void> => {
  await trySend(to, 'Código de recuperación de contraseña', buildHtml(code));
};

export const send2faOtpEmail = async (to: string, code: string): Promise<void> => {
  await trySend(to, 'Código de verificación - Autenticación de Dos Factores', build2faHtml(code));
};

export const sendInvoiceEmail = async (
  to: string,
  pdfBuffer: Buffer,
  orderId: number,
): Promise<void> => {
  await trySend(
    to,
    `Recibo de compra - Orden #${orderId}`,
    buildInvoiceHtml(orderId),
    {
      filename: `recibo-${orderId}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    },
  );
};
