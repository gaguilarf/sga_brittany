import { apiClient } from "./client";
import {
  CreateEnrollmentDto,
  EnrollmentResponse,
} from "@/features/matriculas/models/EnrollmentModels";

export const EnrollmentService = {
  async create(data: CreateEnrollmentDto): Promise<EnrollmentResponse> {
    const res = await apiClient.post<EnrollmentResponse>("/enrollments", data);
    if (!res.data) throw new Error("Error creating enrollment");
    return res.data;
  },

  async getByStudentId(studentId: number): Promise<EnrollmentResponse[]> {
    // Using getAll + Filter by default to avoid 404s in console while backend is being updated
    const all = await this.getAll();
    return all.filter((e) => e.studentId === studentId);
  },

  async getAll(): Promise<EnrollmentResponse[]> {
    const res = await apiClient.get<EnrollmentResponse[]>("/enrollments");
    return res.data || [];
  },

  async getAccountStatement(id: number): Promise<any> {
    const res = await apiClient.get(`/enrollments/${id}/account-statement`);
    return res.data;
  },
};
