import { AuthApi } from "@/shared/services/api/authApi";
import { LoginCredentials, User } from "../models/AuthModels";
import { ApiError } from "@/shared/services/api/client";

export class AuthController {
  // Validate login data
  static validateCredentials(credentials: Partial<LoginCredentials>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!credentials.username || credentials.username.trim().length < 3) {
      errors.push("Ingresa un nombre de usuario válido (mínimo 3 caracteres)");
    }

    if (!credentials.password || credentials.password.length < 6) {
      errors.push("La contraseña debe tener al menos 6 caracteres");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Handle Login
  static async login(
    credentials: LoginCredentials
  ): Promise<{ success: boolean; data?: User; message?: string }> {
    try {
      // 1. Validation
      const validation = this.validateCredentials(credentials);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.errors[0],
        };
      }

      // 2. API Call
      const user = await AuthApi.login(credentials);

      return {
        success: true,
        data: user,
        message: "¡Bienvenido de nuevo!",
      };
    } catch (error) {
      console.error("Error en login:", error);
      const apiError = error as ApiError;

      if (apiError.statusCode === 401) {
        return {
          success: false,
          message:
            "Credenciales inválidas. Por favor verifica tu usuario y contraseña.",
        };
      }

      if (apiError.statusCode === 0) {
        return {
          success: false,
          message: "No se pudo conectar con el servidor. Verifica tu conexión.",
        };
      }

      return {
        success: false,
        message:
          apiError.message || "Ocurrió un error inesperado al iniciar sesión.",
      };
    }
  }

  // Handle Logout
  static async logout(): Promise<{ success: boolean; message: string }> {
    try {
      await AuthApi.logout();
      return { success: true, message: "Sesión cerrada correctamente" };
    } catch (error) {
      console.error("Error en logout:", error);
      return { success: false, message: "Error al cerrar sesión" };
    }
  }

  // Get current session
  static async checkSession(): Promise<User | null> {
    try {
      return await AuthApi.getCurrentUser();
    } catch (error) {
      return null;
    }
  }
}
