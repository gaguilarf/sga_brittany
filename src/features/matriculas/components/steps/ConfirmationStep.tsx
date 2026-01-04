import styles from "../page.module.css";
import { Campus, Plan } from "@/features/matriculas/models/EnrollmentModels";

interface Props {
  formData: any;
  campuses: Campus[];
  plans: Plan[];
}

export const ConfirmationStep = ({ formData, campuses, plans }: Props) => {
  return (
    <div className={styles.confirmationWrapper}>
      <section className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h3>Resumen de Matrícula</h3>
        </div>
        <div className={styles.sectionBody}>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <strong>Estudiante:</strong> {formData.nombre}
            </div>
            <div className={styles.summaryItem}>
              <strong>DNI:</strong> {formData.dni}
            </div>
            <div className={styles.summaryItem}>
              <strong>Sede:</strong>{" "}
              {campuses.find((c) => c.id.toString() === formData.campusId)
                ?.name || "No seleccionada"}
            </div>
            <div className={styles.summaryItem}>
              <strong>Plan:</strong>{" "}
              {plans.find((p) => p.id.toString() === formData.planId)?.name ||
                "No seleccionado"}
            </div>
            <div className={styles.summaryItem}>
              <strong>Modalidad:</strong> {formData.modalidad}
            </div>
            <div className={styles.summaryItem}>
              <strong>Nivel:</strong> {formData.nivel}
            </div>
            <div className={styles.summaryItem}>
              <strong>Tipo de Pago:</strong> {formData.tipoPago}
            </div>
            <div className={styles.summaryItem}>
              <strong>Método:</strong> {formData.metodoPago}
            </div>
            <div className={styles.summaryItem}>
              <strong>Monto:</strong> S/. {formData.monto}
            </div>
            <div className={styles.summaryItem}>
              <strong>Boleta:</strong> {formData.numeroBoleta || "N/A"}
            </div>
            <div className={styles.summaryItem}>
              <strong>Horario:</strong> {formData.diaClase}{" "}
              {formData.horaInicio}-{formData.horaFin}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
