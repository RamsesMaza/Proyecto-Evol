import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, generateToken, verifyRecaptcha } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, captchaToken } = body;

    const isHuman = await verifyRecaptcha(captchaToken);
    if (!isHuman) {
      return NextResponse.json({ error: 'Validación de reCAPTCHA fallida' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const token = generateToken({ userId: user.id, email: user.email });

    return NextResponse.json({ message: 'Inicio de sesión exitoso', token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } }, { status: 200 });
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
