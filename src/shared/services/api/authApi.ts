import { apiClient, ApiError } from "./client";
import { LoginCredentials, User } from "@/features/login/models/AuthModels";

export class AuthApi {
  /**
   * Login user
   * POST /api/auth/login
   */
  static async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await apiClient.post<User, LoginCredentials>(
        "/auth/login",
        credentials
      );
      if (!response.data) {
        throw new Error("No se recibió respuesta del servidor");
      }
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw apiError;
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout", {});
    } catch (error) {
      const apiError = error as ApiError;
      throw apiError;
    }
  }

  /**
   * Get current user
   * GET /api/auth/me
   */
  static async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>("/auth/me");
      if (!response.data) {
        throw new Error("No se recibió respuesta del servidor");
      }
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      throw apiError;
    }
  }
}
