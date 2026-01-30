import React, { useState, useEffect } from "react";
import styles from "./AlumnoDetalle.module.css";
import { Alumno } from "./AlumnosPage";
import { StudentService } from "@/shared/services/api/studentService";
import { EnrollmentService } from "@/shared/services/api/enrollmentService";
import { CampusService } from "@/shared/services/api/campusService";
import { PlanService } from "@/shared/services/api/planService";
import { PaymentService } from "@/shared/services/api/paymentService";
import { DebtService } from "@/shared/services/api/debtService";
import { ProductService } from "@/shared/services/api/productService";
import {
  Loader2,
  X,
  Phone,
  User,
  Calendar,
  MapPin,
  Tag,
  GraduationCap,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { AcademicService } from "@/shared/services/api/academicService";
import PrepaymentForm from "./PrepaymentForm";
import {
  EnrollmentResponse,
  Campus,
  Plan,
  PaymentResponse,
  DebtResponse,
} from "@/features/matriculas/models/EnrollmentModels";

interface AlumnoDetalleProps {
  alumno: Alumno;
  onBack: () => void;
  onUpdate: (updatedAlumno: Alumno) => void;
}

const AlumnoDetalle: React.FC<AlumnoDetalleProps> = ({
  alumno: initialAlumno,
  onBack,
  onUpdate,
}) => {
  const [alumno, setAlumno] = useState<Alumno>(initialAlumno);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>(null); // Use any for extended fields
  const [isSaving, setIsSaving] = useState(false);
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [campus, setCampus] = useState<Campus | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [expandedPayments, setExpandedPayments] = useState<Set<number>>(
    new Set(),
  );
  const [prepaymentDetails, setPrepaymentDetails] = useState<
    Record<number, any[]>
  >({});
  const [debts, setDebts] = useState<DebtResponse[]>([]);
  const [consumos, setConsumos] = useState<any[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<any[]>([]);
  const [nettedPrepayments, setNettedPrepayments] = useState<any[]>([]);
  const [nettedDebts, setNettedDebts] = useState<any[]>([]);
  const [totalNettedSaldo, setTotalNettedSaldo] = useState(0);
  const [loadingDetails, setLoadingDetails] = useState(true);

  // Resolved names for display (Map of enrollmentId -> name info)
  const [resolvedEnrollmentData, setResolvedEnrollmentData] = useState<
    Record<
      number,
      {
        course?: string;
        level?: string;
        cycle?: string;
        product?: string;
        campusName?: string;
        planName?: string;
      }
    >
  >({});
  const [isPrepaymentModalOpen, setIsPrepaymentModalOpen] = useState(false);

  useEffect(() => {
    fetchStudentDetails();
  }, [alumno.id]);

  const fetchStudentDetails = async () => {
    setLoadingDetails(true);
    try {
      const studentData = await StudentService.getById(parseInt(alumno.id));
      // Update local student state with fresh data from DB
      const updatedAlumno: Alumno = {
        ...alumno,
        nombre: studentData.nombre,
        dni: studentData.dni || "",
        email: studentData.correo || "",
        celularAlumno: studentData.celularAlumno || "",
        distrito: studentData.distrito || "",
        fechaNacimiento: studentData.fechaNacimiento || "",
        celularApoderado: studentData.celularApoderado || "",
        estado: studentData.active ? "Activo" : "Inactivo",
      };
      setAlumno(updatedAlumno);

      const enrList = await EnrollmentService.getByStudentId(
        parseInt(alumno.id),
      );
      setEnrollments(enrList);

      if (enrList.length > 0) {
        // We still need one "main" enrollment for debts/payments UI for now, or we show all
        // Let's use the first active or latest for the global debts view
        const activeEnrollment =
          enrList.find((e) => e.active) || enrList[enrList.length - 1];

        const [paymentsData, debtsData, campuses, plans, courses, products] =
          await Promise.all([
            PaymentService.getByEnrollmentId(activeEnrollment.id),
            DebtService.getByEnrollmentId(activeEnrollment.id),
            CampusService.getAll(),
            PlanService.getAll(),
            AcademicService.getCourses(),
            ProductService.getAll(),
          ]);

        setCampus(
          campuses.find((c) => c.id === activeEnrollment.campusId) || null,
        );
        setPlan(plans.find((p) => p.id === activeEnrollment.planId) || null);
        setPayments(
          paymentsData.sort(
            (a, b) =>
              new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime(),
          ),
        );
        setDebts(debtsData.filter((d: any) => Number(d.monto) > 0));

        // Fetch Account Statement (Credits, Consumos, etc)
        try {
          const response = await fetch(
            `http://localhost:3002/api/enrollments/${activeEnrollment.id}/account-statement`,
            { credentials: "include" },
          );
          if (response.ok) {
            const statementData = await response.json();
            setConsumos(statementData.consumos || []);
            setMonthlySummary(statementData.monthlySummary || []);
            setNettedPrepayments(statementData.nettedPrepayments || []);
            setNettedDebts(statementData.nettedDebts || []);
            setTotalNettedSaldo(statementData.totalNettedSaldo || 0);
            // Update enrollment saldoFavor locally if needed
            const updatedEnrollments = enrList.map((e) =>
              e.id === activeEnrollment.id
                ? { ...e, saldoFavor: statementData.enrollment.saldoFavor }
                : e,
            );
            setEnrollments(updatedEnrollments);
          }
        } catch (err) {
          console.error("Error fetching account statement", err);
        }

        // Resolve info for ALL enrollments
        const resolvedMap: any = {};
        for (const enr of enrList) {
          const res: any = {};
          const enrCampus = campuses.find((c) => c.id === enr.campusId);
          res.campusName = enrCampus?.name || "N/A";

          if (enr.enrollmentType === "PLAN") {
            const enrPlan = plans.find((p) => p.id === enr.planId);
            res.planName = enrPlan?.name || "Plan Académico";

            if (enr.courseId) {
              const course = courses.find((c) => c.id === enr.courseId);
              res.course = course?.name;
            }
          } else {
            const product = products.find((p) => p.id === enr.productId);
            res.product = product?.name || "Producto / Servicio";
          }
          resolvedMap[enr.id] = res;
        }

        // Parallel resolve levels/cycles for PLAN enrollments
        await Promise.all(
          enrList
            .filter(
              (e) =>
                e.enrollmentType === "PLAN" && e.courseId && e.initialLevelId,
            )
            .map(async (e) => {
              try {
                const levels = await AcademicService.getLevelsByCourse(
                  e.courseId!,
                );
                const level = levels.find((l) => l.id === e.initialLevelId);
                if (level) {
                  resolvedMap[e.id].level = level.nombreNivel;
                  const cycles = await AcademicService.getCyclesByLevel(
                    level.id,
                  );
                  const cycle = cycles.find((c) => c.id === e.initialCycleId);
                  if (cycle) resolvedMap[e.id].cycle = cycle.nombreCiclo;
                }
              } catch (err) {
                console.error("Error resolving levels for enrollment", e.id);
              }
            }),
        );

        setResolvedEnrollmentData(resolvedMap);
      }
      return updatedAlumno;
    } catch (error: any) {
      console.error("Error fetching student details. Full error:", error);
      return null;
    } finally {
      setLoadingDetails(false);
    }
  };

  // Helper to open modal with current data
  const handleOpenEdit = async () => {
    try {
      const s = await StudentService.getById(parseInt(alumno.id));
      setEditForm({
        nombre: s.nombre,
        dni: s.dni || "",
        correo: s.correo || "",
        celularAlumno: s.celularAlumno || "",
        distrito: s.distrito || "",
        fechaNacimiento: s.fechaNacimiento || "",
        celularApoderado: s.celularApoderado || "",
        active: s.active,
      });
      setIsModalOpen(true);
    } catch (error) {
      alert("Error al cargar datos para editar");
    }
  };

  // Placeholder for missing DB data
  const academicPlaceholders = {
    asistencia: 0,
    faltas: "No registra faltas",
    observaciones: [],
  };

  // Filter for economic summary display
  const pendingDebts = debts.filter(
    (d) => d.estado !== "PAGADO" && d.estado !== "ANULADO",
  );
  const paidDebts = debts.filter((d) => d.estado === "PAGADO");
  const totalSaldo = pendingDebts.reduce((sum, d) => sum + Number(d.monto), 0);

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={onBack}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Volver a Lista de Alumnos
      </button>

      <header className={styles.header}>
        <div className={styles.headerTitleArea}>
          <h1>
            Detalle del Alumno
            <span
              className={`${styles.statusBadge} ${
                alumno.estado === "Activo" ? styles.activo : styles.inactivo
              }`}
            >
              {alumno.estado}
            </span>
          </h1>
          <p className={styles.subtitle}>
            ID Estudiante: {alumno.dni} |{" "}
            {enrollments.length > 0
              ? `Próximo pago: ${totalSaldo > 0 ? "Pendiente" : "Al día"}`
              : "Sin matrícula activa"}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnPrint}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Imprimir
          </button>
          <button className={styles.btnEdit} onClick={handleOpenEdit}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Editar Datos
          </button>
          <button
            className={styles.btnPrepayment}
            onClick={() => setIsPrepaymentModalOpen(true)}
            disabled={
              !enrollments.some((e) => e.active && e.enrollmentType === "PLAN")
            }
          >
            <Calendar size={18} />
            Pago Adelantado
          </button>
        </div>
      </header>

      {/* Modal de Edición */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Editar Datos del Alumno</h2>
              <button
                className={styles.btnCloseModal}
                onClick={() => setIsModalOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    value={editForm.nombre}
                    onChange={(e) =>
                      setEditForm({ ...editForm, nombre: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>DNI</label>
                  <input
                    type="text"
                    value={editForm.dni}
                    onChange={(e) =>
                      setEditForm({ ...editForm, dni: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Correo Electrónico</label>
                  <input
                    type="email"
                    value={editForm.correo}
                    onChange={(e) =>
                      setEditForm({ ...editForm, correo: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Teléfono (Alumno)</label>
                  <input
                    type="text"
                    value={editForm.celularAlumno}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        celularAlumno: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Dirección (Distrito)</label>
                  <input
                    type="text"
                    value={editForm.distrito}
                    onChange={(e) =>
                      setEditForm({ ...editForm, distrito: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={editForm.fechaNacimiento}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        fechaNacimiento: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Contacto del Apoderado (Número)</label>
                  <input
                    type="text"
                    value={editForm.celularApoderado}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        celularApoderado: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Estado</label>
                  <select
                    value={editForm.active ? "Activo" : "Inactivo"}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        active: e.target.value === "Activo",
                      })
                    }
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.btnCancelModal}
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className={styles.btnSaveModal}
                disabled={isSaving}
                onClick={async () => {
                  setIsSaving(true);
                  try {
                    // Sanitize inputs
                    const updateData = {
                      nombre: editForm.nombre.trim(),
                      dni: editForm.dni.trim() || undefined,
                      correo: editForm.correo.trim() || undefined,
                      celularAlumno: editForm.celularAlumno.trim() || undefined,
                      distrito: editForm.distrito.trim() || undefined,
                      fechaNacimiento: editForm.fechaNacimiento || undefined,
                      celularApoderado:
                        editForm.celularApoderado.trim() || undefined,
                      active: editForm.active,
                    };

                    const updated = await StudentService.update(
                      parseInt(alumno.id),
                      updateData,
                    );

                    // Refresh data after update
                    const freshData = await fetchStudentDetails();

                    // If we have an onUpdate callback, ||||notify the parent list
                    if (onUpdate && freshData) {
                      onUpdate(freshData);
                    }

                    setIsModalOpen(false);
                  } catch (error: any) {
                    console.error("Error updating student. Full error:", error);
                    const errorMsg =
                      error.message ||
                      (typeof error === "string"
                        ? error
                        : JSON.stringify(
                            error,
                            Object.getOwnPropertyNames(error),
                          ));
                    alert(`Error al actualizar los datos: ${errorMsg}`);
                  } finally {
                    setIsSaving(false);
                  }
                }}
              >
                {isSaving && <Loader2 className={styles.spinner} size={16} />}
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.mainGrid}>
        {/* Left Column */}
        <div className={styles.leftCol}>
          <div className={`${styles.card} ${styles.profileCard}`}>
            <div className={styles.profileHeader}></div>
            <div className={styles.avatarWrapper}>
              <div className={styles.avatar}>
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            </div>
            <div className={styles.profileInfo}>
              <h2>{alumno.nombre}</h2>
              <div className={styles.sidebarAcademicInfo}>
                {enrollments.length > 0 ? (
                  enrollments.map((enr) => {
                    const resolved = resolvedEnrollmentData[enr.id];
                    return (
                      <div
                        key={enr.id}
                        className={styles.sidebarEnrollmentItem}
                      >
                        {enr.enrollmentType === "PLAN" ? (
                          <div className={styles.sidebarPlan}>
                            <span className={styles.sidebarLabel}>PLAN</span>
                            <div className={styles.sidebarTitle}>
                              {resolved?.planName || "Plan Académico"}
                            </div>
                            <div className={styles.sidebarSubtitle}>
                              {resolved?.course} {resolved?.level}{" "}
                              {resolved?.cycle}
                            </div>
                          </div>
                        ) : (
                          <div className={styles.sidebarProduct}>
                            <span className={styles.sidebarLabelProduct}>
                              PRODUCTO
                            </span>
                            <div className={styles.sidebarTitle}>
                              {resolved?.product || "Producto / Servicio"}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <span className={styles.noEnrollment}>
                    Sin curso asignado
                  </span>
                )}
              </div>
            </div>

            <div className={styles.contactList}>
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div>
                  <span className={styles.contactLabel}>
                    Correo electrónico
                  </span>
                  <span className={styles.contactValue}>{alumno.email}</span>
                </div>
              </div>

              <div className={styles.contactItem}>
                <div className={styles.contactIcon}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <div>
                  <span className={styles.contactLabel}>Teléfono</span>
                  <span className={styles.contactValue}>
                    {alumno.celularAlumno || "No registra"}
                  </span>
                </div>
              </div>

              <div className={styles.contactItem}>
                <div className={styles.contactIcon}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div>
                  <span className={styles.contactLabel}>Dirección</span>
                  <span className={styles.contactValue}>
                    {alumno.distrito || "No registra"}
                  </span>
                </div>
              </div>

              <div className={styles.contactItem}>
                <div className={styles.contactIcon}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <div>
                  <span className={styles.contactLabel}>
                    Fecha de Nacimiento
                  </span>
                  <span className={styles.contactValue}>
                    {alumno.fechaNacimiento || "No registra"}
                  </span>
                </div>
              </div>
            </div>

            <button className={styles.btnDoc}>Ver Documentación</button>
          </div>

          <div className={`${styles.card} ${styles.emergencyCard}`}>
            <h3 className={styles.cardIconTitle}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              Contacto del apoderado
            </h3>
            <div className={styles.emergencyInfo}>
              {!alumno.celularApoderado && enrollments.length === 0 ? (
                <h3>No registra contacto del apoderado</h3>
              ) : (
                <>
                  <h3>Número de contacto</h3>
                  <div className={styles.emergencyPhone}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    {alumno.celularApoderado || "No brinda número"}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.rightCol}>
          {/* Academic Info */}
          <div className={styles.card}>
            <div className={styles.academicHeader}>
              <h2>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
                Información Académica
              </h2>
              <button className={styles.btnHistorial}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Historial
              </button>
            </div>
            <div className={styles.academicBody}>
              <div className={styles.enrollmentsList}>
                {enrollments.map((enr) => {
                  const resolved = resolvedEnrollmentData[enr.id];
                  return (
                    <div key={enr.id} className={styles.enrollmentCardItem}>
                      <div className={styles.infoGrid}>
                        <div>
                          <div className={styles.infoValue}>
                            {enr.enrollmentType === "PLAN" ? (
                              <div className={styles.planInfo}>
                                <span className={styles.typeTag}>PLAN</span>
                                <div className={styles.mainTitle}>
                                  {resolved?.planName}
                                </div>
                                <div className={styles.subDetail}>
                                  {resolved?.course} {resolved?.level}{" "}
                                  {resolved?.cycle}
                                </div>
                              </div>
                            ) : (
                              <div className={styles.productInfo}>
                                <span className={styles.typeTagProduct}>
                                  PRODUCTO
                                </span>
                                <div className={styles.mainTitle}>
                                  {resolved?.product}
                                </div>
                                {enr.examDate && (
                                  <div className={styles.subDetail}>
                                    Fecha examen:{" "}
                                    {new Date(enr.examDate).toLocaleDateString(
                                      "es-PE",
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className={styles.infoLabel}>
                            Grupo / Horario
                          </span>
                          <div className={styles.infoValue}>
                            {enr.horario || "N/A"}
                          </div>
                        </div>
                        <div>
                          <span className={styles.infoLabel}>Sede</span>
                          <div className={styles.infoValue}>
                            {resolved?.campusName}
                          </div>
                        </div>
                        <div>
                          <span className={styles.infoLabel}>Estado</span>
                          <div className={styles.infoValue}>
                            {enr.active ? "Activo" : "Inactivo"}
                          </div>
                        </div>
                      </div>
                      {enr.enrollmentType === "PLAN" && (
                        <div className={styles.divider} />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className={styles.attendanceSection}>
                <div className={styles.attendanceHeader}>
                  <span className={styles.infoLabel}>
                    Asistencia Trimestral
                  </span>
                  <span className={styles.attendancePercentage}>
                    {academicPlaceholders.asistencia}%
                  </span>
                </div>
                <div className={styles.progressBarContainer}>
                  <div
                    className={styles.progressBar}
                    style={{ width: `${academicPlaceholders.asistencia}%` }}
                  ></div>
                </div>
                <div className={styles.attendanceFooter}>
                  {academicPlaceholders.faltas}
                </div>
              </div>
            </div>
          </div>

          {/* Financial Status */}
          <div className={styles.card}>
            <div className={styles.financialHeader}>
              <h3 className={styles.cardIconTitle}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                  <line x1="2" y1="10" x2="22" y2="10"></line>
                </svg>
                Estado Financiero
              </h3>
            </div>

            <div className={styles.financialMetrics}>
              {/* Card Crédito Disponible */}
              <div className={`${styles.metricCard} ${styles.creditCard}`}>
                <span className={styles.infoLabel}>
                  MENS. PAGADAS POR ADELANTADO
                </span>
                <div className={`${styles.metricValue} ${styles.creditValue}`}>
                  S/.{" "}
                  {nettedPrepayments
                    .reduce((sum, m) => sum + m.monto, 0)
                    .toFixed(2)}
                </div>
                <div style={{ marginTop: "0.8rem", fontSize: "0.85rem" }}>
                  {nettedPrepayments.length > 0 ? (
                    <ul
                      style={{
                        padding: 0,
                        margin: 0,
                        listStyle: "none",
                        color: "#065f46",
                      }}
                    >
                      {nettedPrepayments.map((m, idx) => (
                        <li
                          key={idx}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "4px",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>{m.mes}</span>
                          <div
                            style={{
                              display: "flex",
                              gap: "0.5rem",
                              alignItems: "center",
                            }}
                          >
                            <span style={{ fontWeight: 700 }}>
                              S/. {m.monto.toFixed(2)}
                            </span>
                            <span
                              className={
                                m.estado === "TOTAL"
                                  ? styles.statusTotal
                                  : styles.statusParcialSmall
                              }
                            >
                              ({m.estado})
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span
                      className={styles.caption}
                      style={{ color: "#64748b" }}
                    >
                      Sin mensualidades adelantadas
                    </span>
                  )}
                </div>
              </div>

              {/* Card Deuda Pendiente */}
              <div
                className={`${styles.metricCard} ${totalNettedSaldo > 0 ? styles.debtCardAlert : ""}`}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span className={styles.infoLabel}>Deuda Pendiente</span>
                  {totalNettedSaldo > 0 && (
                    <AlertTriangle size={16} color="#dc2626" />
                  )}
                </div>
                <div
                  className={`${styles.metricValue} ${totalNettedSaldo > 0 ? styles.debtValueCritical : ""}`}
                >
                  S/. {totalNettedSaldo.toFixed(2)}
                </div>
                <div style={{ marginTop: "0.8rem", fontSize: "0.85rem" }}>
                  {nettedDebts.filter((d) => Number(d.monto) > 0).length > 0 ? (
                    <ul
                      style={{
                        padding: 0,
                        margin: 0,
                        listStyle: "none",
                        color: totalNettedSaldo > 0 ? "#991b1b" : "#64748b",
                      }}
                    >
                      {nettedDebts
                        .filter((d) => Number(d.monto) > 0)
                        .map((d, idx) => (
                          <li
                            key={idx}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "4px",
                            }}
                          >
                            <span style={{ fontWeight: 600 }}>
                              {d.mesAplicado || d.concepto || "Deuda"}
                            </span>
                            <span>S/. {Number(d.monto).toFixed(2)}</span>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <span
                      className={styles.caption}
                      style={{ color: "#64748b" }}
                    >
                      Sin deudas pendientes
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Economic Breakdown (Legacy logic for other debts) */}
            {(nettedDebts.length > 0 || paidDebts.length > 0) && (
              <div className={styles.debtsBreakdown}>
                <h4
                  className={styles.breakdownTitle}
                  style={{ marginTop: "0.5rem" }}
                >
                  Resumen de Movimientos
                </h4>
                <div className={styles.breakdownList}>
                  {/* Pending Debts (Netted) */}
                  {nettedDebts
                    .filter((d) => Number(d.monto) > 0)
                    .map((d, idx) => (
                      <div key={d.id || idx} className={styles.breakdownItem}>
                        <span className={styles.breakdownConcept}>
                          {d.concepto || d.tipoDeuda}{" "}
                          {d.mesAplicado ? `(${d.mesAplicado})` : ""}
                          {d.estado === "PAGADO_PARCIAL" && (
                            <span className={styles.partialBadge}>Parcial</span>
                          )}
                        </span>
                        <span className={styles.breakdownAmount}>
                          S/. {Number(d.monto).toFixed(2)}
                        </span>
                      </div>
                    ))}

                  {/* Consumos Log */}
                  {consumos.map((c) => (
                    <div
                      key={c.id}
                      className={styles.breakdownItem}
                      style={{ color: "#059669" }}
                    >
                      <span className={styles.breakdownConcept}>
                        Consumo Crédito ({c.mes})
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "#10b981",
                            marginLeft: "8px",
                            fontWeight: 600,
                          }}
                        >
                          Canjeado
                        </span>
                      </span>
                      <span className={styles.breakdownAmount}>
                        S/. {Number(c.monto).toFixed(2)}
                      </span>
                    </div>
                  ))}

                  {/* Paid Debts */}
                  {paidDebts.map((d) => (
                    <div
                      key={d.id}
                      className={styles.breakdownItem}
                      style={{ opacity: 0.8 }}
                    >
                      <span className={styles.breakdownConcept}>
                        {d.concepto || d.tipoDeuda}{" "}
                        {d.mesAplicado ? `(${d.mesAplicado})` : ""}
                        <span
                          style={{
                            backgroundColor: "#ecfdf5",
                            color: "#10b981",
                            fontSize: "0.7rem",
                            padding: "2px 6px",
                            borderRadius: "10px",
                            marginLeft: "8px",
                            fontWeight: 600,
                          }}
                        >
                          Pagado
                        </span>
                      </span>
                      <span
                        className={styles.breakdownAmount}
                        style={{
                          color: "#10b981",
                          textDecoration: "line-through",
                        }}
                      >
                        S/.{" "}
                        {Number(d.monto).toFixed(2) === "0.00"
                          ? "-"
                          : Number(d.monto).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.paymentsTableArea}>
              <h3>Últimos Pagos</h3>
              {payments.length > 0 ? (
                <div className={styles.tableResponsive}>
                  <table className={styles.paymentsTable}>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Tipo</th>
                        <th>Método</th>
                        <th>Monto</th>
                        <th>Boleta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => {
                        const isExpanded = expandedPayments.has(p.id);
                        const isPrepayment =
                          p.tipo === "Mensualidad Adelantada";
                        const details = prepaymentDetails[p.id] || [];

                        const toggleExpand = async () => {
                          if (isPrepayment) {
                            const newExpanded = new Set(expandedPayments);
                            if (isExpanded) {
                              newExpanded.delete(p.id);
                            } else {
                              newExpanded.add(p.id);
                              // Fetch details if not already loaded
                              if (!prepaymentDetails[p.id]) {
                                try {
                                  const response = await fetch(
                                    `http://localhost:3002/api/payments/${p.id}/prepayment-details`,
                                    { credentials: "include" },
                                  );
                                  const data = await response.json();
                                  setPrepaymentDetails((prev) => ({
                                    ...prev,
                                    [p.id]: data,
                                  }));
                                } catch (error) {
                                  console.error(
                                    "Error fetching prepayment details:",
                                    error,
                                  );
                                }
                              }
                            }
                            setExpandedPayments(newExpanded);
                          }
                        };

                        return (
                          <React.Fragment key={p.id}>
                            <tr
                              key={p.id}
                              onClick={toggleExpand}
                              style={{
                                cursor: isPrepayment ? "pointer" : "default",
                              }}
                            >
                              <td>
                                {new Date(p.fechaPago).toLocaleDateString(
                                  "es-PE",
                                )}
                              </td>
                              <td>
                                {isPrepayment && (
                                  <span style={{ marginRight: "8px" }}>
                                    {isExpanded ? "▼" : "▶"}
                                  </span>
                                )}
                                {p.tipo}
                              </td>
                              <td>{p.metodo}</td>
                              <td className={styles.amountCell}>
                                S/. {p.monto.toFixed(2)}
                              </td>
                              <td className={styles.boletaCell}>
                                {p.numeroBoleta}
                              </td>
                            </tr>
                            {isPrepayment &&
                              isExpanded &&
                              details.length > 0 && (
                                <tr key={`${p.id}-details`}>
                                  <td
                                    colSpan={5}
                                    style={{
                                      padding: "12px 24px",
                                      backgroundColor: "#f8f9fa",
                                    }}
                                  >
                                    <div style={{ fontSize: "0.9em" }}>
                                      <strong>Detalle de meses pagados:</strong>
                                      <ul
                                        style={{
                                          marginTop: "8px",
                                          marginBottom: "0",
                                        }}
                                      >
                                        {details.map((detail, idx) => {
                                          const [year, month] =
                                            detail.mes.split("-");
                                          const date = new Date(
                                            parseInt(year),
                                            parseInt(month) - 1,
                                            1,
                                          );
                                          const monthName = date
                                            .toLocaleDateString("es-PE", {
                                              month: "long",
                                              year: "numeric",
                                            })
                                            .toUpperCase();

                                          return (
                                            <li key={idx}>
                                              {monthName}: S/.{" "}
                                              {Number(detail.monto).toFixed(2)}
                                              {detail.estado === "APLICADO" &&
                                                " ✓"}
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    </div>
                                  </td>
                                </tr>
                              )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.emptyTableMessage}>
                  No se registran pagos realizados recientemente.
                </div>
              )}
            </div>
          </div>

          {/* Observations */}
          <div className={styles.card}>
            <div className={styles.observationsSection}>
              <h3 className={styles.cardIconTitle}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Observaciones
              </h3>
              {academicPlaceholders.observaciones.map(
                (obs: any, idx: number) => (
                  <div key={idx} className={styles.noteCard}>
                    <p className={styles.noteText}>"{obs.texto}"</p>
                    <div className={styles.noteFooter}>
                      - {obs.autor}, {obs.fecha}
                    </div>
                  </div>
                ),
              )}
              <button className={styles.btnAddNote}>
                <span>+</span> Añadir Nota
              </button>
            </div>
          </div>
        </div>
      </div>
      {isPrepaymentModalOpen &&
        enrollments.find((e) => e.active && e.enrollmentType === "PLAN") && (
          <PrepaymentForm
            enrollment={
              enrollments.find((e) => e.active && e.enrollmentType === "PLAN")!
            }
            plan={plan}
            campusId={
              enrollments.find((e) => e.active && e.enrollmentType === "PLAN")
                ?.campusId || 0
            }
            onClose={() => setIsPrepaymentModalOpen(false)}
            onSuccess={() => {
              fetchStudentDetails();
              alert("Pago adelantado registrado con éxito");
            }}
          />
        )}
    </div>
  );
};

export default AlumnoDetalle;
