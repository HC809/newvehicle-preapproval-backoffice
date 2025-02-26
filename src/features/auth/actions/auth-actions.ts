'use server';

import { signIn } from '@/lib/auth.config';
import { sanitizeErrorMessage } from '@/lib/utils';
import { AuthResult } from 'types/AuthTypes';

export async function authenticate(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    await signIn('credentials', { email, password, redirect: false });
    return { ok: true, message: null };
  } catch (error: any) {
    if (typeof error === 'string') {
      return { ok: false, message: error };
    }

    // Handle cases where error might be an object with a message property
    if (error?.message && typeof error.message === 'string') {
      return { ok: false, message: sanitizeErrorMessage(error.message) };
    }

    return {
      ok: false,
      message: 'Ocurrió un error inesperado en la autenticación.'
    };
  }
}
