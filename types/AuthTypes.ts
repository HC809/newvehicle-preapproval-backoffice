export interface LoginPayload {
  email: string;
  password: string;
  isBO: boolean;
}

export interface AuthResponse {
  email: string;
  name: string;
  role: string;
  token: string;
  expiresIn: Date;
}

export interface AuthResult {
  ok: boolean;
  message: string | null;
  data?: AuthResponse;
}
