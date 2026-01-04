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
};
