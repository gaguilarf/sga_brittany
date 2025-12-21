// Lead Controller - Business Logic
import { Lead } from '@/models/Lead';

export class LeadController {
    // Validate lead data
    static validateLead(lead: Partial<Lead>): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!lead.nombreCompleto || lead.nombreCompleto.trim().length < 3) {
            errors.push('El nombre completo debe tener al menos 3 caracteres');
        }

        if (!lead.edad || lead.edad < 4 || lead.edad > 100) {
            errors.push('La edad debe estar entre 4 y 100 años');
        }

        if (!lead.telefono || !/^\+?\d{9,15}$/.test(lead.telefono.replace(/\s/g, ''))) {
            errors.push('El teléfono debe tener entre 9 y 15 dígitos');
        }

        if (!lead.modalidad) {
            errors.push('Debe seleccionar una modalidad');
        }

        if (!lead.sede) {
            errors.push('Debe seleccionar una sede');
        }

        if (!lead.medioContacto) {
            errors.push('Debe indicar cómo se enteró de nosotros');
        }

        if (!lead.aceptaContacto) {
            errors.push('Debe aceptar ser contactado');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    // Submit lead (placeholder for future API integration)
    static async submitLead(lead: Lead): Promise<{ success: boolean; message: string }> {
        try {
            // Validate first
            const validation = this.validateLead(lead);
            if (!validation.isValid) {
                return {
                    success: false,
                    message: validation.errors.join(', '),
                };
            }

            // TODO: Replace with actual API call
            console.log('Lead submitted:', lead);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            return {
                success: true,
                message: 'Te contactaremos a la brevedad posible',
            };
        } catch (error) {
            return {
                success: false,
                message: 'Error al enviar el formulario. Por favor, intenta nuevamente.',
            };
        }
    }
}
