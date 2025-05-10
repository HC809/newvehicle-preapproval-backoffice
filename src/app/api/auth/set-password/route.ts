import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, newPassword, confirmPassword } = body;

    if (!token || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { message: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { message: 'Las contraseñas no coinciden' },
        { status: 400 }
      );
    }

    // TODO: Implement your password reset logic here
    // 1. Verify the token is valid and not expired
    // 2. Update the user's password in your database
    // 3. Invalidate the token after use

    return NextResponse.json(
      { message: 'Contraseña actualizada exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al establecer la contraseña:', error);
    return NextResponse.json(
      { message: 'Error al establecer la contraseña' },
      { status: 500 }
    );
  }
}
