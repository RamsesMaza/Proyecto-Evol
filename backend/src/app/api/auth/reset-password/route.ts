import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyRecaptcha } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code, newPassword, captchaToken } = body;

    const isHuman = await verifyRecaptcha(captchaToken);
    if (!isHuman) {
      return NextResponse.json({ error: 'Validación de reCAPTCHA fallida' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || user.resetCode !== code) {
      return NextResponse.json({ error: 'Código inválido o correo incorrecto' }, { status: 400 });
    }

    if (!user.resetCodeExpires || user.resetCodeExpires < new Date()) {
      return NextResponse.json({ error: 'El código ha expirado. Solicita uno nuevo.' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        resetCode: null,
        resetCodeExpires: null
      },
    });

    return NextResponse.json({ message: 'Contraseña actualizada correctamente' }, { status: 200 });
  } catch (error) {
    console.error('Error en reset-password:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
