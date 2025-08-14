import NextAuth, { NextAuthConfig, Session, User } from 'next-auth';
import CredentialProvider from 'next-auth/providers/credentials';
import { createAxiosInstance } from '@/lib/axios-instance';
import { LoginPayload } from 'types/AuthTypes';
import { loginUser } from '@/features/auth/api/auth-api';
import dayjs from 'dayjs';

export const BASE_PATH = '/api/auth';
const SECRET = process.env.AUTH_SECRET!;

const authOptions = {
  providers: [
    CredentialProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' }
      },
      async authorize(credentials): Promise<User | null> {
        const loginPayload: LoginPayload = {
          email: credentials.email as string,
          password: credentials.password as string,
          isBO: true
        };

        const apiClient = createAxiosInstance();

        const data = await loginUser(apiClient, loginPayload);

        if (data && data.token) {
          const user: User = {
            id: data.email,
            name: data.name,
            email: data.email,
            role: data.role,
            token: data.token,
            expiresIn: data.expiresIn
          };

          return user;
        }

        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async signIn() {
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.data = user;
        token.accessToken = user.token;
        token.expiresIn = user.expiresIn;
      }
      return token;
    },
    async session({ session, token }) {
      if (!token) {
        return {
          ...session,
          accessToken: '',
          user: null as any
        };
      }

      session.accessToken = String(token.accessToken);
      session.user = token.data as any;
      session.role = session.user.role;

      const expiresIn = dayjs(token.expiresIn as Date);
      session.expires = expiresIn.toDate();

      return session as Session;
    }
  },
  pages: {
    signIn: '/'
  },
  secret: SECRET,
  basePath: BASE_PATH
} satisfies NextAuthConfig;

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
