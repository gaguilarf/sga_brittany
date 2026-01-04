export interface Student {
  id: number;
  nombre: string;
  dni?: string;
  fechaNacimiento?: string;
  edad?: number;
  distrito?: string;
  celularAlumno?: string;
  celularApoderado?: string;
  correo?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentDto {
  nombre: string;
  dni?: string;
  fechaNacimiento?: string;
  edad?: number;
  distrito?: string;
  celularAlumno?: string;
  celularApoderado?: string;
  correo?: string;
}

export interface Campus {
  id: number;
  name: string;
  address?: string;
  active: boolean;
}

export interface Plan {
  id: number;
  name: string;
  description?: string;
  costoMatricula?: number;
  costoPension?: number;
  active: boolean;
}

export interface CreateEnrollmentDto {
  studentId: number;
  campusId: number;
  planId: number;
  modalidad?: string;
  horario?: string;
  nivel?: string;
  tipoInscripcion?: string;
  advisorId: number;
  origen?: string;
  numeroBoleta?: string;
  saldo?: number;
}

export interface EnrollmentResponse {
  id: number;
  studentId: number;
  campusId: number;
  planId: number;
  modalidad?: string;
  horario?: string;
  nivel?: string;
  tipoInscripcion?: string;
  advisorId: number;
  origen?: string;
  numeroBoleta?: string;
  saldo: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDto {
  enrollmentId: number;
  monto: number;
  tipo: string;
  metodo: string;
  numeroBoleta: string;
  fechaPago: string;
  campusId: number;
}

export interface PaymentResponse {
  id: number;
  enrollmentId: number;
  monto: number;
  tipo: string;
  metodo: string;
  numeroBoleta: string;
  fechaPago: string;
  campusId: number;
  createdAt: string;
}
