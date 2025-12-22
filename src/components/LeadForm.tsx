"use client";

import { useState } from "react";
import { Lead, SEDES, MEDIOS_CONTACTO, PRODUCTOS } from "@/models/Lead";
import { LeadController } from "@/controllers/LeadController";
import styles from "./LeadForm.module.css";

export default function LeadForm() {
  const [formData, setFormData] = useState<Partial<Lead>>({
    nombreCompleto: "",
    edad: undefined,
    telefono: "",
    modalidad: undefined,
    sede: "",
    medioContacto: "",
    producto: "",
    aceptaContacto: false,
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "edad"
            ? value
              ? parseInt(value)
              : undefined
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsSubmitting(true);

    const result = await LeadController.submitLead(formData as Lead);

    if (result.success) {
      setSubmitSuccess(true);
      setFormData({
        nombreCompleto: "",
        edad: undefined,
        telefono: "",
        modalidad: undefined,
        sede: "",
        medioContacto: "",
        producto: "",
        aceptaContacto: false,
      });
      setTimeout(() => setSubmitSuccess(false), 5000);
    } else {
      setErrors([result.message]);
    }
    setIsSubmitting(false);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={styles.formTitle}>Solicita Información</h3>

      {/* Nombre Completo */}
      <div className={styles.formGroup}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            id="nombreCompleto"
            name="nombreCompleto"
            value={formData.nombreCompleto}
            onChange={handleChange}
            className={styles.input}
            placeholder=" "
            required
          />
          <label htmlFor="nombreCompleto" className={styles.label}>
            Nombre y Apellido <span className={styles.required}>*</span>
          </label>
        </div>
      </div>

      {/* Edad */}
      <div className={styles.formGroup}>
        <div className={styles.inputWrapper}>
          <input
            type="number"
            id="edad"
            name="edad"
            value={formData.edad || ""}
            onChange={handleChange}
            className={styles.input}
            placeholder=" "
            min="4"
            max="100"
            required
          />
          <label htmlFor="edad" className={styles.label}>
            Edad <span className={styles.required}>*</span>
          </label>
        </div>
      </div>

      {/* Teléfono */}
      <div className={styles.formGroup}>
        <div className={styles.inputWrapper}>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className={styles.input}
            placeholder=" "
            required
          />
          <label htmlFor="telefono" className={styles.label}>
            Teléfono / WhatsApp <span className={styles.required}>*</span>
          </label>
        </div>
      </div>

      {/* Modalidad */}
      <div className={styles.formGroup}>
        <div className={styles.inputWrapper}>
          <select
            id="modalidad"
            name="modalidad"
            value={formData.modalidad || ""}
            onChange={handleChange}
            className={styles.select}
            required
          >
            <option value="" disabled hidden></option>
            <option value="Virtual">Virtual</option>
            <option value="Presencial">Presencial</option>
          </select>
          <label htmlFor="modalidad" className={styles.label}>
            Modalidad <span className={styles.required}>*</span>
          </label>
        </div>
      </div>

      {/* Sede */}
      <div className={styles.formGroup}>
        <div className={styles.inputWrapper}>
          <select
            id="sede"
            name="sede"
            value={formData.sede || ""}
            onChange={handleChange}
            className={styles.select}
            required
          >
            <option value="" disabled hidden></option>
            {SEDES.map((sede) => (
              <option key={sede} value={sede}>
                {sede}
              </option>
            ))}
          </select>
          <label htmlFor="sede" className={styles.label}>
            Sede <span className={styles.required}>*</span>
          </label>
        </div>
      </div>

      {/* Medio de Contacto */}
      <div className={styles.formGroup}>
        <div className={styles.inputWrapper}>
          <select
            id="medioContacto"
            name="medioContacto"
            value={formData.medioContacto || ""}
            onChange={handleChange}
            className={styles.select}
            required
          >
            <option value="" disabled hidden></option>
            {MEDIOS_CONTACTO.map((medio) => (
              <option key={medio} value={medio}>
                {medio}
              </option>
            ))}
          </select>
          <label htmlFor="medioContacto" className={styles.label}>
            ¿Cómo te enteraste? <span className={styles.required}>*</span>
          </label>
        </div>
      </div>

      {/* Programa */}
      <div className={styles.formGroup}>
        <div className={styles.inputWrapper}>
          <select
            id="producto"
            name="producto"
            value={formData.producto || ""}
            onChange={handleChange}
            className={styles.select}
            required
          >
            <option value="" disabled hidden></option>
            {PRODUCTOS.map((prod) => (
              <option key={prod} value={prod}>
                {prod}
              </option>
            ))}
          </select>
          <label htmlFor="producto" className={styles.label}>
            Programa de Interés <span className={styles.required}>*</span>
          </label>
        </div>
      </div>

      {/* Checkbox y Mensajes */}
      <div className={styles.checkboxGroup}>
        <input
          type="checkbox"
          id="aceptaContacto"
          name="aceptaContacto"
          checked={formData.aceptaContacto}
          onChange={handleChange}
          className={styles.checkbox}
          required
        />
        <label htmlFor="aceptaContacto" className={styles.checkboxLabel}>
          Acepto ser contactado por Brittany Group
        </label>
      </div>

      {errors.length > 0 && (
        <div className={styles.errorBox}>
          {errors.map((error, i) => (
            <p key={i} className={styles.errorText}>
              {error}
            </p>
          ))}
        </div>
      )}

      {submitSuccess && (
        <div className={styles.successBox}>
          ¡Gracias! Te contactaremos pronto.
        </div>
      )}

      <button
        type="submit"
        className={`btn btn-primary ${styles.submitBtn}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Enviando..." : "Quiero información"}
      </button>
    </form>
  );
}