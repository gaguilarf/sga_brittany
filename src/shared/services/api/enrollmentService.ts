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
};
