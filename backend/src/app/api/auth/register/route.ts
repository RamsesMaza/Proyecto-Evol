import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyRecaptcha } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, company, password, captchaToken } = body;

    const isHuman = await verifyRecaptcha(captchaToken);
    if (!isHuman) {
      return NextResponse.json({ error: 'Validación de reCAPTCHA fallida' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'El correo ya está registrado' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        company,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: 'Usuario registrado exitosamente', userId: user.id }, { status: 201 });
  } catch (error) {
    console.error('Error en register:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
