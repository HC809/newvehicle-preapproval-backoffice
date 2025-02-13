// nextauth.d.ts
import { DefaultSession, DefaultUser } from 'next-auth';

interface IUser extends DefaultUser {
  role: string;
  businessId?: string;
  token: string;
  expiresIn: Date;
}

declare module 'next-auth' {
  interface User extends IUser {}

  interface Session {
    user?: User;
    isSystemAdmin: boolean;
    accessToken: String;
    expiresIn: number;
    expires: Date;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends IUser {
    accessToken: String;
    expiresIn: Date;
  }
}
