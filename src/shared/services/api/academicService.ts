import { apiClient } from "./client";
import {
  Course,
  Level,
  Cycle,
} from "@/features/matriculas/models/EnrollmentModels";

export const AcademicService = {
  async getCourses(): Promise<Course[]> {
    const response = await apiClient.get<Course[]>("/levels/courses");
    return response.data || [];
  },

  async getLevelsByCourse(courseId: number): Promise<Level[]> {
    const response = await apiClient.get<Level[]>(
      `/levels?courseId=${courseId}`,
    );
    return response.data || [];
  },

  async getCyclesByLevel(levelId: number): Promise<Cycle[]> {
    const response = await apiClient.get<Cycle[]>(
      `/levels/cycles?levelId=${levelId}`,
    );
    return response.data || [];
  },
};
