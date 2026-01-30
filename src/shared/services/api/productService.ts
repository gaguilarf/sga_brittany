import { apiClient } from "./client";
import { Product } from "@/features/matriculas/models/EnrollmentModels";

export const ProductService = {
  async getAll(): Promise<Product[]> {
    const res = await apiClient.get<Product[]>("/products");
    return res.data || [];
  },

  async getActive(): Promise<Product[]> {
    const res = await apiClient.get<Product[]>("/products/active");
    return res.data || [];
  },
};
