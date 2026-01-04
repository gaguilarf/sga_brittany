"use client";

import styles from "./page.module.css";
import { useMatricula } from "@/features/matriculas/hooks/useMatricula";
import { StudentStep } from "@/features/matriculas/components/steps/StudentStep";
import { ConfigurationStep } from "@/features/matriculas/components/steps/ConfigurationStep";
import { PaymentStep } from "@/features/matriculas/components/steps/PaymentStep";
import { ConfirmationStep } from "@/features/matriculas/components/steps/ConfirmationStep";

export default function MatriculasPage() {
  const {
    currentStep,
    loading,
    error,
    errors,
    campuses,
    plans,
    selectedStudent,
    formData,
    handleInputChange,
    handleSearchStudent,
    nextStep,
    prevStep,
    handleFinalAction,
  } = useMatricula();

  return (
    <div className={styles.matriculasContainer}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Registro de Matrícula</h1>
        <p className={styles.pageDescription}>
          {currentStep === 1 && "Paso 1: Datos del Estudiante."}
          {currentStep === 2 && "Paso 2: Sede, Plan y Configuración Académica."}
          {currentStep === 3 && "Paso 3: Registro de Pago."}
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
                  {step === 3 && "Pago"}
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
          <StudentStep
            formData={formData}
            errors={errors}
            handleChange={handleInputChange}
            handleSearchStudent={handleSearchStudent}
            loading={loading}
            selectedStudent={selectedStudent}
          />
        )}

        {currentStep === 2 && (
          <ConfigurationStep
            formData={formData}
            errors={errors}
            handleChange={handleInputChange}
            campuses={campuses}
            plans={plans}
          />
        )}

        {currentStep === 3 && (
          <PaymentStep
            formData={formData}
            errors={errors}
            handleChange={handleInputChange}
          />
        )}

        {currentStep === 4 && (
          <ConfirmationStep
            formData={formData}
            campuses={campuses}
            plans={plans}
          />
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
                disabled={loading}
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
