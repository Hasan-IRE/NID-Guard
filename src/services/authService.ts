import { User, UserRole } from '../types/auth';
import { DEMO_USERS } from '../data/demoData';
import { api, ApiResponse } from './api';

export interface LoginResponseData {
  user: User;
  token: string;
  expiresIn: number;
}

// Role permission matrix matching Section 7 of specification
export const ROLE_PERMISSIONS: Record<UserRole, {
  canAccessDashboard: boolean;
  canAccessCamera: boolean;
  canAccessFaceDetection: boolean;
  canAccessFingerprint: boolean;
  canAccessNidRecords: boolean;
  canManageNidRecords: boolean; // Add, edit, delete, disable
  canAccessControl: boolean; // Simulate and approve access
  canAccessSecurityLogs: boolean;
  canManageDevices: boolean;
  canAccessSettings: boolean;
}> = {
  admin: {
    canAccessDashboard: true,
    canAccessCamera: true,
    canAccessFaceDetection: true,
    canAccessFingerprint: true,
    canAccessNidRecords: true,
    canManageNidRecords: true,
    canAccessControl: true,
    canAccessSecurityLogs: true,
    canManageDevices: true,
    canAccessSettings: true,
  },
  security: {
    canAccessDashboard: true,
    canAccessCamera: true,
    canAccessFaceDetection: true,
    canAccessFingerprint: true,
    canAccessNidRecords: true,
    canManageNidRecords: false, // Security officer monitors, but doesn't modify records
    canAccessControl: true,
    canAccessSecurityLogs: true,
    canManageDevices: true,
    canAccessSettings: false,
  },
  operator: {
    canAccessDashboard: true,
    canAccessCamera: true,
    canAccessFaceDetection: true,
    canAccessFingerprint: true,
    canAccessNidRecords: true, // Limited view only
    canManageNidRecords: false,
    canAccessControl: false,
    canAccessSecurityLogs: false,
    canManageDevices: false,
    canAccessSettings: false,
  },
  viewer: {
    canAccessDashboard: true,
    canAccessCamera: true, // Read-only
    canAccessFaceDetection: false,
    canAccessFingerprint: false,
    canAccessNidRecords: false,
    canManageNidRecords: false,
    canAccessControl: false,
    canAccessSecurityLogs: false,
    canManageDevices: false, // Read-only status on dashboard only
    canAccessSettings: false,
  },
};

export class AuthService {
  private static STORAGE_KEY = 'nid_auth_session';

  public static async login(username: string, password: string): Promise<ApiResponse<LoginResponseData>> {
    const cleanUsername = username.trim().toLowerCase();

    return api.post<LoginResponseData>(
      '/auth/login',
      { username: cleanUsername, password },
      () => {
        const demoAccount = DEMO_USERS[cleanUsername];
        if (!demoAccount) {
          throw new Error('Invalid credentials. Please use demo accounts (e.g., admin, security, operator, viewer).');
        }

        if (demoAccount.passwordHash !== password) {
          throw new Error('Incorrect password for this demo account.');
        }

        const data: LoginResponseData = {
          user: demoAccount.user,
          token: `demo-jwt-${cleanUsername}-${Date.now()}`,
          expiresIn: 3600,
        };

        this.saveSession(data.user, data.token);
        return data;
      }
    );
  }

  public static async logout(): Promise<ApiResponse<{ message: string }>> {
    return api.post<{ message: string }>(
      '/auth/logout',
      {},
      () => {
        this.clearSession();
        return { message: 'Logged out successfully.' };
      }
    );
  }

  public static saveSession(user: User, token: string) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ user, token, timestamp: Date.now() }));
    api.setAuthToken(token);
  }

  public static getSavedSession(): { user: User; token: string } | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed?.user && parsed?.token) {
        api.setAuthToken(parsed.token);
        return parsed;
      }
    } catch (e) {
      console.error('Failed to restore session', e);
    }
    return null;
  }

  public static clearSession() {
    localStorage.removeItem(this.STORAGE_KEY);
    api.setAuthToken(null);
  }

  public static hasPermission(role: UserRole | undefined, permission: keyof typeof ROLE_PERMISSIONS['admin']): boolean {
    if (!role) return false;
    return !!ROLE_PERMISSIONS[role]?.[permission];
  }
}
