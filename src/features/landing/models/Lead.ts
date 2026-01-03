// Lead Model - Domain Entity

export const PRODUCTOS = [
  "Curso de 1 año",
  "Curso de 18 meses",
  "Curso kids",
  "Curso prekids",
  "Examen internacional British council",
  "Preparación para exámenes internacionales",
  "Clases particulares",
  "Curso de inglés a distancia (edusoft)",
  "Curso TEFL",
  "Clubes de conversación",
  "Programa au pair",
  "Programa viajes 360",
];

export interface Lead {
  id?: string;
  nombreCompleto: string;
  edad: number;
  telefono: string;
  modalidad: "Virtual" | "Presencial";
  sede: string;
  medioContacto: string;
  producto: string;
  aceptaContacto: boolean;
  fechaRegistro?: Date;
}

export type Modalidad = "Virtual" | "Presencial";

export type Sede =
  | "Lima - Miraflores"
  | "Lima - Lince"
  | "Arequipa - Bustamante"
  | "Arequipa - San José"
  | "Arequipa - Umacollo"
  | "Arequipa - Cayma"
  | "Arequipa - Bustamante Kids";

export type MedioContacto =
  | "TikTok"
  | "Instagram"
  | "Facebook"
  | "Google"
  | "Recomendación"
  | "Volante"
  | "Otro";

export const SEDES: Sede[] = [
  "Lima - Miraflores",
  "Lima - Lince",
  "Arequipa - Bustamante",
  "Arequipa - San José",
  "Arequipa - Umacollo",
  "Arequipa - Cayma",
  "Arequipa - Bustamante Kids",
];

export const MEDIOS_CONTACTO: MedioContacto[] = [
  "TikTok",
  "Instagram",
  "Facebook",
  "Google",
  "Recomendación",
  "Volante",
  "Otro",
];
