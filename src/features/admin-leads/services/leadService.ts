import { apiClient } from "@/shared/services/api/client";

export interface Lead {
  id: string;
  nombreCompleto: string;
  edad: number;
  telefono: string;
  modalidad: string;
  sede: string;
  medioContacto: string;
  producto: string;
  aceptaContacto?: boolean;
  asesor: string;
  fechaRegistro: string;
}

export const getLeads = async (): Promise<Lead[]> => {
  try {
    const response = await apiClient.get<Lead[]>("/leads");
    return response.data || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

/**
 * Actualiza un lead existente mediante el método PATCH
 */
export const patchLead = async (
  id: string,
  data: Partial<Lead>,
): Promise<Lead> => {
  try {
    const response = await apiClient.patch<Lead, Partial<Lead>>(
      `/leads/${id}`,
      data,
    );
    if (!response.data) throw new Error("No se pudo actualizar el lead");
    return response.data;
  } catch (error) {
    console.error("Error en patchLead:", error);
    throw error;
  }
};

/**
 * Crea un nuevo lead en el sistema
 */
export const postLead = async (
  data: Omit<Lead, "id" | "fechaRegistro" | "asesor">,
): Promise<Lead> => {
  try {
    const response = await apiClient.post<Lead, any>("/leads", {
      ...data,
      aceptaContacto: data.aceptaContacto ?? true,
    });
    if (!response.data) throw new Error("No se pudo registrar el lead");
    return response.data;
  } catch (error) {
    console.error("Error en postLead:", error);
    throw error;
  }
};

/**
 * Limpia los leads de prueba (Uso interno)
 */
export const cleanupLeads = async (): Promise<void> => {
  try {
    await apiClient.delete("/leads/cleanup/test-data");
  } catch (error) {
    console.error("Error al limpiar leads:", error);
    throw error;
  }
};
