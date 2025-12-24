import { apiClient, ApiError } from './client';

// DTOs matching the NestJS API
export interface CreateLeadDto {
    nombreCompleto: string;
    edad: number;
    telefono: string;
    modalidad: string;
    sede: string;
    medioContacto: string;
    producto: string;
    aceptaContacto: boolean;
}

export interface LeadResponseDto {
    id: string;
    nombreCompleto: string;
    edad: number;
    telefono: string;
    modalidad: string;
    sede: string;
    medioContacto: string;
    producto: string;
    aceptaContacto: boolean;
    fechaRegistro: string;
}

export interface UpdateLeadDto {
    nombreCompleto?: string;
    edad?: number;
    telefono?: string;
    modalidad?: string;
    sede?: string;
    medioContacto?: string;
    producto?: string;
    aceptaContacto?: boolean;
}

export class LeadApi {
    /**
     * Create a new lead
     * POST /api/leads
     */
    static async createLead(data: CreateLeadDto): Promise<LeadResponseDto> {
        try {
            const response = await apiClient.post<LeadResponseDto, CreateLeadDto>('/leads', data);
            if (!response.data) {
                throw new Error('No se recibió respuesta del servidor');
            }
            return response.data;
        } catch (error) {
            const apiError = error as ApiError;
            throw apiError;
        }
    }

    /**
     * Get all leads
     * GET /api/leads
     */
    static async getAllLeads(): Promise<LeadResponseDto[]> {
        try {
            const response = await apiClient.get<LeadResponseDto[]>('/leads');
            if (!response.data) {
                throw new Error('No se recibió respuesta del servidor');
            }
            return response.data;
        } catch (error) {
            const apiError = error as ApiError;
            throw apiError;
        }
    }

    /**
     * Get a lead by ID
     * GET /api/leads/{id}
     */
    static async getLeadById(id: string): Promise<LeadResponseDto> {
        try {
            const response = await apiClient.get<LeadResponseDto>(`/leads/${id}`);
            if (!response.data) {
                throw new Error('No se recibió respuesta del servidor');
            }
            return response.data;
        } catch (error) {
            const apiError = error as ApiError;
            throw apiError;
        }
    }

    /**
     * Update a lead
     * PATCH /api/leads/{id}
     */
    static async updateLead(id: string, data: UpdateLeadDto): Promise<LeadResponseDto> {
        try {
            const response = await apiClient.patch<LeadResponseDto, UpdateLeadDto>(`/leads/${id}`, data);
            if (!response.data) {
                throw new Error('No se recibió respuesta del servidor');
            }
            return response.data;
        } catch (error) {
            const apiError = error as ApiError;
            throw apiError;
        }
    }

    /**
     * Delete a lead
     * DELETE /api/leads/{id}
     */
    static async deleteLead(id: string): Promise<void> {
        try {
            await apiClient.delete(`/leads/${id}`);
        } catch (error) {
            const apiError = error as ApiError;
            throw apiError;
        }
    }
}
