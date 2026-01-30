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

export interface UpdateStudentDto {
  nombre?: string;
  dni?: string;
  fechaNacimiento?: string;
  edad?: number;
  distrito?: string;
  celularAlumno?: string;
  celularApoderado?: string;
  correo?: string;
  active?: boolean;
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
  duracionMeses?: number;
  active: boolean;
}

export interface Course {
  id: number;
  name: string;
  active: boolean;
}

export interface Level {
  id: number;
  courseId: number;
  nombreNivel: string;
  orden: number;
  duracionMeses: number;
  active: boolean;
}

export interface Cycle {
  id: number;
  levelId: number;
  nombreCiclo: string;
  orden: number;
  active: boolean;
}

export interface Product {
  id: number;
  name: string;
  requiresSchedule: boolean;
  requiresExamDate: boolean;
  active: boolean;
}

export interface CreateEnrollmentDto {
  studentId: number;
  campusId: number;
  planId?: number;
  courseId?: number;
  modalidad?: string;
  horario?: string;
  initialLevelId?: number;
  initialCycleId?: number;
  tipoInscripcion?: string;
  advisorId: number;
  origen?: string;
  numeroBoleta?: string;
  saldo?: number;
  enrollmentType?: "PLAN" | "PRODUCT";
  productId?: number;
  examDate?: string;
}

export interface EnrollmentResponse {
  id: number;
  studentId: number;
  campusId: number;
  planId: number;
  courseId?: number;
  modalidad?: string;
  horario?: string;
  initialLevelId?: number;
  initialCycleId?: number;
  tipoInscripcion?: string;
  enrollmentType: "PLAN" | "PRODUCT";
  productId?: number;
  examDate?: string;
  advisorId: number;
  origen?: string;
  numeroBoleta?: string;
  saldo: number;
  saldoFavor: number;
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
  debtId?: number;
  esAdelantado?: boolean;
  mesesAdelantados?: { mes: string; monto: number }[];
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
export interface DebtResponse {
  id: number;
  enrollmentId: number;
  tipoDeuda: string;
  concepto: string;
  monto: number;
  fechaVencimiento: string;
  mesAplicado?: string;
  estado: "PENDIENTE" | "PAGADO_PARCIAL" | "PAGADO" | "VENCIDO" | "ANULADO";
  active: boolean;
  createdAt: string;
}
