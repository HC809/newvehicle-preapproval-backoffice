import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirigir automáticamente a la página de login
  redirect('/auth/signin');
}
