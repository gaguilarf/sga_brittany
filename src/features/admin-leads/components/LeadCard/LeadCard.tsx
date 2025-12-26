// src/features/admin-leads/components/LeadCard/LeadCard.tsx
import { Lead } from "../../services/leadService";
import styles from "./LeadCard.module.css";

export default function LeadCard({ lead }: { lead: Lead }) {
  const fechaObj = new Date(lead.fechaRegistro);

  // Formato: "24 de diciembre de 2025"
  const fechaFormateada = fechaObj.toLocaleDateString("es-PE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Formato: "08:37 AM"
  const horaFormateada = fechaObj.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className={styles.card}>
      <div className={styles.info}>
        <p className={styles.mainInfo}>
          <strong>{lead.nombreCompleto}</strong> - {lead.producto}
        </p>
        <p className={styles.details}>
          {lead.telefono} | {lead.sede} | {lead.modalidad}
        </p>
        <p className={styles.timestamp}>
          <span>Fecha: {fechaFormateada}</span>
          <span className={styles.hour}>Hora: {horaFormateada}</span>
        </p>
      </div>

      <div className={styles.actions}>
        <button className={styles.editBtn}>editar</button>
        <button className={styles.deleteBtn}>eliminar</button>
      </div>
    </div>
  );
}
