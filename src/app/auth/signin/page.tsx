import { Metadata } from 'next';
import SignInViewPage from '@/features/auth/components/sigin-view';

export const metadata: Metadata = {
  title: 'Autenticación | Iniciar Sesión',
  description: 'Página de inicio de sesión para autenticación.'
};

export default function Page() {
  return <SignInViewPage />;
}
