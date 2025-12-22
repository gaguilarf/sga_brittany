// Lead Controller - Business Logic
import { generateClient } from "aws-amplify/api";
import type { Schema } from "../../amplify/data/resource";
import { Lead } from "@/models/Lead";

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

  // Submit lead (placeholder for future API integration)
  static async submitLead(
    lead: Lead
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Validar primero
      const validation = this.validateLead(lead);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.errors[0], // Mostramos el primer error para no saturar
        };
      }
      const client = generateClient<Schema>();

      // 2. LLAMADA REAL A AWS AMPLIFY
      const { data: newLead, errors } = await client.models.Lead.create({
        nombreCompleto: lead.nombreCompleto,
        edad: lead.edad,
        telefono: lead.telefono,
        modalidad: lead.modalidad,
        sede: lead.sede,
        medioContacto: lead.medioContacto,
        aceptaContacto: lead.aceptaContacto,
      });

      if (errors) {
        console.error("Amplify Errors:", errors);
        throw new Error("Error en la persistencia de datos");
      }

      return {
        success: true,
        message:
          "¡Registro exitoso! Un asesor de Brittany Group te contactará pronto.",
      };
    } catch (error) {
      console.error("Error detallado:", error);
      return {
        success: false,
        message:
          "Hubo un problema al conectar con el servidor. Inténtalo por WhatsApp.",
      };
    }
  }
}
