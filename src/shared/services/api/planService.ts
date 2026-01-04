import { apiClient } from "./client";
import { Plan } from "@/features/matriculas/models/EnrollmentModels";

export const PlanService = {
  async getAll(): Promise<Plan[]> {
    const res = await apiClient.get<Plan[]>("/plans");
    return res.data || [];
  },

  async getActive(): Promise<Plan[]> {
    const res = await apiClient.get<Plan[]>("/plans/active");
    return res.data || [];
  },
};
