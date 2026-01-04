import { apiClient } from "./client";
import {
  Student,
  CreateStudentDto,
} from "@/features/matriculas/models/EnrollmentModels";

export const StudentService = {
  async getAll(): Promise<Student[]> {
    const res = await apiClient.get<Student[]>("/students");
    return res.data || [];
  },

  async getActive(): Promise<Student[]> {
    const res = await apiClient.get<Student[]>("/students/active");
    return res.data || [];
  },

  async getById(id: number): Promise<Student> {
    const res = await apiClient.get<Student>(`/students/${id}`);
    if (!res.data) throw new Error("Student not found");
    return res.data;
  },

  async create(data: CreateStudentDto): Promise<Student> {
    const res = await apiClient.post<Student>("/students", data);
    if (!res.data) throw new Error("Error creating student");
    return res.data;
  },

  async getByDni(dni: string): Promise<Student | null> {
    const students = await this.getAll();
    return students.find((s) => s.dni === dni) || null;
  },
};
