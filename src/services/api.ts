/**
 * NID SecureGuard API Service Layer
 * Centralized HTTP service for interacting with the Flask/Python backend and internal demo mode.
 */

import { getApiBaseUrl, getEndpoints } from './config';
import type { SystemStatus } from '../types/systemStatus';
import type { SecurityLog } from '../types/securityLog';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
  isDemoFallback?: boolean;
}

class ApiService {
  private baseUrl: string;
  private isDemoMode: boolean = false;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = getApiBaseUrl();
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nid_settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.apiBaseUrl) this.baseUrl = parsed.apiBaseUrl.replace(/\/+$/, '');
          if (parsed.demoModeActive !== undefined) this.isDemoMode = parsed.demoModeActive;
        } catch (e) {
          // ignore
        }
      }
    }
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setDemoMode(active: boolean) {
    this.isDemoMode = active;
  }

  public getDemoMode(): boolean {
    return this.isDemoMode;
  }

  public setAuthToken(token: string | null) {
    this.authToken = token;
  }

  /**
   * Universal fetcher with timeout and optional demo fallback
   */
  public async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    demoFallbackFn?: () => Promise<T> | T
  ): Promise<ApiResponse<T>> {
    // If endpoint is a full URL, use it; otherwise prepend baseUrl
    const url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
      ? endpoint
      : `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    // If Demo Mode is explicitly forced and a fallback is available, run fallback directly
    if (this.isDemoMode && demoFallbackFn) {
      try {
        await new Promise((res) => setTimeout(res, 80));
        const demoData = await demoFallbackFn();
        return {
          success: true,
          data: demoData,
          statusCode: 200,
          isDemoFallback: true,
        };
      } catch (err: any) {
        return {
          success: false,
          error: err.message || 'Demo operation failed',
          statusCode: 500,
          isDemoFallback: true,
        };
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = json?.error || json?.message || `HTTP ${response.status}: ${response.statusText}`;
        if (demoFallbackFn) {
          const fallbackData = await demoFallbackFn();
          return {
            success: true,
            data: fallbackData,
            statusCode: 200,
            isDemoFallback: true,
            error: `Server responded with ${errorMsg}. Using Demo Fallback.`,
          };
        }
        return {
          success: false,
          error: errorMsg,
          statusCode: response.status,
          data: json,
        };
      }

      return {
        success: true,
        data: json,
        statusCode: response.status,
        isDemoFallback: false,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);

      if (demoFallbackFn) {
        try {
          const fallbackData = await demoFallbackFn();
          return {
            success: true,
            data: fallbackData,
            statusCode: 200,
            isDemoFallback: true,
            error: 'Backend unreachable. Operating in Demo Mode.',
          };
        } catch (demoErr: any) {
          return {
            success: false,
            error: `Backend unreachable and demo fallback failed.`,
            statusCode: 503,
          };
        }
      }

      return {
        success: false,
        error: `Cannot reach Flask backend at ${this.baseUrl}. Check server or enable Demo Mode.`,
        statusCode: 503,
      };
    }
  }

  public async get<T = any>(endpoint: string, demoFallbackFn?: () => Promise<T> | T): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, demoFallbackFn);
  }

  public async post<T = any>(endpoint: string, body?: any, demoFallbackFn?: () => Promise<T> | T): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      },
      demoFallbackFn
    );
  }

  public async put<T = any>(endpoint: string, body?: any, demoFallbackFn?: () => Promise<T> | T): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      },
      demoFallbackFn
    );
  }

  public async delete<T = any>(endpoint: string, demoFallbackFn?: () => Promise<T> | T): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' }, demoFallbackFn);
  }
}

export const api = new ApiService();
