import SetPasswordForm from '@/features/auth/components/set-password-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Establecer Contraseña',
  description: 'Página para establecer nueva contraseña.'
};

export default function SetPasswordPage({
  searchParams
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  if (!token) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-red-600'>Error</h1>
          <p className='mt-2'>Token no válido o expirado</p>
        </div>
      </div>
    );
  }

  return <SetPasswordForm token={token} />;
}
