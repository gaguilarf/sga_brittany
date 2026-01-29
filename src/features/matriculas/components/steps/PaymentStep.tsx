import styles from "../page.module.css";
import { PAYMENT_TYPES } from "../../constants/PaymentTypes";
import { Calendar, Plus, Trash2 } from "lucide-react";

interface Props {
  formData: any;
  errors: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePaymentChange: (index: number, field: string, value: string) => void;
  addPayment: () => void;
  removePayment: (index: number) => void;
  plans: any[];
  campusPrices: any[];
  addPrepaymentMonth: (paymentIndex: number) => void;
  removePrepaymentMonth: (paymentIndex: number, monthIndex: number) => void;
  updatePrepaymentMonth: (
    paymentIndex: number,
    monthIndex: number,
    field: string,
    value: any,
  ) => void;
}

export const PaymentStep = ({
  formData,
  errors,
  handleChange,
  handlePaymentChange,
  addPayment,
  removePayment,
  plans,
  campusPrices,
  addPrepaymentMonth,
  removePrepaymentMonth,
  updatePrepaymentMonth,
}: Props) => {
  // Get all currently selected payment types across all payment rows
  const selectedTypes = formData.payments
    .map((p: any) => p.tipo)
    .filter(Boolean);

  const hasMensualidad = selectedTypes.includes("Mensualidad");
  const hasMensualidadAdelantada = selectedTypes.includes(
    "Mensualidad Adelantada",
  );

  const getMonthOptions = () => {
    const plan = plans.find((p) => p.id === parseInt(formData.planId));
    const duracion = plan?.duracionMeses || 12;

    const monthsArray: Array<{ value: string; label: string }> = [];
    const startDate = new Date();
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

    for (let i = 0; i < duracion; i++) {
      const current = new Date(startDate);
      current.setMonth(startDate.getMonth() + i);
      const monthValue = `${current.getFullYear()}-${String(
        current.getMonth() + 1,
      ).padStart(2, "0")}`;
      const label = `${monthNames[current.getMonth()]} ${current.getFullYear()}`;
      monthsArray.push({ value: monthValue, label });
    }
    return monthsArray;
  };

  const monthOptions = getMonthOptions();
  const currentPlanConfig = campusPrices.find(
    (cp) => cp.planId === parseInt(formData.planId),
  );
  const suggestedMonthlyPrice = currentPlanConfig?.precioMensualidad || 0;

  return (
    <div className={styles.formGrid}>
      <div className={styles.columnFull}>
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3>Facturación y Pagos</h3>
          </div>
          <div className={styles.sectionBody}>
            {/* Facturación - Shared Field */}
            <div className={styles.rowFull}>
              <div className={styles.formGroup}>
                <div className={styles.inputWrapper}>
                  <input
                    name="numeroBoleta"
                    id="numeroBoleta"
                    value={formData.numeroBoleta}
                    onChange={handleChange}
                    type="text"
                    placeholder=" "
                    className={`${styles.input} ${
                      errors.numeroBoleta ? styles.invalid : ""
                    }`}
                    required
                  />
                  <label htmlFor="numeroBoleta" className={styles.label}>
                    Nro. de Boleta / Recibo{" "}
                    <span className={styles.required}>*</span>
                  </label>
                  {errors.numeroBoleta && (
                    <span className={styles.errorText}>
                      {errors.numeroBoleta}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.divider} />

            {/* List of Payments */}
            <div className={styles.paymentsList}>
              <div className={styles.sectionSubHeader}>
                <h4>Detalle de Pagos</h4>
                {errors.payments && (
                  <span className={styles.errorText}>{errors.payments}</span>
                )}
              </div>

              {formData.payments.map((payment: any, index: number) => {
                // Determine which options to show for this specific row
                const isPrepayment = payment.tipo === "Mensualidad Adelantada";
                const isMensualidad = payment.tipo === "Mensualidad";

                const availableTypes = PAYMENT_TYPES.filter((type) => {
                  // If current type is already selected in THIS row, keep it
                  if (type === payment.tipo) return true;

                  // Special case: Allow swapping between Mensualidad and Mensualidad Adelantada in the SAME row
                  if (
                    (type === "Mensualidad" &&
                      payment.tipo === "Mensualidad Adelantada") ||
                    (type === "Mensualidad Adelantada" &&
                      payment.tipo === "Mensualidad")
                  ) {
                    return true;
                  }

                  // Unique Types: Don't allow selecting same type in multiple rows (except Otro)
                  if (type !== "Otro" && selectedTypes.includes(type))
                    return false;

                  // Exclusivity: If other rows have Mensualidad, hide Mensualidad Adelantada and vice-versa
                  if (type === "Mensualidad Adelantada" && hasMensualidad)
                    return false;
                  if (type === "Mensualidad" && hasMensualidadAdelantada)
                    return false;

                  return true;
                });

                return (
                  <div key={index} className={styles.paymentItemCard}>
                    <div className={styles.paymentItemHeader}>
                      <h5>Pago #{index + 1}</h5>
                      {formData.payments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePayment(index)}
                          className={styles.removeBtn}
                          title="Eliminar este pago"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className={styles.paymentRow}>
                      <div className={styles.formGroup}>
                        <div className={styles.inputWrapper}>
                          <select
                            value={payment.tipo}
                            onChange={(e) =>
                              handlePaymentChange(index, "tipo", e.target.value)
                            }
                            className={`${styles.select} ${
                              errors[`payment_${index}_tipo`]
                                ? styles.invalid
                                : ""
                            }`}
                            required
                          >
                            <option value="">Seleccione tipo</option>
                            {availableTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                          <label className={styles.labelFloating}>
                            Tipo de Pago{" "}
                            <span className={styles.required}>*</span>
                          </label>
                          {errors[`payment_${index}_tipo`] && (
                            <span className={styles.errorText}>
                              {errors[`payment_${index}_tipo`]}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <div className={styles.inputWrapper}>
                          <select
                            value={payment.metodo}
                            onChange={(e) =>
                              handlePaymentChange(
                                index,
                                "metodo",
                                e.target.value,
                              )
                            }
                            className={`${styles.select} ${
                              errors[`payment_${index}_metodo`]
                                ? styles.invalid
                                : ""
                            }`}
                            required
                          >
                            <option value="">Seleccione método</option>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia">Transferencia</option>
                            <option value="Tarjeta">Tarjeta</option>
                            <option value="Yape/Plin">Yape/Plin</option>
                          </select>
                          <label className={styles.labelFloating}>
                            Método de Pago{" "}
                            <span className={styles.required}>*</span>
                          </label>
                          {errors[`payment_${index}_metodo`] && (
                            <span className={styles.errorText}>
                              {errors[`payment_${index}_metodo`]}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <div className={styles.inputWrapper}>
                          <input
                            value={payment.monto}
                            onChange={(e) =>
                              handlePaymentChange(
                                index,
                                "monto",
                                e.target.value,
                              )
                            }
                            type="number"
                            placeholder="0.00"
                            className={`${styles.input} ${
                              errors[`payment_${index}_monto`]
                                ? styles.invalid
                                : ""
                            }`}
                            required
                            readOnly={isPrepayment}
                          />
                          <label className={styles.labelFloating}>
                            Monto S/. <span className={styles.required}>*</span>
                          </label>
                          {errors[`payment_${index}_monto`] && (
                            <span className={styles.errorText}>
                              {errors[`payment_${index}_monto`]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isPrepayment && (
                      <div className={styles.prepaymentSection}>
                        <div className={styles.prepaymentHeader}>
                          <div className={styles.prepaymentTitle}>
                            <Calendar size={18} />
                            <span>Gestión de Mensualidades Adelantadas</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => addPrepaymentMonth(index)}
                            className={styles.addMonthBtn}
                          >
                            <Plus size={16} />
                            Agregar mes
                          </button>
                        </div>

                        <div className={styles.monthsTable}>
                          {payment.mesesAdelantados &&
                          payment.mesesAdelantados.length > 0 ? (
                            <div className={styles.monthsListContainer}>
                              {payment.mesesAdelantados.map(
                                (m: any, mIdx: number) => {
                                  const [year, month] = m.mes
                                    .split("-")
                                    .map(Number);
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
                                  const label = `${monthNames[month - 1]} ${year}`;

                                  return (
                                    <div key={mIdx} className={styles.monthRow}>
                                      <div className={styles.monthCol}>
                                        <div className={styles.readOnlyMonth}>
                                          {label}
                                        </div>
                                      </div>
                                      <div className={styles.priceCol}>
                                        <div
                                          className={styles.priceInputWrapper}
                                        >
                                          <span>S/.</span>
                                          <input
                                            type="number"
                                            value={m.monto}
                                            onChange={(e) =>
                                              updatePrepaymentMonth(
                                                index,
                                                mIdx,
                                                "monto",
                                                e.target.value,
                                              )
                                            }
                                            className={styles.monthPriceInput}
                                            placeholder="0.00"
                                          />
                                        </div>
                                      </div>
                                      <div className={styles.actionCol}>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removePrepaymentMonth(index, mIdx)
                                          }
                                          className={styles.deleteMonthBtn}
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          ) : (
                            <div className={styles.emptyMonths}>
                              <p>No se han agregado meses todavía.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={addPayment}
                className={styles.addPaymentBtn}
                disabled={formData.payments.length >= PAYMENT_TYPES.length}
              >
                + Agregar otro pago
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
