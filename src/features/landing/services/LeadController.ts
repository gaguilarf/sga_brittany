// Lead Controller - Business Logic
import { Lead } from "../models/Lead";
import { LeadApi, ApiError } from "@/shared/services/api";

export class LeadController {
  // Validate lead data
  static validateLead(lead: Partial<Lead>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!lead.nombreCompleto || lead.nombreCompleto.trim().length < 3) {
      errors.push("El nombre completo debe tener al menos 3 caracteres");
    }

    if (!lead.edad || lead.edad < 4 || lead.edad > 100) {
      errors.push("La edad debe estar entre 4 y 100 años");
    }

    if (
      !lead.telefono ||
      !/^\+?\d{9,15}$/.test(lead.telefono.replace(/\s/g, ""))
    ) {
      errors.push("El teléfono debe tener entre 9 y 15 dígitos");
    }

    if (!lead.modalidad) {
      errors.push("Debe seleccionar una modalidad");
    }

    if (!lead.sede) {
      errors.push("Debe seleccionar una sede");
    }

    if (!lead.medioContacto) {
      errors.push("Debe indicar cómo se enteró de nosotros");
    }

    if (!lead.aceptaContacto) {
      errors.push("Debe aceptar ser contactado");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Submit lead to API
  static async submitLead(
    lead: Lead
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Validar primero (client-side validation)
      const validation = this.validateLead(lead);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.errors[0],
        };
      }

      // 2. Llamar a la API
      const response = await LeadApi.createLead({
        nombreCompleto: lead.nombreCompleto,
        edad: lead.edad,
        telefono: lead.telefono,
        modalidad: lead.modalidad,
        sede: lead.sede,
        medioContacto: lead.medioContacto,
        producto: lead.producto,
        aceptaContacto: lead.aceptaContacto,
      });

      console.log("Lead creado exitosamente:", response);

      return {
        success: true,
        message:
          "¡Registro exitoso! Un asesor de Brittany Group te contactará pronto.",
      };
    } catch (error) {
      console.error("Error al enviar lead:", error);

      const apiError = error as ApiError;

      // Mapear errores de la API a mensajes amigables
      if (apiError.statusCode === 400) {
        return {
          success: false,
          message: apiError.message || "Los datos ingresados no son válidos. Por favor verifica la información.",
        };
      }

      if (apiError.statusCode === 0) {
        return {
          success: false,
          message:
            "No se pudo conectar con el servidor. Por favor verifica tu conexión a internet.",
        };
      }

      return {
        success: false,
        message:
          "Hubo un problema al procesar tu solicitud. Por favor intenta nuevamente o contáctanos por WhatsApp.",
      };
    }
  }
}
