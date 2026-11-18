export type UserRole = 'admin' | 'security' | 'operator' | 'viewer';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  roleLabel: string;
  department: string;
  avatar?: string;
  lastLogin?: string;
  status: 'active' | 'suspended';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token?: string;
  expiresAt?: number;
}
