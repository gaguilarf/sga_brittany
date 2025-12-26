// src/features/admin-leads/components/EditLeadModal/EditLeadModal.tsx
import { useState } from "react";
import { Lead } from "../../services/leadService";
import {
  SEDES,
  MEDIOS_CONTACTO,
  PRODUCTOS,
} from "@/features/landing/models/Lead";
import styles from "./EditLeadModal.module.css";

interface Props {
  lead: Lead;
  onClose: () => void;
  onSave: (updatedLead: Lead) => void;
}

export default function EditLeadModal({ lead, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<Lead>(lead);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "edad" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Editar Información del Lead</h3>
          <button onClick={onClose} className={styles.closeX}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.gridForm}>
          {/* Nombre y Edad */}
          <div className={styles.field}>
            <label>Nombre Completo</label>
            <input
              type="text"
              name="nombreCompleto"
              value={formData.nombreCompleto}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Edad</label>
            <input
              type="number"
              name="edad"
              value={formData.edad}
              onChange={handleChange}
              required
            />
          </div>

          {/* Teléfono y Modalidad */}
          <div className={styles.field}>
            <label>Teléfono</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Modalidad</label>
            <select
              name="modalidad"
              value={formData.modalidad}
              onChange={handleChange}
              required
            >
              <option value="Virtual">Virtual</option>
              <option value="Presencial">Presencial</option>
            </select>
          </div>

          {/* Sede y Producto */}
          <div className={styles.field}>
            <label>Sede</label>
            <select
              name="sede"
              value={formData.sede}
              onChange={handleChange}
              required
            >
              {SEDES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label>Programa</label>
            <select
              name="producto"
              value={formData.producto}
              onChange={handleChange}
              required
            >
              {PRODUCTOS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Medio de Contacto */}
          <div className={`${styles.field} ${styles.fullWidth}`}>
            <label>Medio de Contacto</label>
            <select
              name="medioContacto"
              value={formData.medioContacto}
              onChange={handleChange}
              required
            >
              {MEDIOS_CONTACTO.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelBtn}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.saveBtn}>
              Actualizar Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
