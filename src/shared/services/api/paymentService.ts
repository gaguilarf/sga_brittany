import { apiClient } from "./client";
import {
  CreatePaymentDto,
  PaymentResponse,
} from "@/features/matriculas/models/EnrollmentModels";

export const PaymentService = {
  async create(data: CreatePaymentDto): Promise<PaymentResponse> {
    const res = await apiClient.post<PaymentResponse>("/payments", data);
    if (!res.data) throw new Error("Error creating payment");
    return res.data;
  },

  async getByEnrollmentId(enrollmentId: number): Promise<PaymentResponse[]> {
    // Using getAll + Filter by default to avoid 404s in console while backend is being updated
    const all = await this.getAll();
    return all.filter((p) => p.enrollmentId === enrollmentId);
  },

  async getAll(): Promise<PaymentResponse[]> {
    const res = await apiClient.get<PaymentResponse[]>("/payments");
    return res.data || [];
  },
};
