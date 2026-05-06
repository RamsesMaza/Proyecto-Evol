import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRecaptcha } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, captchaToken } = body;

    const isHuman = await verifyRecaptcha(captchaToken);
    if (!isHuman) {
      return NextResponse.json({ error: 'Validación de reCAPTCHA fallida' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Por seguridad no confirmamos si el correo existe o no
      return NextResponse.json({ message: 'Si el correo existe, se enviará un código' }, { status: 200 });
    }

    // Generar código de 6 dígitos
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await prisma.user.update({
      where: { id: user.id },
      data: { resetCode, resetCodeExpires },
    });

    // SIMULACIÓN DE ENVÍO DE CORREO
    console.log(`\n===========================================`);
    console.log(`[SIMULACIÓN EMAIL] Recuperación de contraseña`);
    console.log(`Para: ${email}`);
    console.log(`Tu código de recuperación es: ${resetCode}`);
    console.log(`===========================================\n`);

    return NextResponse.json({ message: 'Código de recuperación generado' }, { status: 200 });
  } catch (error) {
    console.error('Error en forgot-password:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
