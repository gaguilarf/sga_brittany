"use client";

import { useState } from "react";
import { Phone, User } from "lucide-react";
import styles from "./LeadForm.module.css";
import { postLead } from "../../services/leadService";

// Standardized constants matching backend validation
const SEDES = [
  "Lima - Miraflores",
  "Lima - Lince",
  "Arequipa - José Luis Bustamante R.",
  "Arequipa - San José",
  "Arequipa - Umacollo",
  "Arequipa - Cayma",
  "Arequipa - Bustamante Kids",
];

const MEDIOS_CONTACTO = [
  "TikTok",
  "Instagram",
  "Facebook",
  "Google",
  "Recomendación",
  "Volante",
  "Otro",
];

const PRODUCTOS = [
  "Curso de 1 año",
  "Curso de 18 meses",
  "Curso kids",
  "Curso prekids",
  "Examen internacional British council",
  "Preparación para exámenes internacionales",
  "Clases particulares",
  "Curso de inglés a distancia (edusoft)",
  "Curso TEFL",
  "Clubes de conversación",
  "Programa au pair",
  "Programa viajes 360",
];

export default function LeadForm() {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [formData, setFormData] = useState({
    nombreCompleto: "",
    telefono: "",
    edad: "",
    modalidad: "Virtual",
    sede: SEDES[0],
    medioContacto: "",
    programaInteres: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        nombreCompleto: formData.nombreCompleto,
        telefono: formData.telefono,
        edad: Number(formData.edad),
        modalidad: formData.modalidad,
        sede: formData.sede,
        medioContacto: formData.medioContacto,
        producto: formData.programaInteres,
        aceptaContacto: true,
      };

      await postLead(payload);

      setNotification({
        message: "¡Lead registrado con éxito!",
        type: "success",
      });

      // Clear form
      setFormData({
        nombreCompleto: "",
        telefono: "",
        edad: "",
        modalidad: "Virtual",
        sede: SEDES[0],
        medioContacto: "",
        programaInteres: "",
      });

      setTimeout(() => setNotification(null), 3000);
    } catch (error: any) {
      setNotification({
        message: error.message || "Error al registrar el lead",
        type: "error",
      });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.leadFormContainer} onSubmit={handleSubmit}>
      <div className={styles.sectionGrid}>
        {/* Left Card: Info and Sources */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Información del Lead</h3>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nombre Completo</label>
                  <input
                    type="text"
                    name="nombreCompleto"
                    placeholder="Ej: María Pérez"
                    className={styles.input}
                    value={formData.nombreCompleto}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Teléfono</label>
                  <div className={styles.inputWithIcon}>
                    <Phone className={styles.inputIcon} size={18} />
                    <input
                      type="text"
                      name="telefono"
                      placeholder="Ej: +51 987 654 321"
                      className={styles.input}
                      value={formData.telefono}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Edad</label>
                  <input
                    type="number"
                    name="edad"
                    placeholder="Ej: 18"
                    className={styles.input}
                    value={formData.edad}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Modalidad de Interés</label>
                  <select
                    name="modalidad"
                    className={styles.select}
                    value={formData.modalidad}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Presencial">Presencial</option>
                    <option value="Virtual">Virtual</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Sede</label>
                  <select
                    name="sede"
                    className={styles.select}
                    value={formData.sede}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" disabled>
                      Seleccionar Sede
                    </option>
                    {SEDES.map((sede) => (
                      <option key={sede} value={sede}>
                        {sede}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    ¿Cómo te enteraste? (select obligatorio)
                  </label>
                  <select
                    name="medioContacto"
                    className={styles.select}
                    value={formData.medioContacto}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccione una opción</option>
                    {MEDIOS_CONTACTO.map((medio) => (
                      <option key={medio} value={medio}>
                        {medio}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Programa de Interés (select obligatorio)
                  </label>
                  <select
                    name="programaInteres"
                    className={styles.select}
                    value={formData.programaInteres}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccione una opción</option>
                    {PRODUCTOS.map((producto) => (
                      <option key={producto} value={producto}>
                        {producto}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.btnSubmit} disabled={loading}>
          {loading ? "REGISTRANDO..." : "REGISTRAR LEAD"}
        </button>
      </div>

      {notification && (
        <div className={`${styles.toast} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}
    </form>
  );
}
