import { NextAuthConfig, Session, User } from 'next-auth';
import CredentialProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import dayjs from 'dayjs';

const authConfig = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? ''
    }),
    CredentialProvider({
      credentials: {
        email: {
          type: 'email'
        },
        password: {
          type: 'password'
        }
      },
      async authorize(credentials): Promise<User | null> {
        const user = {
          id: '1',
          name: 'Hector Caballero',
          email: credentials?.email as string
        };
        if (user) {
          // Mock data for testing
          const mockData = {
            email: 'hector.caballero@example.com',
            fullName: 'Hector Caballero',
            role: 'USER',
            token: 'mock-jwt-token',
            expiresIn: new Date(Date.now() + 3600000) // 1 hour from now
          };

          const user: User = {
            id: mockData.email,
            name: mockData.fullName,
            email: mockData.email,
            role: mockData.role,
            token: mockData.token,
            expiresIn: mockData.expiresIn
          };

          return user;
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null;

          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
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
          user: null as any,
          isSystemAdmin: false
        };
      }

      session.accessToken = String(token.accessToken);
      session.user = token.data as any;
      session.isSystemAdmin = session.user.role === 'NoemiSuperAdmin';

      const expiresIn = dayjs(token.expiresIn as Date);
      session.expires = expiresIn.toDate();

      return session as Session;
    }
  },
  pages: {
    signIn: '/' //sigin page
  }
} satisfies NextAuthConfig;

export default authConfig;
