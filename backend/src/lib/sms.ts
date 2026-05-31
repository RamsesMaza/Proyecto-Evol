import twilio from 'twilio';

const twilioConfigured = !!(
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  !process.env.TWILIO_ACCOUNT_SID.startsWith('tu_')
);

let twilioClient: twilio.Twilio | null = null;
let twilioWarned = false;

if (twilioConfigured) {
  try {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
  } catch {
    console.warn('[TWILIO] Error al inicializar cliente Twilio. SMS se mostrará en consola.');
  }
}

function devFallback(to: string, message: string) {
  console.log(`\n===========================================`);
  console.log(`[DEV SMS] Para: ${to}`);
  console.log(`[DEV SMS] Mensaje: ${message}`);
  console.log(`===========================================\n`);
}

export const sendSms = async (to: string, message: string): Promise<void> => {
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!twilioConfigured || !twilioClient || !from) {
    if (!twilioWarned) {
      console.warn('[TWILIO] No configurado o falta TWILIO_PHONE_NUMBER. SMS mostrado en consola.');
      twilioWarned = true;
    }
    devFallback(to, message);
    return;
  }

  try {
    await twilioClient.messages.create({ to, from, body: message });
  } catch (err: any) {
    console.warn(`[TWILIO] Error al enviar SMS a ${to}: ${err.message}`);
    console.warn('[TWILIO] Mostrando SMS en consola como fallback.');
    devFallback(to, message);
  }
};
