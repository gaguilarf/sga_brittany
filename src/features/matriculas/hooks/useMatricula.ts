import { useState, useEffect } from "react";
import { StudentService } from "@/shared/services/api/studentService";
import { CampusService } from "@/shared/services/api/campusService";
import { PlanService } from "@/shared/services/api/planService";
import { EnrollmentService } from "@/shared/services/api/enrollmentService";
import { PaymentService } from "@/shared/services/api/paymentService";
import { useAuth } from "@/shared/contexts/AuthContext";
import { Student, Campus, Plan } from "../models/EnrollmentModels"; // Adjust path if needed

export const useMatricula = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Static data
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [formData, setFormData] = useState({
    // Step 1: Estudiante
    id: null as number | null,
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

    // Step 4: Pago
    monto: "",
    tipoPago: "",
    metodoPago: "",
    numeroBoleta: "",

    // UI states
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

    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }

    if (name === "fechaNacimiento") {
      const birthDate = new Date(value);
      if (!isNaN(birthDate.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }

        // Clear age error as well since it's auto-calculated
        if (errors.edad) {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.edad;
            return newErrors;
          });
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
      }
    } catch (err) {
      setError("Error al buscar estudiante");
    } finally {
      setLoading(false);
    }
  };

  const validateStep = async (step: number): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.nombre)
        newErrors.nombre = "El nombre completo es obligatorio.";
      if (!formData.dni) newErrors.dni = "El DNI es obligatorio.";
      else if (formData.dni.length < 8) newErrors.dni = "Mínimo 8 caracteres.";

      // Check for duplicate DNI
      if (formData.dni && formData.dni.length >= 8) {
        try {
          const existingStudent = await StudentService.getByDni(formData.dni);
          // If student exists and it's not the currently selected student, show error
          if (existingStudent && existingStudent.id !== formData.id) {
            newErrors.dni = "Este DNI ya está registrado en el sistema.";
          }
        } catch (err) {
          console.error("Error checking DNI:", err);
        }
      }

      // Edad/FechaNacimiento: at least one is required
      if (!formData.fechaNacimiento && !formData.edad) {
        newErrors.fechaNacimiento = "Fecha obligatoria.";
        newErrors.edad = "La edad es obligatoria.";
      }

      if (!formData.distrito)
        newErrors.distrito = "El distrito es obligatorio.";

      // CelularAlumno/CelularApoderado: at least one is required
      if (!formData.celularAlumno && !formData.celularApoderado) {
        newErrors.celularApoderado = "Celular apoderado obligatorio.";
      }

      if (!formData.email) newErrors.email = "El correo es obligatorio.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = "Formato de correo inválido.";
    }

    if (step === 2) {
      if (!formData.campusId) newErrors.campusId = "Debe seleccionar una sede.";
      if (!formData.planId) newErrors.planId = "Debe seleccionar un plan.";
      if (!formData.modalidad)
        newErrors.modalidad = "La modalidad es obligatoria.";
      if (!formData.nivel) newErrors.nivel = "El nivel es obligatorio.";
      if (!formData.tipoInscripcion)
        newErrors.tipoInscripcion = "Tipo de inscripción obligatorio.";
      if (!formData.diaClase)
        newErrors.diaClase = "Días de clase obligatorios.";
      if (!formData.horaInicio)
        newErrors.horaInicio = "Hora inicio obligatoria.";
      if (!formData.horaFin) newErrors.horaFin = "Hora fin obligatoria.";
    }

    if (step === 3) {
      if (!formData.monto) newErrors.monto = "El monto es obligatorio.";
      if (!formData.tipoPago) newErrors.tipoPago = "Seleccione tipo de pago.";
      if (!formData.metodoPago) newErrors.metodoPago = "Seleccione método.";
      if (!formData.numeroBoleta)
        newErrors.numeroBoleta = "Nro. de boleta obligatorio.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setError("Por favor, completa los campos obligatorios indicados.");
      return false;
    }

    setError(null);
    return true;
  };

  const nextStep = async () => {
    if (await validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleFinalAction = async () => {
    setLoading(true);
    setError(null);
    try {
      let studentId = formData.id;

      // 1. Check if student exists (Idempotency)
      if (!studentId) {
        // Try to find by DNI first to avoid "Already exists" error on retry
        const existingStudent = await StudentService.getByDni(
          formData.dni
        ).catch(() => null);

        if (existingStudent) {
          studentId = existingStudent.id;
        } else {
          // Create new student if not found
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
      }

      // 2. Create Enrollment
      const enrollment = await EnrollmentService.create({
        studentId: studentId!,
        campusId: parseInt(formData.campusId) || 0,
        planId: parseInt(formData.planId) || 0,
        modalidad: formData.modalidad,
        horario:
          `${formData.diaClase} ${formData.horaInicio}-${formData.horaFin}`.trim() ||
          formData.horario,
        nivel: formData.nivel,
        tipoInscripcion: formData.tipoInscripcion,
        advisorId: user?.id || 0,
        numeroBoleta: formData.numeroBoleta,
        saldo: 0,
      });

      // 3. Create Payment
      const now = new Date();
      // Remove milliseconds by splitting at period and appending Z
      const isoDate = now.toISOString().split(".")[0] + "Z";

      const paymentPayload = {
        enrollmentId: enrollment.id,
        monto: Number(formData.monto),
        tipo: formData.tipoPago,
        metodo: formData.metodoPago,
        numeroBoleta: formData.numeroBoleta,
        fechaPago: isoDate,
        campusId: enrollment.campusId,
      };

      console.log("Sending Payment Payload:", paymentPayload);

      await PaymentService.create(paymentPayload);

      setSuccess("¡Matrícula y Pago registrados con éxito!");

      // Redirect after delay
      setTimeout(() => {
        window.location.href = "/admin/dashboard";
      }, 1000); // 3 seconds delay for user to read the message
    } catch (err: any) {
      console.error(err);
      let message =
        err.response?.data?.message ||
        err.message ||
        "Error al registrar la matrícula o el pago";

      if (Array.isArray(message)) {
        message = message.join(", ");
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    currentStep,
    loading,
    error,
    success,
    setSuccess,
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
  };
};
