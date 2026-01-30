import { apiClient } from "./client";
import { DebtResponse } from "@/features/matriculas/models/EnrollmentModels";

export const DebtService = {
  async getByEnrollmentId(enrollmentId: number): Promise<DebtResponse[]> {
    const res = await apiClient.get<DebtResponse[]>(
      `/debts/enrollment/${enrollmentId}`,
    );
    return res.data || [];
  },

  async getById(id: number): Promise<DebtResponse> {
    const res = await apiClient.get<DebtResponse>(`/debts/${id}`);
    if (!res.data) throw new Error("Error fetching debt");
    return res.data;
  },
};
