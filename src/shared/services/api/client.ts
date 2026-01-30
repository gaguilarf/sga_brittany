// API Client Configuration
<<<<<<< HEAD
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.brittanygroup.edu.pe/api';
=======
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (
    typeof window !== "undefined" &&
    window.location.hostname === "localhost"
  ) {
    return "http://localhost:3002/api";
  }
  return "https://api.brittanygroup.edu.pe/api";
};

const API_BASE_URL = getBaseUrl();
>>>>>>> birttany_front/main

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
<<<<<<< HEAD
        message: errorData.message || 'Error en la solicitud',
=======
        message: errorData.message || "Error en la solicitud",
>>>>>>> birttany_front/main
        statusCode: response.status,
        error: errorData.error,
      } as ApiError;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return { data: undefined as T };
    }

    const data = await response.json();
    return { data };
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
<<<<<<< HEAD
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
=======
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
>>>>>>> birttany_front/main
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if ((error as ApiError).statusCode) {
        throw error;
      }
      throw {
<<<<<<< HEAD
        message: 'Error de conexión con el servidor',
=======
        message: "Error de conexión con el servidor",
>>>>>>> birttany_front/main
        statusCode: 0,
      } as ApiError;
    }
  }

<<<<<<< HEAD
  async post<T, D = unknown>(endpoint: string, data: D): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
=======
  async post<T, D = unknown>(
    endpoint: string,
    data: D
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
>>>>>>> birttany_front/main
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if ((error as ApiError).statusCode) {
        throw error;
      }
      throw {
<<<<<<< HEAD
        message: 'Error de conexión con el servidor',
=======
        message: "Error de conexión con el servidor",
>>>>>>> birttany_front/main
        statusCode: 0,
      } as ApiError;
    }
  }

<<<<<<< HEAD
  async patch<T, D = unknown>(endpoint: string, data: D): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
=======
  async patch<T, D = unknown>(
    endpoint: string,
    data: D
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
>>>>>>> birttany_front/main
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if ((error as ApiError).statusCode) {
        throw error;
      }
      throw {
<<<<<<< HEAD
        message: 'Error de conexión con el servidor',
=======
        message: "Error de conexión con el servidor",
>>>>>>> birttany_front/main
        statusCode: 0,
      } as ApiError;
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
<<<<<<< HEAD
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
=======
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
>>>>>>> birttany_front/main
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      if ((error as ApiError).statusCode) {
        throw error;
      }
      throw {
<<<<<<< HEAD
        message: 'Error de conexión con el servidor',
=======
        message: "Error de conexión con el servidor",
>>>>>>> birttany_front/main
        statusCode: 0,
      } as ApiError;
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
