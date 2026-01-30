import { apiClient } from "./client";
import { Campus } from "@/features/matriculas/models/EnrollmentModels";

export const CampusService = {
  async getAll(): Promise<Campus[]> {
    const res = await apiClient.get<Campus[]>("/campuses");
    return res.data || [];
  },

  async getActive(): Promise<Campus[]> {
    const res = await apiClient.get<Campus[]>("/campuses/active");
    return res.data || [];
  },
};
