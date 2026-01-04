"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { StudentService } from "@/shared/services/api/studentService";
import { CampusService } from "@/shared/services/api/campusService";
import { PlanService } from "@/shared/services/api/planService";
import { EnrollmentService } from "@/shared/services/api/enrollmentService";
import { Student, Campus, Plan } from "../models/EnrollmentModels";

export default function MatriculasPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Static data
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [formData, setFormData] = useState({
    // Step 1: Estudiante
    id: null as number | null, // Student ID if exists
    nombre: "",
    dni: "",
    fechaNacimiento: "",
    edad: "",
    distrito: "",
    celularAlumno: "",
    celularApoderado: "",
    email: "",

    // Step 2: Sede y Plan
    campusId: "",
    planId: "",

    // Step 3: Configuración Académica
    modalidad: "Virtual",
    horario: "",
    nivel: "",
    tipoInscripcion: "",

    // Step 4: Datos Administrativos
    advisorId: "",
    origen: "",
    numeroBoleta: "",
    saldo: 0,

    // UI states (not in DTO)
    institucionAnterior: "",
    diaClase: "",
    horaInicio: "",
    horaFin: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activeCampuses, activePlans] = await Promise.all([
          CampusService.getActive(),
          PlanService.getActive(),
        ]);
        setCampuses(activeCampuses);
        setPlans(activePlans);
      } catch (err) {
        console.error("Error fetching static data:", err);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "fechaNacimiento") {
      const birthDate = new Date(value);
      if (!isNaN(birthDate.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          edad: age.toString(),
        }));
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchStudent = async () => {
    if (!formData.dni || formData.dni.length < 8) return;
    setLoading(true);
    setError(null);
    try {
      const student = await StudentService.getByDni(formData.dni);
      if (student) {
        setSelectedStudent(student);
        // Split nombre into nombres and apellidos if possible, or just use nombre
        // Backend seems to use 'nombre' (full name)
        setFormData((prev) => ({
          ...prev,
          id: student.id,
          nombre: student.nombre,
          dni: student.dni || prev.dni,
          fechaNacimiento: student.fechaNacimiento || "",
          edad: student.edad?.toString() || "",
          distrito: student.distrito || "",
          celularAlumno: student.celularAlumno || "",
          celularApoderado: student.celularApoderado || "",
          email: student.correo || "",
        }));
      } else {
        setSelectedStudent(null);
        setFormData((prev) => ({ ...prev, id: null }));
        // Keep DNI but clear others or leave for new student
      }
    } catch (err) {
      setError("Error al buscar estudiante");
    } finally {
      setLoading(false);
    }
  };

  const canAdvance = (step: number): boolean => {
    if (step === 1) {
      return (
        !!formData.nombre &&
        !!formData.dni &&
        formData.dni.length >= 8 &&
        !!formData.distrito &&
        !!formData.edad &&
        !!formData.celularApoderado
      );
    }
    if (step === 2) {
      return (
        !!formData.campusId &&
        !!formData.planId &&
        !!formData.nivel &&
        !!formData.tipoInscripcion
      );
    }
    if (step === 3) {
      return !!formData.advisorId;
    }
    return true;
  };

  const validateStep = (step: number): boolean => {
    setError(null);
    if (!canAdvance(step)) {
      if (step === 1) {
        if (!formData.nombre) setError("El nombre completo es obligatorio.");
        else if (!formData.dni) setError("El DNI es obligatorio.");
        else if (formData.dni.length < 8)
          setError("El DNI debe tener al menos 8 caracteres.");
        else if (!formData.distrito) setError("Seleccione un distrito.");
        else if (!formData.edad) setError("La edad es obligatoria.");
        else if (!formData.celularApoderado)
          setError("El celular del apoderado es obligatorio.");
      } else if (step === 2) {
        setError("Complete todos los campos obligatorios de configuración.");
      } else if (step === 3) {
        setError("El ID del asesor es obligatorio.");
      }
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleFinalAction = async () => {
    setLoading(true);
    setError(null);
    try {
      let studentId = formData.id;

      // If no student selected/found, create one
      if (!studentId) {
        const newStudent = await StudentService.create({
          nombre: formData.nombre.trim(),
          dni: formData.dni,
          fechaNacimiento: formData.fechaNacimiento || undefined,
          edad: formData.edad ? parseInt(formData.edad) : undefined,
          distrito: formData.distrito,
          celularAlumno: formData.celularAlumno,
          celularApoderado: formData.celularApoderado,
          correo: formData.email,
        });
        studentId = newStudent.id;
      }

      await EnrollmentService.create({
        studentId: studentId!,
        campusId: parseInt(formData.campusId) || 0,
        planId: parseInt(formData.planId) || 0,
        modalidad: formData.modalidad,
        horario:
          `${formData.diaClase} ${formData.horaInicio}-${formData.horaFin}`.trim() ||
          formData.horario,
        nivel: formData.nivel,
        tipoInscripcion: formData.tipoInscripcion,
        advisorId: parseInt(formData.advisorId) || 0,
        origen: formData.origen,
        numeroBoleta: formData.numeroBoleta,
        saldo: Number(formData.saldo) || 0,
      });

      alert("Matrícula registrada con éxito");
      // Reset or redirect
      window.location.href = "/admin/dashboard";
    } catch (err: any) {
      setError(err.message || "Error al registrar matrícula");
    } finally {
      setLoading(false);
    }
  };

  // Opciones de hora para los selectores
  const timeOptions = Array.from({ length: 15 }, (_, i) => {
    const hour = i + 7;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  return (
    <div className={styles.matriculasContainer}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Registro de Matrícula</h1>
        <p className={styles.pageDescription}>
          {currentStep === 1 && "Paso 1: Datos del Estudiante."}
          {currentStep === 2 && "Paso 2: Sede, Plan y Configuración Académica."}
          {currentStep === 3 && "Paso 3: Datos administrativos y facturación."}
          {currentStep === 4 && "Paso 4: Resumen y confirmación final."}
        </p>
      </header>

      {/* Stepper */}
      <div className={styles.stepperContainer}>
        <div className={styles.stepper}>
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className={styles.stepWrapper}>
              <div
                className={`${styles.step} ${
                  currentStep >= step ? styles.activeStep : ""
                }`}
              >
                <div className={styles.stepNumber}>{step}</div>
                <span className={styles.stepLabel}>
                  {step === 1 && "Estudiante"}
                  {step === 2 && "Configuración"}
                  {step === 3 && "Administrativo"}
                  {step === 4 && "Confirmación"}
                </span>
              </div>
              {step < 4 && (
                <div
                  className={`${styles.stepLine} ${
                    currentStep > step ? styles.activeLine : ""
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.formContent}>
        {currentStep === 1 && (
          <div className={styles.formGrid}>
            <div className={styles.column}>
              <section className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <h3>Datos Personales</h3>
                </div>
                <div className={styles.sectionBody}>
                  <div className={styles.rowFull}>
                    <div className={styles.formGroup}>
                      <div className={styles.inputWrapper}>
                        <input
                          name="nombre"
                          id="nombre"
                          value={formData.nombre}
                          onChange={handleInputChange}
                          type="text"
                          placeholder=" "
                          className={styles.input}
                          required
                        />
                        <label htmlFor="nombre" className={styles.label}>
                          Nombre Completo{" "}
                          <span className={styles.required}>*</span>
                        </label>
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
                          onChange={handleInputChange}
                          type="text"
                          placeholder=" "
                          className={styles.input}
                          required
                        />
                        <label htmlFor="dni" className={styles.label}>
                          DNI / Documento{" "}
                          <span className={styles.required}>*</span>
                        </label>
                        <button
                          type="button"
                          className={styles.searchBtn}
                          onClick={handleSearchStudent}
                          disabled={loading || formData.dni.length < 8}
                        >
                          {loading ? "..." : "🔍"}
                        </button>
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
                          onChange={handleInputChange}
                          type="date"
                          className={styles.input}
                          required
                        />
                        <label
                          htmlFor="fechaNacimiento"
                          className={styles.label}
                        >
                          Fecha de Nacimiento{" "}
                          <span className={styles.required}>*</span>
                        </label>
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
                          onChange={handleInputChange}
                          type="number"
                          placeholder=" "
                          className={styles.input}
                          required
                          readOnly={!!formData.fechaNacimiento}
                        />
                        <label htmlFor="edad" className={styles.label}>
                          Edad <span className={styles.required}>*</span>
                        </label>
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <div className={styles.inputWrapper}>
                        <input
                          name="distrito"
                          id="distrito"
                          value={formData.distrito}
                          onChange={handleInputChange}
                          type="text"
                          placeholder=" "
                          className={styles.input}
                          required
                        />
                        <label htmlFor="distrito" className={styles.label}>
                          Distrito <span className={styles.required}>*</span>
                        </label>
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
                        onChange={handleInputChange}
                        type="text"
                        placeholder=" "
                        className={styles.input}
                        required
                      />
                      <label htmlFor="celularAlumno" className={styles.label}>
                        Celular del Alumno{" "}
                        <span className={styles.required}>*</span>
                      </label>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <div className={styles.inputWrapper}>
                      <input
                        name="celularApoderado"
                        id="celularApoderado"
                        value={formData.celularApoderado}
                        onChange={handleInputChange}
                        type="text"
                        placeholder=" "
                        className={styles.input}
                      />
                      <label
                        htmlFor="celularApoderado"
                        className={styles.label}
                      >
                        Celular del Apoderado
                      </label>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <div className={styles.inputWrapper}>
                      <input
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        type="email"
                        placeholder=" "
                        className={styles.input}
                        required={formData.modalidad === "Virtual"}
                      />
                      <label htmlFor="email" className={styles.label}>
                        Correo electrónico{" "}
                        {formData.modalidad === "Virtual" ? "*" : "(Opcional)"}
                      </label>
                      {formData.email.includes("@") && (
                        <span className={styles.checkIcon}>✓</span>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {currentStep === 2 && (
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
                        onChange={handleInputChange}
                        className={styles.select}
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
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <div className={styles.inputWrapper}>
                      <select
                        name="planId"
                        id="planId"
                        value={formData.planId}
                        onChange={handleInputChange}
                        className={styles.select}
                        required
                      >
                        <option value="" disabled hidden>
                          Seleccione un plan
                        </option>
                        {plans.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}{" "}
                            {p.costoPension ? `- S/.${p.costoPension}` : ""}
                          </option>
                        ))}
                      </select>
                      <label htmlFor="planId" className={styles.label}>
                        Plan Comercial{" "}
                        <span className={styles.required}>*</span>
                      </label>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <div className={styles.inputWrapper}>
                      <select
                        name="modalidad"
                        id="modalidad"
                        value={formData.modalidad}
                        onChange={handleInputChange}
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
                        onChange={handleInputChange}
                        type="text"
                        placeholder="Ej. Básico A1"
                        className={styles.input}
                        required
                      />
                      <label htmlFor="nivel" className={styles.label}>
                        Nivel / Ciclo <span className={styles.required}>*</span>
                      </label>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <div className={styles.inputWrapper}>
                      <select
                        name="tipoInscripcion"
                        id="tipoInscripcion"
                        value={formData.tipoInscripcion}
                        onChange={handleInputChange}
                        className={styles.select}
                        required
                      >
                        <option value="" disabled hidden>
                          Seleccione tipo
                        </option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Oficina">Oficina</option>
                      </select>
                      <label htmlFor="tipoInscripcion" className={styles.label}>
                        Tipo de Inscripción{" "}
                        <span className={styles.required}>*</span>
                      </label>
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
                        onChange={handleInputChange}
                        type="text"
                        placeholder="Ej. Lun-Mie-Vie"
                        className={styles.input}
                      />
                      <label htmlFor="diaClase" className={styles.label}>
                        Días de clase
                      </label>
                    </div>
                  </div>
                  <div className={styles.row}>
                    <div className={styles.formGroup}>
                      <div className={styles.inputWrapper}>
                        <select
                          name="horaInicio"
                          id="horaInicio"
                          value={formData.horaInicio}
                          onChange={handleInputChange}
                          className={styles.select}
                        >
                          <option value="">--:--</option>
                          {timeOptions.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                        <label htmlFor="horaInicio" className={styles.label}>
                          Inicio
                        </label>
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <div className={styles.inputWrapper}>
                        <select
                          name="horaFin"
                          id="horaFin"
                          value={formData.horaFin}
                          onChange={handleInputChange}
                          className={styles.select}
                        >
                          <option value="">--:--</option>
                          {timeOptions.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                        <label htmlFor="horaFin" className={styles.label}>
                          Fin
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className={styles.formGrid}>
            <div className={styles.column}>
              <section className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <h3>Datos Administrativos</h3>
                </div>
                <div className={styles.sectionBody}>
                  <div className={styles.formGroup}>
                    <div className={styles.inputWrapper}>
                      <input
                        name="advisorId"
                        id="advisorId"
                        value={formData.advisorId}
                        onChange={handleInputChange}
                        type="number"
                        placeholder="ID del asesor"
                        className={styles.input}
                        required
                      />
                      <label htmlFor="advisorId" className={styles.label}>
                        ID Asesor Comercial{" "}
                        <span className={styles.required}>*</span>
                      </label>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <div className={styles.inputWrapper}>
                      <select
                        name="origen"
                        id="origen"
                        value={formData.origen}
                        onChange={handleInputChange}
                        className={styles.select}
                      >
                        <option value="">Seleccione origen</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Tiktok">Tiktok</option>
                        <option value="Recomendación">Recomendación</option>
                        <option value="Otro">Otro</option>
                      </select>
                      <label htmlFor="origen" className={styles.label}>
                        Origen del Lead
                      </label>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            <div className={styles.column}>
              <section className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <h3>Facturación y Saldo</h3>
                </div>
                <div className={styles.sectionBody}>
                  <div className={styles.formGroup}>
                    <div className={styles.inputWrapper}>
                      <input
                        name="numeroBoleta"
                        id="numeroBoleta"
                        value={formData.numeroBoleta}
                        onChange={handleInputChange}
                        type="text"
                        placeholder="Nro. Boleta/Recibo"
                        className={styles.input}
                      />
                      <label htmlFor="numeroBoleta" className={styles.label}>
                        Nro. de Boleta
                      </label>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <div className={styles.inputWrapper}>
                      <input
                        name="saldo"
                        id="saldo"
                        value={formData.saldo}
                        onChange={handleInputChange}
                        type="number"
                        className={styles.input}
                      />
                      <label htmlFor="saldo" className={styles.label}>
                        Saldo Pendiente (S/.)
                      </label>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className={styles.confirmationWrapper}>
            <section className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h3>Resumen de Matrícula</h3>
              </div>
              <div className={styles.sectionBody}>
                <div className={styles.summaryGrid}>
                  <div className={styles.summaryItem}>
                    <strong>Estudiante:</strong> {formData.nombre}
                  </div>
                  <div className={styles.summaryItem}>
                    <strong>DNI:</strong> {formData.dni}
                  </div>
                  <div className={styles.summaryItem}>
                    <strong>Sede:</strong>{" "}
                    {campuses.find((c) => c.id.toString() === formData.campusId)
                      ?.name || "No seleccionada"}
                  </div>
                  <div className={styles.summaryItem}>
                    <strong>Plan:</strong>{" "}
                    {plans.find((p) => p.id.toString() === formData.planId)
                      ?.name || "No seleccionado"}
                  </div>
                  <div className={styles.summaryItem}>
                    <strong>Modalidad:</strong> {formData.modalidad}
                  </div>
                  <div className={styles.summaryItem}>
                    <strong>Nivel:</strong> {formData.nivel}
                  </div>
                  <div className={styles.summaryItem}>
                    <strong>Inscripción:</strong> {formData.tipoInscripcion}
                  </div>
                  <div className={styles.summaryItem}>
                    <strong>Boleta:</strong> {formData.numeroBoleta || "N/A"}
                  </div>
                  <div className={styles.summaryItem}>
                    <strong>Saldo:</strong> S/. {formData.saldo}
                  </div>
                  <div className={styles.summaryItem}>
                    <strong>Horario:</strong> {formData.diaClase}{" "}
                    {formData.horaInicio}-{formData.horaFin}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {error && (
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>{error}</p>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <footer className={styles.formFooter}>
        <div className={styles.footerButtons}>
          <div className={styles.leftBtn}>
            {currentStep > 1 && (
              <button
                className={styles.btnBack}
                onClick={prevStep}
                disabled={loading}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Atrás
              </button>
            )}
          </div>
          <div className={styles.rightBtn}>
            {currentStep < 4 ? (
              <button
                className={styles.btnNext}
                onClick={nextStep}
                disabled={loading || !canAdvance(currentStep)}
              >
                Siguiente
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ) : (
              <button
                className={styles.btnRegister}
                onClick={handleFinalAction}
                disabled={loading}
              >
                {loading ? "Procesando..." : "Finalizar Matrícula"}
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
