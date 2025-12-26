export interface Lead {
  id: string;
  nombreCompleto: string;
  edad: number;
  telefono: string;
  modalidad: string;
  sede: string;
  medioContacto: string;
  producto: string;
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
