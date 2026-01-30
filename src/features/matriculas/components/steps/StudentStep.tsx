import styles from "../page.module.css";
import { Student } from "@/features/matriculas/models/EnrollmentModels";

interface Props {
  formData: any;
  errors: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearchStudent: () => void;
  loading: boolean;
  selectedStudent: Student | null;
  isExistingStudent?: boolean;
}

export const StudentStep = ({
  formData,
  errors,
  handleChange,
  handleSearchStudent,
  loading,
  selectedStudent,
  isExistingStudent = false,
}: Props) => {
  return (
    <div className={styles.formGrid}>
      <div className={styles.column}>
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3>
              Datos Personales{" "}
              {isExistingStudent && (
                <span className={styles.readOnlyBadge}>SÓLO LECTURA</span>
              )}
            </h3>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.rowFull}>
              <div className={styles.formGroup}>
                <div className={styles.inputWrapper}>
                  <input
                    name="nombre"
                    id="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    type="text"
                    placeholder=" "
                    className={`${styles.input} ${
                      errors.nombre ? styles.invalid : ""
                    }`}
                    required
                    disabled={isExistingStudent}
                  />
                  <label htmlFor="nombre" className={styles.label}>
                    Nombre Completo <span className={styles.required}>*</span>
                  </label>
                  {errors.nombre && (
                    <span className={styles.errorText}>{errors.nombre}</span>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.formGroup}>
                <div className={styles.inputWrapper}>
                  <input
                    name="dni"
                    id="dni"
                    value={formData.dni}
                    onChange={handleChange}
                    type="text"
                    placeholder=" "
                    className={`${styles.input} ${
                      errors.dni ? styles.invalid : ""
                    }`}
                    required
                    disabled={isExistingStudent}
                  />
                  <label htmlFor="dni" className={styles.label}>
                    DNI / Documento <span className={styles.required}>*</span>
                  </label>
                  {errors.dni && (
                    <span className={styles.errorText}>{errors.dni}</span>
                  )}

                  {selectedStudent && (
                    <span className={styles.checkIcon}>✓</span>
                  )}
                </div>
              </div>
              <div className={styles.formGroup}>
                <div className={styles.inputWrapper}>
                  <input
                    name="fechaNacimiento"
                    id="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleChange}
                    type="date"
                    className={`${styles.input} ${
                      errors.fechaNacimiento ? styles.invalid : ""
                    }`}
                    disabled={isExistingStudent}
                  />
                  <label htmlFor="fechaNacimiento" className={styles.label}>
                    Fecha de Nacimiento{" "}
                    {!formData.edad && (
                      <span className={styles.required}>*</span>
                    )}
                  </label>
                  {errors.fechaNacimiento && (
                    <span className={styles.errorText}>
                      {errors.fechaNacimiento}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.formGroup}>
                <div className={styles.inputWrapper}>
                  <input
                    name="edad"
                    id="edad"
                    value={formData.edad}
                    onChange={handleChange}
                    type="number"
                    placeholder=" "
                    className={`${styles.input} ${
                      errors.edad ? styles.invalid : ""
                    }`}
                    required
                    readOnly={!!formData.fechaNacimiento}
                    disabled={isExistingStudent}
                  />
                  <label htmlFor="edad" className={styles.label}>
                    Edad <span className={styles.required}>*</span>
                  </label>
                  {errors.edad && (
                    <span className={styles.errorText}>{errors.edad}</span>
                  )}
                </div>
              </div>
              <div className={styles.formGroup}>
                <div className={styles.inputWrapper}>
                  <input
                    name="distrito"
                    id="distrito"
                    value={formData.distrito}
                    onChange={handleChange}
                    type="text"
                    placeholder=" "
                    className={`${styles.input} ${
                      errors.distrito ? styles.invalid : ""
                    }`}
                    required
                    disabled={isExistingStudent}
                  />
                  <label htmlFor="distrito" className={styles.label}>
                    Distrito <span className={styles.required}>*</span>
                  </label>
                  {errors.distrito && (
                    <span className={styles.errorText}>{errors.distrito}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className={styles.column}>
        <section className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3>Datos de Contacto</h3>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <input
                  name="celularAlumno"
                  id="celularAlumno"
                  value={formData.celularAlumno}
                  onChange={handleChange}
                  type="text"
                  placeholder=" "
                  className={`${styles.input} ${
                    errors.celularAlumno ? styles.invalid : ""
                  }`}
                  disabled={isExistingStudent}
                />
                <label htmlFor="celularAlumno" className={styles.label}>
                  Celular del Alumno
                </label>
                {errors.celularAlumno && (
                  <span className={styles.errorText}>
                    {errors.celularAlumno}
                  </span>
                )}
              </div>
            </div>
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <input
                  name="celularApoderado"
                  id="celularApoderado"
                  value={formData.celularApoderado}
                  onChange={handleChange}
                  type="text"
                  placeholder=" "
                  className={`${styles.input} ${
                    errors.celularApoderado ? styles.invalid : ""
                  }`}
                  disabled={isExistingStudent}
                />
                <label htmlFor="celularApoderado" className={styles.label}>
                  Celular del Apoderado
                </label>
                {errors.celularApoderado && (
                  <span className={styles.errorText}>
                    {errors.celularApoderado}
                  </span>
                )}
              </div>
            </div>
            <div className={styles.formGroup}>
              <div className={styles.inputWrapper}>
                <input
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  placeholder=" "
                  className={`${styles.input} ${
                    errors.email ? styles.invalid : ""
                  }`}
                  required
                  disabled={isExistingStudent}
                />
                <label htmlFor="email" className={styles.label}>
                  Correo electrónico <span className={styles.required}>*</span>
                </label>
                {errors.email && (
                  <span className={styles.errorText}>{errors.email}</span>
                )}
                {formData.email?.includes("@") && !errors.email && (
                  <span className={styles.checkIcon}>✓</span>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
