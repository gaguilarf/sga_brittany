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
  fechaRegistro: string;
}

export const getLeads = async (): Promise<Lead[]> => {
  try {
    const response = await fetch("https://api.brittanygroup.edu.pe/api/leads");
    if (!response.ok) throw new Error("Error al obtener leads");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

/**
 * Actualiza un lead existente mediante el método PATCH
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
  } catch (error) {
    console.error("Error en patchLead:", error);
    throw error;
  }
};
