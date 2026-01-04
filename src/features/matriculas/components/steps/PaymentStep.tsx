import styles from "../page.module.css";

interface Props {
  formData: any;
  errors: Record<string, string>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}

export const PaymentStep = ({ formData, errors, handleChange }: Props) => {
  return (
    <div className={styles.formGrid}>
      <div className={styles.column}>
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3>Detalle del Pago</h3>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <select
                  name="tipoPago"
                  id="tipoPago"
                  value={formData.tipoPago}
                  onChange={handleChange}
                  className={`${styles.select} ${
                    errors.tipoPago ? styles.invalid : ""
                  }`}
                  required
                >
                  <option value="">Seleccione tipo</option>
                  <option value="Inscripción">Inscripción</option>
                  <option value="Mensualidad">Mensualidad</option>
                  <option value="Materiales">Materiales</option>
                  <option value="Otro">Otro</option>
                </select>
                <label htmlFor="tipoPago" className={styles.label}>
                  Tipo de Pago <span className={styles.required}>*</span>
                </label>
                {errors.tipoPago && (
                  <span className={styles.errorText}>{errors.tipoPago}</span>
                )}
              </div>
            </div>
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <select
                  name="metodoPago"
                  id="metodoPago"
                  value={formData.metodoPago}
                  onChange={handleChange}
                  className={`${styles.select} ${
                    errors.metodoPago ? styles.invalid : ""
                  }`}
                  required
                >
                  <option value="">Seleccione método</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Yape/Plin">Yape/Plin</option>
                </select>
                <label htmlFor="metodoPago" className={styles.label}>
                  Método de Pago <span className={styles.required}>*</span>
                </label>
                {errors.metodoPago && (
                  <span className={styles.errorText}>{errors.metodoPago}</span>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className={styles.column}>
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3>Facturación</h3>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <input
                  name="monto"
                  id="monto"
                  value={formData.monto}
                  onChange={handleChange}
                  type="number"
                  placeholder="0.00"
                  className={`${styles.input} ${
                    errors.monto ? styles.invalid : ""
                  }`}
                  required
                />
                <label htmlFor="monto" className={styles.label}>
                  Monto S/. <span className={styles.required}>*</span>
                </label>
                {errors.monto && (
                  <span className={styles.errorText}>{errors.monto}</span>
                )}
              </div>
            </div>
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <input
                  name="numeroBoleta"
                  id="numeroBoleta"
                  value={formData.numeroBoleta}
                  onChange={handleChange}
                  type="text"
                  placeholder="Nro. Boleta/Recibo"
                  className={`${styles.input} ${
                    errors.numeroBoleta ? styles.invalid : ""
                  }`}
                  required
                />
                <label htmlFor="numeroBoleta" className={styles.label}>
                  Nro. de Boleta <span className={styles.required}>*</span>
                </label>
                {errors.numeroBoleta && (
                  <span className={styles.errorText}>
                    {errors.numeroBoleta}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
