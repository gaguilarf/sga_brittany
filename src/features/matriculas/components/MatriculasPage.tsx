"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { useMatricula } from "@/features/matriculas/hooks/useMatricula";
import { StudentStep } from "@/features/matriculas/components/steps/StudentStep";
import { ConfigurationStep } from "@/features/matriculas/components/steps/ConfigurationStep";
import { PaymentStep } from "@/features/matriculas/components/steps/PaymentStep";
import { ConfirmationStep } from "@/features/matriculas/components/steps/ConfirmationStep";
import Toast from "@/shared/components/Toast";
import { StudentSearchModal } from "@/features/matriculas/components/StudentSearchModal";
import { UserPlus, UserCheck, ArrowLeft } from "lucide-react";

export default function MatriculasPage() {
  const {
    currentStep,
    loading,
    error,
    errors,
    campuses,
    plans,
    courses,
    levels,
    cycles,
    products,
    selectedStudent,
    formData,
    handleInputChange,
    handleEnrollmentTypeChange,
    handleSearchStudent,
    addPayment,
    removePayment,
    handlePaymentChange,
    addPrepaymentMonth,
    removePrepaymentMonth,
    updatePrepaymentMonth,
    nextStep,
    prevStep,
    handleFinalAction,
    enrollmentFlow,
    isExistingStudent,
    startNewEnrollment,
    startExistingEnrollment,
    resetFlow,
    success,
    setSuccess,
    campusPrices,
  } = useMatricula();

  return (
    <div className={styles.matriculasContainer}>
      {success && (
        <Toast
          message={success}
          type="success"
          onClose={() => setSuccess(null)}
        />
      )}
      <header className={styles.header}>
        {enrollmentFlow !== "selection" && (
          <button className={styles.btnReset} onClick={resetFlow}>
            <ArrowLeft size={18} />
            Volver
          </button>
        )}
        <h1 className={styles.pageTitle}>
          {enrollmentFlow === "selection"
            ? "Registro de Matrícula"
            : isExistingStudent
              ? `Matrícula – ${formData.nombre}`
              : "Registro de Matrícula"}
        </h1>
        <p className={styles.pageDescription}>
          {enrollmentFlow === "selection" &&
            "Selecciona el tipo de alumno para comenzar."}
          {enrollmentFlow !== "selection" &&
            currentStep === 1 &&
            "Paso 1: Datos del Estudiante."}
          {enrollmentFlow !== "selection" &&
            currentStep === 2 &&
            "Paso 2: Sede, Plan y Configuración Académica."}
          {enrollmentFlow !== "selection" &&
            currentStep === 3 &&
            "Paso 3: Registro de Pago."}
          {enrollmentFlow !== "selection" &&
            currentStep === 4 &&
            "Paso 4: Resumen y confirmación final."}
        </p>
      </header>

      {enrollmentFlow === "selection" ? (
        <div className={styles.selectionScreen}>
          <div className={styles.selectionGrid}>
            <button
              className={styles.selectionCard}
              onClick={startNewEnrollment}
            >
              <div className={styles.selectionIcon}>
                <UserPlus size={40} />
              </div>
              <div className={styles.selectionContent}>
                <h3>Alumno Nuevo</h3>
                <p>
                  Registrar un estudiante que no se encuentra en la base de
                  datos.
                </p>
              </div>
            </button>

            <button
              className={styles.selectionCard}
              onClick={() => (window as any).openStudentSearch?.()}
            >
              <div className={styles.selectionIcon}>
                <UserCheck size={40} />
              </div>
              <div className={styles.selectionContent}>
                <h3>Alumno Existente</h3>
                <p>
                  Matricular a un estudiante que ya ha sido registrado
                  previamente.
                </p>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <>
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
                isExistingStudent={isExistingStudent}
              />
            )}

            {currentStep === 2 && (
              <ConfigurationStep
                formData={formData}
                errors={errors}
                handleChange={handleInputChange}
                handleEnrollmentTypeChange={handleEnrollmentTypeChange}
                campuses={campuses}
                plans={plans}
                courses={courses}
                levels={levels}
                cycles={cycles}
                products={products}
              />
            )}

            {currentStep === 3 && (
              <PaymentStep
                formData={formData}
                errors={errors}
                handleChange={handleInputChange}
                handlePaymentChange={handlePaymentChange}
                addPayment={addPayment}
                removePayment={removePayment}
                plans={plans}
                addPrepaymentMonth={addPrepaymentMonth}
                removePrepaymentMonth={removePrepaymentMonth}
                updatePrepaymentMonth={updatePrepaymentMonth}
                campusPrices={campusPrices}
              />
            )}

            {currentStep === 4 && (
              <ConfirmationStep
                formData={formData}
                campuses={campuses}
                plans={plans}
                courses={courses}
                levels={levels}
                cycles={cycles}
                products={products}
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
        </>
      )}

      {/* Modal Integration */}
      <SearchModalWrapper onSelect={startExistingEnrollment} />
    </div>
  );
}

// Separate component for modal state to avoid re-rendering entire page
function SearchModalWrapper({
  onSelect,
}: {
  onSelect: (student: any) => void;
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    (window as any).openStudentSearch = () => setIsSearchOpen(true);
    return () => {
      delete (window as any).openStudentSearch;
    };
  }, []);

  return (
    <StudentSearchModal
      isOpen={isSearchOpen}
      onClose={() => setIsSearchOpen(false)}
      onSelect={(student) => {
        onSelect(student);
        setIsSearchOpen(false);
      }}
    />
  );
}
