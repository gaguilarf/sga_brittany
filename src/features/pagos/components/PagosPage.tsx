"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Landmark,
  Smartphone,
  Banknote,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import styles from "./PagosPage.module.css";
import { StudentSearchModal } from "@/features/matriculas/components/StudentSearchModal";
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
  const [loading, setLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

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

  const handleStudentSelect = async (selected: Student) => {
    setStudent(selected);
    setIsSearchOpen(false);
    fetchDebts(selected.id);
  };

  const fetchDebts = async (studentId: number) => {
    setLoading(true);
    try {
      // Get Enrollments first
      const enrollments = await EnrollmentService.getByStudentId(studentId);

      let allDebts: any[] = [];
      for (const enr of enrollments) {
        const enrDebts = await DebtService.getByEnrollmentId(enr.id);
        const pending = enrDebts.filter((d: any) => d.estado === "PENDIENTE");
        allDebts = [...allDebts, ...pending];
      }
      setDebts(allDebts);
    } catch (err) {
      console.error("Error fetching debts", err);
      // Fallback or empty if error
      setDebts([]);
    } finally {
      setLoading(false);
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

    setLoading(true);
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
        campusId: activeEnrollment.campusId, // Missing in previous code
      });

      setToast({ message: "Pago registrado exitosamente", type: "success" });
      setAmount("");
      setInvoiceNumber("");
      fetchDebts(student.id);
    } catch (err) {
      console.error(err);
      setToast({ message: "Error al registrar pago", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleProductRedirect = () => {
    if (!student) return;
    router.push(`/matriculas?studentId=${student.id}&type=PRODUCT`);
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

      {/* 1. Buscador */}
      <section className={styles.searchSection}>
        <div
          className={styles.searchInputWrapper}
          onClick={() => setIsSearchOpen(true)}
          style={{ cursor: "pointer" }}
        >
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Buscar Estudiante por DNI, Nombre o Código..."
            className={styles.searchInput}
            readOnly
            value={student ? `${student.nombre} (DNI: ${student.dni})` : ""}
          />
        </div>
      </section>

      {/* 2 & 3. Info & Deudas */}
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
              {/* Changed from student.codigo to generic ID or removed entirely if not needed */}
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>ID Sistema:</span>
                <span className={styles.infoValue}>{student.id}</span>
              </div>
            </div>

            <div className={styles.debtsSection}>
              <h4 className={styles.debtsTitle}>Deudas Pendientes:</h4>
              {debts.length === 0 ? (
                <p className={styles.noDebts}>No hay deudas pendientes.</p>
              ) : (
                <div className={styles.debtsGrid}>
                  {debts.map((debt, index) => (
                    <div key={index} className={styles.debtItem}>
                      <span className={styles.debtLabel}>
                        {debt.concepto} ({debt.mesAplicado || "-"}):
                      </span>
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

      {/* 4. Registrar Pago Form */}
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
                    <option value="Matrícula">Matrícula</option>
                    <option value="Pensión">Pensión</option>
                    <option value="Material">Material</option>
                    <option value="Certificado">Certificado</option>
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
                    disabled={loading}
                  >
                    {loading ? "Procesando..." : "Registrar Pago"}
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      <StudentSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={handleStudentSelect}
      />
    </div>
  );
}
