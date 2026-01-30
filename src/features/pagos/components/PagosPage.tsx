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
} from "lucide-react";
import styles from "./PagosPage.module.css";
// StudentSearchModal removed in favor of inline search
import { StudentService } from "@/shared/services/api/studentService";
import { DebtService } from "@/shared/services/api/debtService";
import { PaymentService } from "@/shared/services/api/paymentService";
import { EnrollmentService } from "@/shared/services/api/enrollmentService";
import Toast from "@/shared/components/Toast";
import { Student } from "@/features/matriculas/models/EnrollmentModels";

export default function PagosPage() {
  const router = useRouter();

  // States
  const [student, setStudent] = useState<Student | null>(null);
  const [debts, setDebts] = useState<any[]>([]);
  const [selectedDebt, setSelectedDebt] = useState<any>(null);
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
  const [amount, setAmount] = useState<string>("");
  const [paymentType, setPaymentType] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [invoiceNumber, setInvoiceNumber] = useState("");

  // Calculated
  const totalDebt = debts.reduce(
    (acc, curr) => acc + Number(curr.monto || 0),
    0,
  );

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
    setAmount("");
    setPaymentType("");
    fetchDebts(selected.id);
  };

  const handleClearSearch = () => {
    setStudent(null);
    setSearchTerm("");
    setDebts([]);
    setFilteredStudents([]);
    setShowDropdown(false);
    setSelectedDebt(null);
  };

  const fetchDebts = async (studentId: number) => {
    setLoadingDebts(true);
    try {
      // Get Enrollments first
      const enrollments = await EnrollmentService.getByStudentId(studentId);

      let allDebts: any[] = [];
      for (const enr of enrollments) {
        const enrDebts = await DebtService.getByEnrollmentId(enr.id);
        // Fixed: Include PARTIAL and EXPIRED debts
        const pending = enrDebts.filter((d: any) =>
          ["PENDIENTE", "PAGADO_PARCIAL", "VENCIDO"].includes(d.estado),
        );
        allDebts = [...allDebts, ...pending];
      }
      setDebts(allDebts.filter((d: any) => Number(d.monto) > 0));
    } catch (err) {
      console.error("Error fetching debts", err);
      setDebts([]);
    } finally {
      setLoadingDebts(false);
    }
  };

  const handleDebtSelection = (debt: any) => {
    if (selectedDebt?.id === debt.id) {
      // Deselect
      setSelectedDebt(null);
      setAmount("");
      setPaymentType("");
    } else {
      // Select
      setSelectedDebt(debt);
      setAmount(Number(debt.monto).toFixed(2));

      // Auto-map type
      let mappedType = "";
      // Map backend types to frontend labels if needed, or use exact matches
      // Assuming database uses uppercase types like 'INSCRIPCION', 'MENSUALIDAD'
      const typeUpper = debt.tipoDeuda?.toUpperCase() || "";
      if (typeUpper.includes("INSCRIPCION")) mappedType = "Inscripción";
      else if (typeUpper.includes("MENSUALIDAD"))
        mappedType = "Mensualidad"; // Could be adelanto?
      else if (typeUpper.includes("MATERIAL")) mappedType = "Materiales";

      // If exact match didn't work, manual selection is fine, but we suggest one if possible
      if (mappedType) setPaymentType(mappedType);
    }
  };

  const handleRegisterPayment = async () => {
    if (!student) return;
    if (!amount || Number(amount) <= 0) {
      setToast({ message: "Ingrese un monto válido", type: "error" });
      return;
    }
    if (!paymentType) {
      setToast({ message: "Seleccione un tipo de pago", type: "error" });
      return;
    }

    setLoadingDebts(true); // Re-use loading state or create new one
    try {
      const enrollments = await EnrollmentService.getByStudentId(student.id);
      const activeEnrollment = enrollments.find((e: any) => e.active);

      if (!activeEnrollment) {
        setToast({
          message: "El alumno no tiene matrícula activa",
          type: "error",
        });
        return;
      }

      await PaymentService.create({
        enrollmentId: activeEnrollment.id,
        monto: Number(amount),
        metodo: method,
        tipo: paymentType,
        fechaPago: new Date(paymentDate).toISOString(),
        numeroBoleta: invoiceNumber,
        campusId: activeEnrollment.campusId,
        debtId: selectedDebt?.id, // Link to selected debt if any
      });

      setToast({ message: "Pago registrado exitosamente", type: "success" });
      setAmount("");
      setInvoiceNumber("");
      setSelectedDebt(null);
      fetchDebts(student.id);
    } catch (err) {
      console.error(err);
      setToast({ message: "Error al registrar pago", type: "error" });
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
            <h3>Registrar Pago</h3>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Tipo de Pago</label>
                <select
                  name="tipoPago"
                  className={styles.select}
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                >
                  <option value="">Seleccione un concepto</option>
                  <optgroup label="Académico">
                    <option value="Inscripción">Inscripción</option>
                    <option value="Mensualidad">Mensualidad</option>
                    <option value="Materiales">Materiales</option>
                    <option value="Mensualidad Adelantada">
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

              {PRODUCT_OPTIONS.includes(paymentType) ? (
                <div className={styles.redirectMessage}>
                  <p>
                    Para registrar un <strong>{paymentType}</strong>, se debe
                    generar una nueva matrícula.
                  </p>
                </div>
              ) : (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Fecha de Pago</label>
                    <div className={styles.inputWrapper}>
                      <input
                        type="date"
                        name="fechaPago"
                        className={styles.input}
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Número de Factura/Boleta
                    </label>
                    <input
                      type="text"
                      name="numeroFactura"
                      placeholder="Ejem: B001-0001"
                      className={styles.input}
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Monto a Pagar</label>
                    <div style={{ position: "relative" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: "1rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#64748b",
                        }}
                      >
                        S/
                      </span>
                      <input
                        type="number"
                        className={styles.input}
                        style={{ paddingLeft: "2.5rem" }}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {!PRODUCT_OPTIONS.includes(paymentType) && (
              <div className={styles.methodSection}>
                <span className={styles.methodLabel}>Método de Pago</span>
                <div className={styles.methodGrid}>
                  {[
                    { name: "Transferencia", icon: Landmark },
                    { name: "Yape", icon: Smartphone },
                    { name: "Efectivo", icon: Banknote },
                    { name: "Tarjeta", icon: CreditCard },
                  ].map((m) => (
                    <div
                      key={m.name}
                      className={`${styles.methodCard} ${method === m.name ? styles.methodCardActive : ""}`}
                      onClick={() => setMethod(m.name)}
                    >
                      <m.icon className={styles.methodIcon} />
                      <span className={styles.methodName}>{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!PRODUCT_OPTIONS.includes(paymentType) && (
              <div className={styles.summarySection}>
                <h4 className={styles.summaryTitle}>Resumen de Deuda</h4>
                <div className={styles.summaryRow}>
                  <span>Deuda Total Actual</span>
                  <span>S/ {totalDebt.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Monto a Pagar</span>
                  <span>- S/ {Number(amount || 0).toFixed(2)}</span>
                </div>
                <div className={styles.summaryRowTotal}>
                  <span>Nuevo Saldo Pendiente</span>
                  <span>
                    S/ {Math.max(0, totalDebt - Number(amount || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className={styles.actions}>
              {PRODUCT_OPTIONS.includes(paymentType) ? (
                <button
                  className={styles.btnSubmit}
                  onClick={handleProductRedirect}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  Ir a Matricular Producto <ExternalLink size={18} />
                </button>
              ) : (
                <>
                  <button
                    className={styles.btnCancel}
                    onClick={() => {
                      setStudent(null);
                      setDebts([]);
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    className={styles.btnSubmit}
                    onClick={handleRegisterPayment}
                    disabled={loadingDebts}
                  >
                    {loadingDebts ? "Procesando..." : "Registrar Pago"}
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
