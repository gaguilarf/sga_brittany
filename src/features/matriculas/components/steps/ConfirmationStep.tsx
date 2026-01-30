import styles from "../page.module.css";
import {
  Campus,
  Plan,
  Course,
  Level,
  Cycle,
  Product,
} from "@/features/matriculas/models/EnrollmentModels";
import { User, BookOpen, CreditCard, Receipt, Printer } from "lucide-react";
import { useAuth } from "@/shared/contexts/AuthContext";

interface Props {
  formData: any;
  campuses: Campus[];
  plans: Plan[];
  courses: Course[];
  levels: Level[];
  cycles: Cycle[];
  products: Product[];
}

export const ConfirmationStep = ({
  formData,
  campuses,
  plans,
  courses,
  levels,
  cycles,
  products,
}: Props) => {
  const { user } = useAuth();

  const selectedCampus = campuses.find(
    (c) => c.id.toString() === formData.campusId,
  );
  const selectedPlan = plans.find((p) => p.id.toString() === formData.planId);
  const selectedProduct = products.find(
    (p) => p.id.toString() === formData.productId,
  );
  const selectedCourse = courses.find(
    (c) => c.id.toString() === formData.courseId,
  );
  const selectedLevel = levels.find(
    (l) => l.id.toString() === formData.initialLevelId,
  );
  const selectedCycle = cycles.find(
    (c) => c.id.toString() === formData.initialCycleId,
  );
  const totalPaid = formData.payments.reduce(
    (acc: number, p: any) => acc + (Number(p.monto) || 0),
    0,
  );
  const currentDate = new Date().toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.confirmationWrapper}>
      <div className={styles.actionsHeader}>
        <button className={styles.actionBtn} onClick={handlePrint}>
          <Printer size={18} />
          Imprimir Resumen
        </button>
      </div>

      <div className={styles.printableArea}>
        <div className={styles.confirmationGrid}>
          {/* Card: Datos del Estudiante */}
          <section className={styles.summaryCard}>
            <div className={styles.cardHeader}>
              <User size={20} />
              <h4>Datos del Estudiante</h4>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Nombre Completo:</span>
                <span className={styles.infoValue}>{formData.nombre}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>DNI:</span>
                <span className={styles.infoValue}>{formData.dni}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Edad / F. Nac:</span>
                <span className={styles.infoValue}>
                  {formData.edad} años{" "}
                  {formData.fechaNacimiento
                    ? `(${formData.fechaNacimiento})`
                    : ""}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Celular Alumno:</span>
                <span className={styles.infoValue}>
                  {formData.celularAlumno}
                </span>
              </div>
              {formData.celularApoderado && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Celular Apoderado:</span>
                  <span className={styles.infoValue}>
                    {formData.celularApoderado}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Card: Datos de la Matrícula */}
          <section className={styles.summaryCard}>
            <div className={styles.cardHeader}>
              <BookOpen size={20} />
              <h4>Detalle de Matrícula</h4>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Sede:</span>
                <span className={styles.infoValue}>
                  {selectedCampus?.name || "N/A"}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Tipo de Matrícula:</span>
                <span className={styles.infoValue}>
                  {formData.enrollmentType === "PLAN"
                    ? "Plan Académico"
                    : "Producto / Servicio"}
                </span>
              </div>

              {formData.enrollmentType === "PLAN" ? (
                <>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Programa/Plan:</span>
                    <span className={styles.infoValue}>
                      {selectedPlan?.name || "N/A"}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Curso:</span>
                    <span className={styles.infoValue}>
                      {selectedCourse?.name || "N/A"}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Nivel / Ciclo:</span>
                    <span className={styles.infoValue}>
                      {selectedLevel?.nombreNivel || "N/A"} -{" "}
                      {selectedCycle?.nombreCiclo || "N/A"}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Producto:</span>
                    <span className={styles.infoValue}>
                      {selectedProduct?.name || "N/A"}
                    </span>
                  </div>
                  {formData.examDate && (
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Fecha de Examen:</span>
                      <span className={styles.infoValue}>
                        {formData.examDate}
                      </span>
                    </div>
                  )}
                </>
              )}

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Modalidad:</span>
                <span className={styles.infoValue}>{formData.modalidad}</span>
              </div>

              {(!selectedProduct?.requiresExamDate ||
                formData.enrollmentType === "PLAN") && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Horario:</span>
                  <span className={styles.infoValue}>
                    {formData.scheduleOption === "Otro"
                      ? `${formData.diaClase} ${formData.horaInicio}-${formData.horaFin}`
                      : formData.scheduleOption || "N/A"}
                  </span>
                </div>
              )}

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Asesor:</span>
                <span className={styles.infoValue}>
                  {user?.fullname || "N/A"}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Fecha Registro:</span>
                <span className={styles.infoValue}>{currentDate}</span>
              </div>
            </div>
          </section>

          {/* Card Full Width: Detalles de Pago */}
          <section className={`${styles.summaryCard} ${styles.fullWidth}`}>
            <div className={styles.cardHeader}>
              <CreditCard size={20} />
              <h4>Resumen Económico</h4>
              <div className={styles.boletaBadge}>
                <Receipt size={16} />
                Boleta: {formData.numeroBoleta}
              </div>
            </div>
            <div className={styles.cardContent}>
              <table className={styles.paymentsTable}>
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th>Método</th>
                    <th className={styles.textRight}>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.payments.map((p: any, i: number) => (
                    <tr key={i}>
                      <td>
                        <div className={styles.conceptCell}>
                          <span>{p.tipo}</span>
                          {p.tipo === "Mensualidad Adelantada" &&
                            p.mesesAdelantados &&
                            p.mesesAdelantados.length > 0 && (
                              <div className={styles.conceptDetails}>
                                {p.mesesAdelantados
                                  .map((m: any) => {
                                    const [year, month] = m.mes.split("-");
                                    return `${month}/${year}`;
                                  })
                                  .join(", ")}
                              </div>
                            )}
                        </div>
                      </td>
                      <td>{p.metodo}</td>
                      <td className={styles.textRight}>
                        S/. {Number(p.monto).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2} className={styles.totalLabel}>
                      TOTAL CANCELADO
                    </td>
                    <td className={styles.totalValue}>
                      S/. {totalPaid.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        </div>

        <div className={styles.confirmationNotice}>
          <p>
            Al hacer clic en <strong>Finalizar Matrícula</strong>, se procesará
            el registro oficial del estudiante y se generarán los comprobantes
            correspondientes. Por favor, verifique que toda la información sea
            correcta.
          </p>
        </div>
      </div>
    </div>
  );
};
