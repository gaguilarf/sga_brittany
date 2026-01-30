"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Landmark,
  Smartphone,
  Banknote,
  CreditCard,
  ExternalLink,
  User,
  Loader2,
  X,
  Plus,
  Trash2,
  Calendar,
} from "lucide-react";
import styles from "./PagosPage.module.css";
import { StudentService } from "@/shared/services/api/studentService";
import { DebtService } from "@/shared/services/api/debtService";
import { PaymentService } from "@/shared/services/api/paymentService";
import { PlanService } from "@/shared/services/api/planService";
import { EnrollmentService } from "@/shared/services/api/enrollmentService";
import Toast from "@/shared/components/Toast";
import {
  Student,
  CreatePaymentDto,
  DebtResponse,
  EnrollmentResponse,
} from "@/features/matriculas/models/EnrollmentModels";

export default function PagosPage() {
  const router = useRouter();

  // States
  const [student, setStudent] = useState<Student | null>(null);
  const [debts, setDebts] = useState<DebtResponse[]>([]);
  const [selectedDebt, setSelectedDebt] = useState<DebtResponse | null>(null);
  const [loadingDebts, setLoadingDebts] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Search State
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Payment Form State
  const [method, setMethod] = useState("Transferencia");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [payments, setPayments] = useState<
    Array<{
      tipo: string;
      monto: string;
      mesesAdelantados: Array<{ mes: string; monto: number }>;
      debtId?: number;
    }>
  >([{ tipo: "", monto: "", mesesAdelantados: [] }]);

  // Prepayment Details / Enrollment Cache
  const [activeEnrollment, setActiveEnrollment] =
    useState<EnrollmentResponse | null>(null);
  const [planPrices, setPlanPrices] = useState<any[]>([]);
  const [latestDebtMonth, setLatestDebtMonth] = useState<string | null>(null);

  // Calculated
  const totalDebt = debts.reduce(
    (acc, curr) => acc + Number(curr.monto || 0),
    0,
  );

  const totalPaymentAmount = payments.reduce(
    (acc, curr) => acc + Number(curr.monto || 0),
    0,
  );

  // Payment Management
  const addPayment = () => {
    setPayments((prev) => [
      ...prev,
      { tipo: "", monto: "", mesesAdelantados: [] },
    ]);
  };

  const removePayment = (index: number) => {
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePaymentChange = (index: number, field: string, value: any) => {
    setPayments((prev) => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };

      if (field === "tipo") {
        // Exclusivity: if this is Mensualidad, clear any Mensualidad Adelantada in others
        if (value === "Mensualidad") {
          updated.forEach((p, i) => {
            if (i !== index && p.tipo === "Mensualidad Adelantada") {
              p.tipo = "";
              p.monto = "";
              p.mesesAdelantados = [];
            }
          });
        }
        // If this is Mensualidad Adelantada, clear any Mensualidad in others
        if (value === "Mensualidad Adelantada") {
          updated.forEach((p, i) => {
            if (i !== index && p.tipo === "Mensualidad") {
              p.tipo = "";
              p.monto = "";
              p.debtId = undefined;
            }
          });
        }

        // Auto-fill price if possible
        if (activeEnrollment && planPrices.length > 0) {
          const planPrice = planPrices.find(
            (p) => p.planId === activeEnrollment.planId,
          );
          if (planPrice) {
            if (value === "Inscripción") {
              item.monto = planPrice.precioInscripcion.toString();
            } else if (value === "Materiales") {
              item.monto = planPrice.precioMateriales.toString();
            } else if (value === "Mensualidad") {
              item.monto = planPrice.precioMensualidad.toString();
            }
          }
        }

        // Clear months if not prepayment
        if (value !== "Mensualidad Adelantada") {
          item.mesesAdelantados = [];
        }
      }

      updated[index] = item;
      return updated;
    });
  };

  const addPrepaymentMonth = (paymentIndex: number) => {
    setPayments((prev) => {
      const updated = [...prev];
      const payment = { ...updated[paymentIndex] };
      const months = [...payment.mesesAdelantados];

      let nextDate = new Date();
      nextDate.setDate(1);

      if (months.length > 0) {
        const last = months[months.length - 1].mes;
        const [year, month] = last.split("-").map(Number);
        nextDate = new Date(year, month, 1);
      } else if (latestDebtMonth) {
        const [year, month] = latestDebtMonth.split("-").map(Number);
        nextDate = new Date(year, month, 1);
      }
      const mesStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;
      const monthlyPrice =
        planPrices.find((p) => p.planId === activeEnrollment?.planId)
          ?.precioMensualidad || 0;

      months.push({ mes: mesStr, monto: Number(monthlyPrice) });
      payment.mesesAdelantados = months;
      payment.monto = months
        .reduce((sum, m) => sum + Number(m.monto), 0)
        .toFixed(2);

      updated[paymentIndex] = payment;
      return updated;
    });
  };

  const removePrepaymentMonth = (paymentIndex: number, monthIndex: number) => {
    setPayments((prev) => {
      const updated = [...prev];
      const payment = { ...updated[paymentIndex] };
      const months = payment.mesesAdelantados.filter(
        (_, i) => i !== monthIndex,
      );
      payment.mesesAdelantados = months;
      payment.monto = months
        .reduce((sum, m) => sum + Number(m.monto), 0)
        .toFixed(2);
      updated[paymentIndex] = payment;
      return updated;
    });
  };

  const updatePrepaymentMonthAmount = (
    paymentIndex: number,
    monthIndex: number,
    newMonto: number,
  ) => {
    setPayments((prev) => {
      const updated = [...prev];
      const payment = { ...updated[paymentIndex] };
      const months = payment.mesesAdelantados.map((m, i) =>
        i === monthIndex ? { ...m, monto: newMonto } : m,
      );
      payment.mesesAdelantados = months;
      payment.monto = months
        .reduce((sum, m) => sum + Number(m.monto), 0)
        .toFixed(2);
      updated[paymentIndex] = payment;
      return updated;
    });
  };

  // Load students on mount
  useEffect(() => {
    const loadStudents = async () => {
      setLoadingStudents(true);
      try {
        const data = await StudentService.getAll();
        setAllStudents(data);
      } catch (err) {
        console.error("Error loading students", err);
      } finally {
        setLoadingStudents(false);
      }
    };
    loadStudents();
  }, []);

  // Filter students on search term change
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents([]);
      // Don't hide dropdown immediately if user just cleared input,
      // but usually we want to show nothing or all? Let's show nothing if empty.
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = allStudents.filter(
      (s) =>
        s.nombre.toLowerCase().includes(term) ||
        (s.dni && s.dni.includes(term)),
    );
    setFilteredStudents(filtered.slice(0, 10)); // Limit to 10 results
  }, [searchTerm, allStudents]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStudentSelect = (selected: Student) => {
    setStudent(selected);
    setSearchTerm(`${selected.nombre} (DNI: ${selected.dni || "N/A"})`);
    setShowDropdown(false);
    setSelectedDebt(null);
    setPayments([{ tipo: "", monto: "", mesesAdelantados: [] }]);
    setActiveEnrollment(null);
    setPlanPrices([]);
    setLatestDebtMonth(null);
    fetchDebts(selected.id);
  };

  const handleClearSearch = () => {
    setStudent(null);
    setSearchTerm("");
    setDebts([]);
    setFilteredStudents([]);
    setShowDropdown(false);
    setSelectedDebt(null);
    setPayments([{ tipo: "", monto: "", mesesAdelantados: [] }]);
    setActiveEnrollment(null);
    setPlanPrices([]);
    setLatestDebtMonth(null);
    setInvoiceNumber("");
  };

  const fetchDebts = async (studentId: number) => {
    setLoadingDebts(true);
    try {
      // Get Enrollments first
      const enrollments = await EnrollmentService.getByStudentId(studentId);

      // Find active PLAN enrollment for prepayment logic
      const activeEnr = enrollments.find(
        (e: any) => e.active && e.enrollmentType === "PLAN",
      );
      if (activeEnr) {
        setActiveEnrollment(activeEnr);
        const prices = await PlanService.getPricesByCampus(activeEnr.campusId);
        setPlanPrices(prices);
      }

      let allDebts: any[] = [];
      let overallMaxMes: string | null = null;

      for (const enr of enrollments) {
        // Use unified Account Statement logic
        const statement = await EnrollmentService.getAccountStatement(enr.id);
        const enrDebts = statement.nettedDebts; // Already filtered by state in backend but needs netting

        // Find max mesAplicado from raw debts for prepayment suggestions
        statement.debts.forEach((d: any) => {
          if (d.mesAplicado && d.mesAplicado.match(/^\d{4}-\d{2}$/)) {
            if (!overallMaxMes || d.mesAplicado > overallMaxMes) {
              overallMaxMes = d.mesAplicado;
            }
          }
        });

        // Also look at existing prepayments that haven't been applied yet
        statement.nettedPrepayments.forEach((p: any) => {
          if (p.mes && p.mes.match(/^\d{4}-\d{2}$/)) {
            if (!overallMaxMes || p.mes > overallMaxMes) {
              overallMaxMes = p.mes;
            }
          }
        });

        allDebts = [...allDebts, ...enrDebts];
      }

      setLatestDebtMonth(overallMaxMes);
      // Filter out debts that are fully netted (monto <= 0)
      setDebts(allDebts.filter((d: any) => Number(d.monto) > 0));
    } catch (err) {
      console.error("Error fetching debts", err);
      setDebts([]);
    } finally {
      setLoadingDebts(false);
    }
  };

  const handleDebtSelection = (debt: DebtResponse) => {
    if (selectedDebt?.id === debt.id) {
      setSelectedDebt(null);
      // Reset first payment item if it was this debt
      setPayments((prev) => {
        const updated = [...prev];
        if (updated[0].debtId === debt.id) {
          updated[0] = { tipo: "", monto: "", mesesAdelantados: [] };
        }
        return updated;
      });
    } else {
      setSelectedDebt(debt);

      // Map debt to first payment item
      let mappedType = "";
      const typeUpper = debt.tipoDeuda?.toUpperCase() || "";
      if (typeUpper.includes("INSCRIPCION")) mappedType = "Inscripción";
      else if (typeUpper.includes("MENSUALIDAD")) mappedType = "Mensualidad";
      else if (typeUpper.includes("MATERIAL")) mappedType = "Materiales";

      setPayments((prev) => {
        const updated = [...prev];
        updated[0] = {
          tipo: mappedType || updated[0].tipo,
          monto: Number(debt.monto).toFixed(2),
          mesesAdelantados: [],
          debtId: debt.id,
        };
        return updated;
      });
    }
  };

  const handleRegisterPayment = async () => {
    if (!student) return;
    if (payments.length === 0) {
      setToast({ message: "Agregue al menos un concepto", type: "error" });
      return;
    }

    if (!invoiceNumber.trim()) {
      setToast({ message: "Ingrese el número de boleta", type: "error" });
      return;
    }

    // Basic validation
    for (let i = 0; i < payments.length; i++) {
      const p = payments[i];
      if (!p.tipo) {
        setToast({
          message: `Seleccione el tipo en el concepto ${i + 1}`,
          type: "error",
        });
        return;
      }
      if (!p.monto || Number(p.monto) <= 0) {
        setToast({
          message: `Monto inválido en el concepto ${i + 1}`,
          type: "error",
        });
        return;
      }
      if (
        p.tipo === "Mensualidad Adelantada" &&
        p.mesesAdelantados.length === 0
      ) {
        setToast({
          message: `Agregue al menos un mes en el adelanto (${i + 1})`,
          type: "error",
        });
        return;
      }
    }

    setLoadingDebts(true);
    try {
      const enrollments = await EnrollmentService.getByStudentId(student.id);
      const activeEnr = enrollments.find((e: any) => e.active);

      if (!activeEnr) {
        setToast({
          message: "El alumno no tiene matrícula activa",
          type: "error",
        });
        return;
      }

      const now = new Date().toISOString();

      // Submit each payment
      for (const p of payments) {
        const payload: CreatePaymentDto = {
          enrollmentId: activeEnr.id,
          monto: Number(p.monto),
          metodo: method,
          tipo: p.tipo,
          fechaPago: now,
          numeroBoleta: invoiceNumber,
          campusId: activeEnr.campusId,
          debtId: p.debtId,
        };

        if (p.tipo === "Mensualidad Adelantada") {
          payload.esAdelantado = true;
          payload.mesesAdelantados = p.mesesAdelantados;
        }

        await PaymentService.create(payload);
      }

      setToast({ message: "Pagos registrados exitosamente", type: "success" });
      handleClearSearch();
    } catch (err) {
      console.error(err);
      setToast({ message: "Error al registrar pagos", type: "error" });
    } finally {
      setLoadingDebts(false);
    }
  };

  const handleProductRedirect = () => {
    if (!student) return;
    router.push(`/admin/matriculas?studentId=${student.id}&type=PRODUCT`);
  };

  // Product options
  const PRODUCT_OPTIONS = [
    "Examen Internacional British Council",
    "Preparación para exámenes internacionales",
    "Clases particulares",
    "Curso de inglés a distancia (Edusoft)",
    "Curso TEFL",
    "Clubes de conversación",
    "Programa Au Pair",
    "Programa Viajes 360",
    "Spanish lessons",
  ];

  return (
    <div className={styles.pagosContainer}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Pagos</h1>
      </header>

      {/* 1. Inline Search Section */}
      <section className={styles.searchSection} ref={searchContainerRef}>
        <div
          className={styles.searchInputWrapper}
          style={{ position: "relative" }}
        >
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Buscar Estudiante por DNI, Nombre o Código..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
              if (!e.target.value) setStudent(null);
            }}
            onFocus={() => {
              if (searchTerm.trim()) setShowDropdown(true);
            }}
          />
          {searchTerm && (
            <button
              className={styles.clearSearchBtn}
              onClick={handleClearSearch}
            >
              <X size={16} />
            </button>
          )}

          {/* Autocomplete Dropdown */}
          {showDropdown && searchTerm.trim() && (
            <div
              className={styles.searchResultsDropdown}
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                backgroundColor: "white",
                borderRadius: "0 0 8px 8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                zIndex: 50,
                maxHeight: "300px",
                overflowY: "auto",
                border: "1px solid #e2e8f0",
                marginTop: "4px",
              }}
            >
              {loadingStudents ? (
                <div
                  style={{
                    padding: "1rem",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  <Loader2 className={styles.spinner} size={24} />
                  <span style={{ marginLeft: "8px" }}>Cargando...</span>
                </div>
              ) : filteredStudents.length > 0 ? (
                <ul>
                  {filteredStudents.map((s) => (
                    <li
                      key={s.id}
                      onClick={() => handleStudentSelect(s)}
                      style={{
                        padding: "10px 16px",
                        cursor: "pointer",
                        borderBottom: "1px solid #f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f8fafc")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "white")
                      }
                    >
                      <User size={16} color="#64748b" />
                      <div>
                        <div style={{ fontWeight: 500, color: "#1e293b" }}>
                          {s.nombre}
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                          DNI: {s.dni || "N/A"}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div
                  style={{
                    padding: "1rem",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  No se encontraron estudiantes
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {student && (
        <section className={styles.sectionCard}>
          <div className={styles.sectionBody}>
            <div className={styles.studentInfoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Estudiante:</span>
                <span className={styles.infoValue}>{student.nombre}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>DNI:</span>
                <span className={styles.infoValue}>{student.dni}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>ID Sistema:</span>
                <span className={styles.infoValue}>{student.id}</span>
              </div>
            </div>

            <div className={styles.debtsSection}>
              <h4 className={styles.debtsTitle}>Deudas Pendientes:</h4>
              {loadingDebts ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#64748b",
                  }}
                >
                  <Loader2 className={styles.spinner} size={16} />
                  Cargando deudas...
                </div>
              ) : debts.length === 0 ? (
                <p className={styles.noDebts}>No hay deudas pendientes.</p>
              ) : (
                <div className={styles.debtsGrid}>
                  {debts.map((debt, index) => (
                    <div
                      key={index}
                      className={`${styles.debtItem} ${selectedDebt?.id === debt.id ? styles.debtItemSelected : ""}`}
                      onClick={(e) => handleDebtSelection(debt)}
                    >
                      <div className={styles.debtContentWrapper}>
                        <input
                          type="checkbox"
                          checked={selectedDebt?.id === debt.id}
                          onChange={() => {}} // Handled by parent div
                          className={styles.debtCheckbox}
                          onClick={(e) => e.stopPropagation()}
                          onInput={() => handleDebtSelection(debt)}
                        />
                        <div className={styles.debtInfo}>
                          <span className={styles.debtLabel}>
                            {debt.concepto} ({debt.mesAplicado || "-"})
                          </span>
                          {/* Show tag for partial/vencido if needed */}
                          {debt.estado !== "PENDIENTE" && (
                            <span
                              className={styles.debtStatusTag}
                              style={{
                                backgroundColor:
                                  debt.estado === "PAGADO_PARCIAL"
                                    ? "#fff7ed"
                                    : "#fef2f2",
                                color:
                                  debt.estado === "PAGADO_PARCIAL"
                                    ? "#c2410c"
                                    : "#ef4444",
                              }}
                            >
                              {debt.estado === "PAGADO_PARCIAL"
                                ? "PARCIAL"
                                : debt.estado}
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`${styles.debtValue} ${Number(debt.monto) > 0 ? styles.debtValueHighlight : ""}`}
                      >
                        S/ {Number(debt.monto).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Registrar Pago Form */}
      {student && (
        <section className={styles.formSection}>
          <div className={styles.formHeader}>
            <div className={styles.formTitleArea}>
              <h3 className={styles.sectionTitle}>Conceptos de Pago</h3>
              <p className={styles.sectionSubtitle}>
                Agregue los items que el alumno desea pagar hoy
              </p>
            </div>
            <button className={styles.addConceptBtn} onClick={addPayment}>
              <Plus size={16} /> Agregar otro concepto
            </button>
          </div>

          <div className={styles.sectionBody}>
            <div className={styles.paymentsList}>
              {payments.map((p, pIdx) => {
                const isProduct = PRODUCT_OPTIONS.includes(p.tipo);

                return (
                  <div key={pIdx} className={styles.paymentItemCard}>
                    <div className={styles.paymentItemHeader}>
                      <span className={styles.conceptNumber}>
                        Concepto #{pIdx + 1}
                      </span>
                      {payments.length > 1 && (
                        <button
                          className={styles.removeConceptBtn}
                          onClick={() => removePayment(pIdx)}
                        >
                          <X size={14} /> Quitar
                        </button>
                      )}
                    </div>

                    <div className={styles.paymentItemGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Tipo de Pago</label>
                        <select
                          className={styles.select}
                          value={p.tipo}
                          onChange={(e) =>
                            handlePaymentChange(pIdx, "tipo", e.target.value)
                          }
                        >
                          <option value="">Seleccione un concepto</option>
                          <optgroup label="Académico">
                            <option
                              value="Inscripción"
                              disabled={payments.some(
                                (other, oIdx) =>
                                  oIdx !== pIdx && other.tipo === "Inscripción",
                              )}
                            >
                              Inscripción
                            </option>
                            <option
                              value="Mensualidad"
                              disabled={payments.some(
                                (other, oIdx) =>
                                  oIdx !== pIdx &&
                                  other.tipo === "Mensualidad Adelantada",
                              )}
                            >
                              Mensualidad
                            </option>
                            <option
                              value="Materiales"
                              disabled={payments.some(
                                (other, oIdx) =>
                                  oIdx !== pIdx && other.tipo === "Materiales",
                              )}
                            >
                              Materiales
                            </option>
                            <option
                              value="Mensualidad Adelantada"
                              disabled={payments.some(
                                (other, oIdx) =>
                                  oIdx !== pIdx && other.tipo === "Mensualidad",
                              )}
                            >
                              Mensualidad Adelantada
                            </option>
                          </optgroup>
                          <optgroup label="Productos / Servicios">
                            {PRODUCT_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                      </div>

                      {isProduct ? (
                        <div className={styles.productRedirectBox}>
                          <p>
                            Este concepto requiere una matrícula tipo PRODUCT.
                          </p>
                          <button
                            className={styles.btnRedirectSmall}
                            onClick={handleProductRedirect}
                          >
                            <ExternalLink size={14} /> Ir a registrar producto
                          </button>
                        </div>
                      ) : (
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Monto</label>
                          <div className={styles.amountInputWrapperInline}>
                            <span>S/</span>
                            <input
                              type="number"
                              className={styles.input}
                              value={p.monto}
                              disabled={p.tipo === "Mensualidad Adelantada"}
                              onChange={(e) =>
                                handlePaymentChange(
                                  pIdx,
                                  "monto",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {p.tipo === "Mensualidad Adelantada" && (
                      <div className={styles.prepaymentModuleInline}>
                        <div className={styles.prepaymentHeader}>
                          <div className={styles.prepaymentTitleArea}>
                            <Calendar size={20} />
                            <h4 className={styles.prepaymentTitle}>
                              Gestión de Mensualidades Adelantadas
                            </h4>
                          </div>
                          <button
                            type="button"
                            className={styles.addMonthBtn}
                            onClick={() => addPrepaymentMonth(pIdx)}
                          >
                            + Agregar mes
                          </button>
                        </div>

                        {p.mesesAdelantados.length === 0 ? (
                          <div className={styles.noMonthsText}>
                            No hay meses seleccionados. Haga clic en "+ Agregar
                            mes".
                          </div>
                        ) : (
                          <div className={styles.monthsListVertical}>
                            {p.mesesAdelantados.map((m, mIdx) => {
                              // Format date for display: "MES AÑO"
                              let displayLabel = m.mes;
                              try {
                                const [year, month] = m.mes.split("-");
                                const date = new Date(
                                  Number(year),
                                  Number(month) - 1,
                                  1,
                                );
                                displayLabel = date
                                  .toLocaleDateString("es-PE", {
                                    month: "long",
                                    year: "numeric",
                                  })
                                  .toUpperCase();
                              } catch (e) {}

                              return (
                                <div key={mIdx} className={styles.monthRowItem}>
                                  <div className={styles.monthDisplayBox}>
                                    <span className={styles.monthDisplayText}>
                                      {displayLabel}
                                    </span>
                                  </div>

                                  <div className={styles.amountInputContainer}>
                                    <div className={styles.monthAmountField}>
                                      <span className={styles.currencyLabel}>
                                        S/.
                                      </span>
                                      <input
                                        type="number"
                                        className={styles.monthAmountInputRow}
                                        value={m.monto}
                                        onChange={(e) =>
                                          updatePrepaymentMonthAmount(
                                            pIdx,
                                            mIdx,
                                            Number(e.target.value),
                                          )
                                        }
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      className={styles.removeMonthRowBtn}
                                      onClick={() =>
                                        removePrepaymentMonth(pIdx, mIdx)
                                      }
                                      title="Quitar mes"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className={styles.paymentMetadataGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Método de Pago (General)</label>
                <div className={styles.methodGridSmall}>
                  {[
                    { name: "Transferencia", icon: Landmark },
                    { name: "Yape", icon: Smartphone },
                    { name: "Efectivo", icon: Banknote },
                    { name: "Tarjeta", icon: CreditCard },
                  ].map((m) => (
                    <div
                      key={m.name}
                      className={`${styles.methodCardSmall} ${method === m.name ? styles.methodCardActive : ""}`}
                      onClick={() => setMethod(m.name)}
                    >
                      <m.icon size={16} />
                      <span>{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Número de Boleta/Factura{" "}
                  <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ejem: B001-0001"
                  className={styles.input}
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.summarySection}>
              <h4 className={styles.summaryTitle}>Resumen de la Operación</h4>
              <div className={styles.summaryRow}>
                <span>Deuda Total Pendiente</span>
                <span>S/ {totalDebt.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Deuda Restante</span>
                <span>
                  S/{" "}
                  {Math.max(
                    0,
                    totalDebt -
                      payments.reduce(
                        (acc, curr) =>
                          acc +
                          (curr.tipo !== "Mensualidad Adelantada"
                            ? Number(curr.monto || 0)
                            : 0),
                        0,
                      ),
                  ).toFixed(2)}
                </span>
              </div>

              <div className={styles.summaryRowTotal}>
                <span>Total a Pagar (Conceptos)</span>
                <span className={styles.highlightAmount}>
                  S/ {totalPaymentAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className={styles.actions}>
              <button
                className={styles.btnSubmit}
                onClick={handleRegisterPayment}
                disabled={loadingDebts || totalPaymentAmount <= 0}
              >
                {loadingDebts ? (
                  <>
                    <Loader2 className={styles.spinner} size={18} />
                    Procesando...
                  </>
                ) : (
                  "Registrar Todos los Pagos"
                )}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
