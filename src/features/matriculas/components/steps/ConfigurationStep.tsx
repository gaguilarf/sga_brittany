import styles from "../page.module.css";
import {
  Campus,
  Plan,
  Course,
  Level,
  Cycle,
  Product,
} from "@/features/matriculas/models/EnrollmentModels";
import { PREDEFINED_SCHEDULES } from "../../constants/Schedules";

interface Props {
  formData: any;
  errors: Record<string, string>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  // New handler for enrollment type
  handleEnrollmentTypeChange: (type: "PLAN" | "PRODUCT") => void;
  campuses: Campus[];
  plans: Plan[];
  courses: Course[];
  levels: Level[];
  cycles: Cycle[];
  products: Product[];
}

export const ConfigurationStep = ({
  formData,
  errors,
  handleChange,
  handleEnrollmentTypeChange,
  campuses,
  plans,
  courses,
  levels,
  cycles,
  products,
}: Props) => {
  const timeOptions = Array.from({ length: 60 }, (_, i) => {
    const totalMinutes = i * 15 + 7 * 60; // Start at 7:00 AM
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  });

  // Determine which fields to show based on selected product
  const selectedProduct = products.find(
    (p) => p.id.toString() === formData.productId,
  );
  const showSchedule =
    formData.enrollmentType === "PLAN" ||
    (formData.enrollmentType === "PRODUCT" &&
      selectedProduct?.requiresSchedule &&
      !selectedProduct.name.toLowerCase().includes("british council"));
  const showExamDate =
    formData.enrollmentType === "PRODUCT" &&
    (selectedProduct?.requiresExamDate ||
      selectedProduct?.name.toLowerCase().includes("british council"));

  return (
    <div className={styles.formGrid}>
      <div className={styles.columnFull}>
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3>Configuración de Matrícula</h3>
          </div>
          <div className={styles.sectionBody}>
            {/* 1. Sede Selection (Always Visible) */}
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

            {/* Render rest of form only if campus is selected */}
            {formData.campusId && (
              <>
                {/* 2. Enrollment Type Selection Buttons */}
                <div className={styles.enrollmentTypeToggle}>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${
                      formData.enrollmentType === "PLAN" ? styles.active : ""
                    }`}
                    onClick={() => handleEnrollmentTypeChange("PLAN")}
                  >
                    Plan Académico
                  </button>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${
                      formData.enrollmentType === "PRODUCT" ? styles.active : ""
                    }`}
                    onClick={() => handleEnrollmentTypeChange("PRODUCT")}
                  >
                    Producto / Servicio
                  </button>
                </div>

                <div className={styles.divider} />

                {/* 3. Conditional Flows */}
                {formData.enrollmentType === "PLAN" && (
                  /* === PLAN FLOW === */
                  <div className={styles.flowContainer}>
                    <div className={styles.row}>
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
                                {p.name}
                              </option>
                            ))}
                          </select>
                          <label htmlFor="planId" className={styles.label}>
                            Plan <span className={styles.required}>*</span>
                          </label>
                          {errors.planId && (
                            <span className={styles.errorText}>
                              {errors.planId}
                            </span>
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
                            className={`${styles.select} ${
                              errors.modalidad ? styles.invalid : ""
                            }`}
                            required
                          >
                            <option value="Virtual">Virtual</option>
                            <option value="Presencial">Presencial</option>
                          </select>
                          <label htmlFor="modalidad" className={styles.label}>
                            Modalidad <span className={styles.required}>*</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <div className={styles.inputWrapper}>
                        <select
                          name="courseId"
                          id="courseId"
                          value={formData.courseId}
                          onChange={handleChange}
                          className={`${styles.select} ${
                            errors.courseId ? styles.invalid : ""
                          }`}
                          required
                        >
                          <option value="" disabled hidden>
                            Seleccione un curso
                          </option>
                          {courses.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        <label htmlFor="courseId" className={styles.label}>
                          Curso <span className={styles.required}>*</span>
                        </label>
                        {errors.courseId && (
                          <span className={styles.errorText}>
                            {errors.courseId}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={styles.row}>
                      <div className={styles.formGroup}>
                        <div className={styles.inputWrapper}>
                          <select
                            name="initialLevelId"
                            id="initialLevelId"
                            value={formData.initialLevelId}
                            onChange={handleChange}
                            className={`${styles.select} ${
                              errors.initialLevelId ? styles.invalid : ""
                            }`}
                            disabled={!formData.courseId}
                            required
                          >
                            <option value="" disabled hidden>
                              Seleccione nivel
                            </option>
                            {levels.map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.nombreNivel}
                              </option>
                            ))}
                          </select>
                          <label
                            htmlFor="initialLevelId"
                            className={styles.label}
                          >
                            Nivel <span className={styles.required}>*</span>
                          </label>
                          {errors.initialLevelId && (
                            <span className={styles.errorText}>
                              {errors.initialLevelId}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={styles.formGroup}>
                        <div className={styles.inputWrapper}>
                          <select
                            name="initialCycleId"
                            id="initialCycleId"
                            value={formData.initialCycleId}
                            onChange={handleChange}
                            className={`${styles.select} ${
                              errors.initialCycleId ? styles.invalid : ""
                            }`}
                            disabled={!formData.initialLevelId}
                            required
                          >
                            <option value="" disabled hidden>
                              Seleccione ciclo
                            </option>
                            {cycles.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.nombreCiclo}
                              </option>
                            ))}
                          </select>
                          <label
                            htmlFor="initialCycleId"
                            className={styles.label}
                          >
                            Ciclo <span className={styles.required}>*</span>
                          </label>
                          {errors.initialCycleId && (
                            <span className={styles.errorText}>
                              {errors.initialCycleId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {formData.enrollmentType === "PRODUCT" && (
                  /* === PRODUCT FLOW === */
                  <div className={styles.flowContainer}>
                    <div className={styles.formGroup}>
                      <div className={styles.inputWrapper}>
                        <select
                          name="productId"
                          id="productId"
                          value={formData.productId}
                          onChange={handleChange}
                          className={`${styles.select} ${
                            errors.productId ? styles.invalid : ""
                          }`}
                          required
                        >
                          <option value="" disabled hidden>
                            Seleccione un producto
                          </option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        <label htmlFor="productId" className={styles.label}>
                          Producto <span className={styles.required}>*</span>
                        </label>
                        {errors.productId && (
                          <span className={styles.errorText}>
                            {errors.productId}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={styles.row}>
                      <div className={styles.formGroup}>
                        <div className={styles.inputWrapper}>
                          <select
                            name="modalidad"
                            id="modalidad"
                            value={formData.modalidad}
                            onChange={handleChange}
                            className={`${styles.select} ${
                              errors.modalidad ? styles.invalid : ""
                            }`}
                            required
                          >
                            <option value="Virtual">Virtual</option>
                            <option value="Presencial">Presencial</option>
                          </select>
                          <label htmlFor="modalidad" className={styles.label}>
                            Modalidad <span className={styles.required}>*</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {showExamDate && (
                      <div className={styles.formGroup}>
                        <div className={styles.inputWrapper}>
                          <input
                            name="examDate"
                            id="examDate"
                            type="date"
                            value={formData.examDate}
                            onChange={handleChange}
                            className={`${styles.input} ${
                              errors.examDate ? styles.invalid : ""
                            }`}
                            required
                          />
                          <label htmlFor="examDate" className={styles.label}>
                            Fecha del Examen{" "}
                            <span className={styles.required}>*</span>
                          </label>
                          {errors.examDate && (
                            <span className={styles.errorText}>
                              {errors.examDate}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* === COMMON FIELDS (Only shown if a flow is selected) === */}
                {formData.enrollmentType && (
                  <div
                    className={styles.flowContainer}
                    style={{ marginTop: "1rem" }}
                  >
                    <div className={styles.row}>
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
                          <label
                            htmlFor="tipoInscripcion"
                            className={styles.label}
                          >
                            Tipo de Inscripción{" "}
                            <span className={styles.required}>*</span>
                          </label>
                          {errors.tipoInscripcion && (
                            <span className={styles.errorText}>
                              {errors.tipoInscripcion}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Schedule Section - Conditionally Rendered */}
            {showSchedule && (
              <>
                <div className={styles.divider} />
                <div className={styles.sectionSubHeader}>
                  <h4>Horario de Clases</h4>
                </div>
                <div className={styles.formGroup}>
                  <div className={styles.inputWrapper}>
                    <select
                      name="scheduleOption"
                      id="scheduleOption"
                      value={formData.scheduleOption}
                      onChange={handleChange}
                      className={`${styles.select} ${
                        errors.scheduleOption ? styles.invalid : ""
                      }`}
                      required
                    >
                      <option value="" disabled hidden>
                        Seleccione un horario
                      </option>
                      {PREDEFINED_SCHEDULES.map((s) => (
                        <option key={s.label} value={s.label}>
                          {s.label}
                        </option>
                      ))}
                      <option value="Otro">Otro</option>
                    </select>
                    <label htmlFor="scheduleOption" className={styles.label}>
                      Horario <span className={styles.required}>*</span>
                    </label>
                    {errors.scheduleOption && (
                      <span className={styles.errorText}>
                        {errors.scheduleOption}
                      </span>
                    )}
                  </div>
                </div>

                {formData.scheduleOption === "Otro" && (
                  <div className={styles.manualScheduleFields}>
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
                          Días de clase{" "}
                          <span className={styles.required}>*</span>
                        </label>
                        {errors.diaClase && (
                          <span className={styles.errorText}>
                            {errors.diaClase}
                          </span>
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
                            <span className={styles.errorText}>
                              {errors.horaFin}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
