export interface User {
  id: number;
  username: string;
  fullname: string;
  email: string;
  roleId: number;
  roleName?: string;
}

export interface AuthResponse {
  user: User;
  // accessToken is in HTTP-only cookie
}

export interface LoginCredentials {
  username: string;
  password: string;
}
