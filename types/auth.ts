export interface SessionData {
  userId: number;
  email: string;
  isLoggedIn: boolean;
}

export interface LoginResult {
  success: boolean;
  error?: string;
}
