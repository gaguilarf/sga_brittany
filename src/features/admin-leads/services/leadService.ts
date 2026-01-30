<<<<<<< HEAD
=======
import { apiClient } from "@/shared/services/api/client";

>>>>>>> birttany_front/main
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
<<<<<<< HEAD
=======
  asesor: string;
>>>>>>> birttany_front/main
  fechaRegistro: string;
}

export const getLeads = async (): Promise<Lead[]> => {
  try {
<<<<<<< HEAD
    const response = await fetch("https://api.brittanygroup.edu.pe/api/leads");
    if (!response.ok) throw new Error("Error al obtener leads");
    return await response.json();
=======
    const response = await apiClient.get<Lead[]>("/leads");
    return response.data || [];
>>>>>>> birttany_front/main
  } catch (error) {
    console.error(error);
    return [];
  }
};

/**
 * Actualiza un lead existente mediante el método PATCH
<<<<<<< HEAD
 * @param id UUID único del lead
 * @param data Objeto con los campos a actualizar
 */

export const patchLead = async (
  id: string,
  data: Partial<Lead>
): Promise<Lead> => {
  try {
    const response = await fetch(
      `https://api.brittanygroup.edu.pe/api/leads/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Error al actualizar el lead");
    }

    return await response.json();
=======
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
>>>>>>> birttany_front/main
  } catch (error) {
    console.error("Error en patchLead:", error);
    throw error;
  }
};
<<<<<<< HEAD
=======

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
>>>>>>> birttany_front/main
