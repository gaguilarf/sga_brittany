// Lead Model - Domain Entity
export interface Lead {
  id?: string;
  nombreCompleto: string;
  edad: number;
  telefono: string;
  modalidad: 'Virtual' | 'Presencial';
  sede: string;
  medioContacto: string;
  aceptaContacto: boolean;
  fechaRegistro?: Date;
}

export type Modalidad = 'Virtual' | 'Presencial';

export type Sede = 
  | 'Lima - Miraflores'
  | 'Lima - Lince'
  | 'Arequipa - Bustamante'
  | 'Arequipa - Centro'
  | 'Arequipa - Cayma'
  | 'Arequipa - Umacollo'
  | 'Arequipa - Brittany Kids (JLByR)';

export type MedioContacto = 
  | 'TikTok'
  | 'Instagram'
  | 'Facebook'
  | 'Google'
  | 'Recomendación'
  | 'Volante'
  | 'Otro';

export const SEDES: Sede[] = [
  'Lima - Miraflores',
  'Lima - Lince',
  'Arequipa - Bustamante',
  'Arequipa - Centro',
  'Arequipa - Cayma',
  'Arequipa - Umacollo',
  'Arequipa - Brittany Kids (JLByR)',
];

export const MEDIOS_CONTACTO: MedioContacto[] = [
  'TikTok',
  'Instagram',
  'Facebook',
  'Google',
  'Recomendación',
  'Volante',
  'Otro',
];
