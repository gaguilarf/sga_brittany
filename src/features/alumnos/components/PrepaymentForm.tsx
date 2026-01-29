import React, { useState, useEffect } from "react";
import styles from "./PrepaymentForm.module.css";
import { X, Loader2, Calendar, CreditCard } from "lucide-react";
import {
  EnrollmentResponse,
  Plan,
  CreatePaymentDto,
} from "@/features/matriculas/models/EnrollmentModels";
import { PaymentService } from "@/shared/services/api/paymentService";

interface PrepaymentFormProps {
  enrollment: EnrollmentResponse;
  plan: Plan | null;
  onClose: () => void;
  onSuccess: () => void;
  campusId: number;
}

interface MonthSelection {
  mes: string;
  nombre: string;
  monto: number;
  seleccionado: boolean;
  esParcial: boolean;
}

const PrepaymentForm: React.FC<PrepaymentFormProps> = ({
  enrollment,
  plan,
  onClose,
  onSuccess,
  campusId,
}) => {
  const [months, setMonths] = useState<MonthSelection[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [metodo, setMetodo] = useState("EFECTIVO");
  const [numeroBoleta, setNumeroBoleta] = useState("");

  const monthlyPrice = plan?.costoPension || 329; // Fallback to 329 as in example
  const maxMonths = plan?.duracionMeses || 12;

  useEffect(() => {
    generateMonths();
  }, [enrollment, plan]);

  const generateMonths = () => {
    const monthsArray: MonthSelection[] = [];
    const startDate = new Date();
    // Start from next month
    startDate.setMonth(startDate.getMonth() + 1);

    const monthNames = [
      "ENERO",
      "FEBRERO",
      "MARZO",
      "ABRIL",
      "MAYO",
      "JUNIO",
      "JULIO",
      "AGOSTO",
      "SEPTIEMBRE",
      "OCTUBRE",
      "NOVIEMBRE",
      "DICIEMBRE",
    ];

    for (let i = 0; i < maxMonths; i++) {
      const current = new Date(startDate);
      current.setMonth(startDate.getMonth() + i);

      const monthYear = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
      const label = `${monthNames[current.getMonth()]} ${current.getFullYear()}`;

      monthsArray.push({
        mes: monthYear,
        nombre: label,
        monto: monthlyPrice,
        seleccionado: false,
        esParcial: false,
      });
    }
    setMonths(monthsArray);
  };

  const toggleMonth = (index: number) => {
    const newMonths = [...months];
    newMonths[index].seleccionado = !newMonths[index].seleccionado;
    setMonths(newMonths);
  };

  const toggleParcial = (index: number) => {
    const newMonths = [...months];
    newMonths[index].esParcial = !newMonths[index].esParcial;
    if (!newMonths[index].esParcial) {
      newMonths[index].monto = monthlyPrice;
    }
    setMonths(newMonths);
  };

  const handleMontoChange = (index: number, value: string) => {
    const newMonths = [...months];
    newMonths[index].monto = Number(value);
    setMonths(newMonths);
  };

  const selectedMonths = months.filter((m) => m.seleccionado);
  const totalAmount = selectedMonths.reduce((sum, m) => sum + m.monto, 0);

  const handleSubmit = async () => {
    if (selectedMonths.length === 0) {
      alert("Seleccione al menos un mes para pagar");
      return;
    }

    if (!numeroBoleta) {
      alert("Ingrese el número de boleta");
      return;
    }

    setIsSaving(true);
    try {
      const paymentData: CreatePaymentDto = {
        enrollmentId: enrollment.id,
        monto: totalAmount,
        tipo: "PAGO_ADELANTADO",
        metodo: metodo,
        numeroBoleta: numeroBoleta,
        fechaPago: new Date().toISOString(),
        campusId: campusId,
        esAdelantado: true,
        mesesAdelantados: selectedMonths.map((m) => ({
          mes: m.mes,
          monto: m.monto,
        })),
      };

      await PaymentService.create(paymentData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating prepayment:", error);
      alert("Error al procesar el pago");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.headerInfo}>
            <h2>
              <Calendar className={styles.headerIcon} />
              Pagos Adelantados
            </h2>
            <p className={styles.planInfo}>
              Plan: {plan?.name} — S/. {monthlyPrice}/mes
            </p>
          </div>
          <button className={styles.btnClose} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.selectionArea}>
            <h3>Seleccione meses a pagar adelantado:</h3>
            <div className={styles.monthsGrid}>
              {months.map((m, index) => (
                <div
                  key={m.mes}
                  className={`${styles.monthCard} ${m.seleccionado ? styles.selected : ""}`}
                >
                  <div
                    className={styles.monthHeader}
                    onClick={() => toggleMonth(index)}
                  >
                    <input
                      type="checkbox"
                      checked={m.seleccionado}
                      onChange={() => {}}
                    />
                    <span className={styles.monthName}>{m.nombre}</span>
                    <span className={styles.monthPrice}>
                      S/. {monthlyPrice}
                    </span>
                  </div>

                  {m.seleccionado && (
                    <div className={styles.parcialControl}>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={m.esParcial}
                          onChange={() => toggleParcial(index)}
                        />
                        <span className={styles.slider}></span>
                        <span className={styles.parcialLabel}>
                          Pago Parcial
                        </span>
                      </label>

                      {m.esParcial && (
                        <div className={styles.montoInput}>
                          <span>Monto: S/.</span>
                          <input
                            type="number"
                            value={m.monto}
                            onChange={(e) =>
                              handleMontoChange(index, e.target.value)
                            }
                            min="1"
                            max={monthlyPrice}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.paymentDetails}>
            <div className={styles.formGroup}>
              <label>Método de Pago</label>
              <select
                value={metodo}
                onChange={(e) => setMetodo(e.target.value)}
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Número de Boleta</label>
              <input
                type="text"
                value={numeroBoleta}
                onChange={(e) => setNumeroBoleta(e.target.value)}
                placeholder="Ej: B001-000123"
              />
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <div className={styles.totalArea}>
            <span className={styles.totalLabel}>TOTAL A PAGAR:</span>
            <span className={styles.totalValue}>
              S/. {totalAmount.toFixed(2)}
            </span>
          </div>
          <div className={styles.actions}>
            <button className={styles.btnCancel} onClick={onClose}>
              Cancelar
            </button>
            <button
              className={styles.btnSubmit}
              onClick={handleSubmit}
              disabled={isSaving || selectedMonths.length === 0}
            >
              {isSaving ? (
                <>
                  <Loader2 className={styles.spinner} size={18} />
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  Confirmar Pago
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrepaymentForm;
