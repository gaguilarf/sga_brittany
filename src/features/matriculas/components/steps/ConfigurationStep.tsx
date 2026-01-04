import styles from "../page.module.css";
import { Campus, Plan } from "@/features/matriculas/models/EnrollmentModels";

interface Props {
  formData: any;
  errors: Record<string, string>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  campuses: Campus[];
  plans: Plan[];
}

export const ConfigurationStep = ({
  formData,
  errors,
  handleChange,
  campuses,
  plans,
}: Props) => {
  const timeOptions = Array.from({ length: 15 }, (_, i) => {
    const hour = i + 7;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  return (
    <div className={styles.formGrid}>
      <div className={styles.column}>
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3>Sede y Plan Comercial</h3>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <select
                  name="campusId"
                  id="campusId"
                  value={formData.campusId}
                  onChange={handleChange}
                  className={`${styles.select} ${
                    errors.campusId ? styles.invalid : ""
                  }`}
                  required
                >
                  <option value="" disabled hidden>
                    Seleccione una sede
                  </option>
                  {campuses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <label htmlFor="campusId" className={styles.label}>
                  Sede <span className={styles.required}>*</span>
                </label>
                {errors.campusId && (
                  <span className={styles.errorText}>{errors.campusId}</span>
                )}
              </div>
            </div>
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <select
                  name="planId"
                  id="planId"
                  value={formData.planId}
                  onChange={handleChange}
                  className={`${styles.select} ${
                    errors.planId ? styles.invalid : ""
                  }`}
                  required
                >
                  <option value="" disabled hidden>
                    Seleccione un plan
                  </option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.costoPension ? `- S/.${p.costoPension}` : ""}
                    </option>
                  ))}
                </select>
                <label htmlFor="planId" className={styles.label}>
                  Plan Comercial <span className={styles.required}>*</span>
                </label>
                {errors.planId && (
                  <span className={styles.errorText}>{errors.planId}</span>
                )}
              </div>
            </div>
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <select
                  name="modalidad"
                  id="modalidad"
                  value={formData.modalidad}
                  onChange={handleChange}
                  className={styles.select}
                  required
                >
                  <option value="Presencial">Presencial</option>
                  <option value="Virtual">Virtual</option>
                </select>
                <label htmlFor="modalidad" className={styles.label}>
                  Modalidad <span className={styles.required}>*</span>
                </label>
              </div>
            </div>
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <input
                  name="nivel"
                  id="nivel"
                  value={formData.nivel}
                  onChange={handleChange}
                  type="text"
                  placeholder="Ej. Básico A1"
                  className={`${styles.input} ${
                    errors.nivel ? styles.invalid : ""
                  }`}
                  required
                />
                <label htmlFor="nivel" className={styles.label}>
                  Nivel / Ciclo <span className={styles.required}>*</span>
                </label>
                {errors.nivel && (
                  <span className={styles.errorText}>{errors.nivel}</span>
                )}
              </div>
            </div>
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <select
                  name="tipoInscripcion"
                  id="tipoInscripcion"
                  value={formData.tipoInscripcion}
                  onChange={handleChange}
                  className={`${styles.select} ${
                    errors.tipoInscripcion ? styles.invalid : ""
                  }`}
                  required
                >
                  <option value="" disabled hidden>
                    Seleccione tipo
                  </option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Oficina">Oficina</option>
                </select>
                <label htmlFor="tipoInscripcion" className={styles.label}>
                  Tipo de Inscripción <span className={styles.required}>*</span>
                </label>
                {errors.tipoInscripcion && (
                  <span className={styles.errorText}>
                    {errors.tipoInscripcion}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className={styles.column}>
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3>Horario de Clases</h3>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <input
                  name="diaClase"
                  id="diaClase"
                  value={formData.diaClase}
                  onChange={handleChange}
                  type="text"
                  placeholder="Ej. Lun-Mie-Vie"
                  className={`${styles.input} ${
                    errors.diaClase ? styles.invalid : ""
                  }`}
                  required
                />
                <label htmlFor="diaClase" className={styles.label}>
                  Días de clase <span className={styles.required}>*</span>
                </label>
                {errors.diaClase && (
                  <span className={styles.errorText}>{errors.diaClase}</span>
                )}
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.formGroup}>
                <div className={styles.inputWrapper}>
                  <select
                    name="horaInicio"
                    id="horaInicio"
                    value={formData.horaInicio}
                    onChange={handleChange}
                    className={`${styles.select} ${
                      errors.horaInicio ? styles.invalid : ""
                    }`}
                    required
                  >
                    <option value="">--:--</option>
                    {timeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="horaInicio" className={styles.label}>
                    Inicio <span className={styles.required}>*</span>
                  </label>
                  {errors.horaInicio && (
                    <span className={styles.errorText}>
                      {errors.horaInicio}
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.formGroup}>
                <div className={styles.inputWrapper}>
                  <select
                    name="horaFin"
                    id="horaFin"
                    value={formData.horaFin}
                    onChange={handleChange}
                    className={`${styles.select} ${
                      errors.horaFin ? styles.invalid : ""
                    }`}
                    required
                  >
                    <option value="">--:--</option>
                    {timeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="horaFin" className={styles.label}>
                    Fin <span className={styles.required}>*</span>
                  </label>
                  {errors.horaFin && (
                    <span className={styles.errorText}>{errors.horaFin}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
