import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { StudentService } from "@/shared/services/api/studentService";
import { CampusService } from "@/shared/services/api/campusService";
import { PlanService } from "@/shared/services/api/planService";
import { EnrollmentService } from "@/shared/services/api/enrollmentService";
import { PaymentService } from "@/shared/services/api/paymentService";
import { AcademicService } from "@/shared/services/api/academicService";
import { ProductService } from "@/shared/services/api/productService";
import { useAuth } from "@/shared/contexts/AuthContext";
import {
  Student,
  Campus,
  Plan,
  Course,
  Level,
  Cycle,
  Product,
} from "../models/EnrollmentModels"; // Adjust path if needed
import {
  PREDEFINED_SCHEDULES,
  PredefinedSchedule,
} from "../constants/Schedules";
import { PAYMENT_TYPES } from "../constants/PaymentTypes";

export const useMatricula = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [enrollmentFlow, setEnrollmentFlow] = useState<
    "selection" | "new" | "existing"
  >("new");
  const [isExistingStudent, setIsExistingStudent] = useState(false);

  // Static data
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [campusPrices, setCampusPrices] = useState<any[]>([]);

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
    courseId: "",
    initialLevelId: "",
    initialCycleId: "",
    modalidad: "Virtual",
    horario: "",
    tipoInscripcion: "",

    // Enrollment Type (Plan vs Product)
    enrollmentType: "" as "PLAN" | "PRODUCT" | "",
    productId: "",
    examDate: "",

    // Step 4: Pago (múltiples pagos)
    payments: [
      { tipo: "", metodo: "", monto: "", mesesAdelantados: [] },
    ] as Array<{
      tipo: string;
      metodo: string;
      monto: string;
      mesesAdelantados?: Array<{ mes: string; monto: number }>;
    }>,
    numeroBoleta: "",

    // UI states
    diaClase: "",
    horaInicio: "",
    horaFin: "",
    scheduleOption: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activeCampuses, activePlans, activeCourses, activeProducts] =
          await Promise.all([
            CampusService.getActive(),
            PlanService.getActive(),
            AcademicService.getCourses(),
            ProductService.getActive(),
          ]);
        setCampuses(activeCampuses);
        setPlans(activePlans);
        setCourses(activeCourses);
        setProducts(activeProducts);
      } catch (err) {
        console.error("Error fetching static data:", err);
      }
    };
    fetchData();
  }, []);

  // Handle URL params for redirection from Payments module
  useEffect(() => {
    const studentIdParam = searchParams.get("studentId");
    const typeParam = searchParams.get("type");

    if (studentIdParam) {
      const fetchStudent = async () => {
        try {
          const student = await StudentService.getById(Number(studentIdParam));
          if (student) {
            setSelectedStudent(student);
            setFormData((prev) => ({
              ...prev,
              id: student.id,
              nombre: student.nombre,
              dni: student.dni || "",
              fechaNacimiento: student.fechaNacimiento || "",
              edad: student.edad?.toString() || "",
              distrito: student.distrito || "",
              celularAlumno: student.celularAlumno || "",
              celularApoderado: student.celularApoderado || "",
              email: student.correo || "",
              enrollmentType:
                typeParam === "PRODUCT" ? "PRODUCT" : prev.enrollmentType || "",
            }));

            setIsExistingStudent(true);

            // If it's a product enrollment redirection, jump to step 2
            if (typeParam === "PRODUCT") {
              setCurrentStep(2);
              setEnrollmentFlow("existing");
            }
          }
        } catch (err) {
          console.error("Error fetching student from params:", err);
        }
      };
      fetchStudent();
    }
  }, [searchParams]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    // Trigger price fetch when campus changes
    if (name === "campusId" && value) {
      PlanService.getPricesByCampus(parseInt(value)).then((res) => {
        setCampusPrices(res);
      });
    }

    // Auto-fill payments when plan changes
    if (name === "planId" && value) {
      const planId = parseInt(value);
      const config = campusPrices.find((cp) => cp.planId === planId);

      if (config) {
        const suggestedPayments: Array<{
          tipo: string;
          metodo: string;
          monto: string;
        }> = [];

        if (!isExistingStudent) {
          suggestedPayments.push({
            tipo: "Inscripción",
            metodo: "",
            monto: config.precioInscripcion.toString(),
          });
          suggestedPayments.push({
            tipo: "Materiales",
            metodo: "",
            monto: config.precioMateriales.toString(),
          });
        }

        suggestedPayments.push({
          tipo: "Mensualidad",
          metodo: "",
          monto: config.precioMensualidad.toString(),
        });

        setFormData((prev) => ({
          ...prev,
          planId: value,
          payments: suggestedPayments,
        }));
      }
    }

    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }

    if (name === "courseId") {
      setFormData((prev) => ({
        ...prev,
        courseId: value,
        initialLevelId: "",
        initialCycleId: "",
      }));
      if (value) {
        AcademicService.getLevelsByCourse(parseInt(value)).then((res) =>
          setLevels(res),
        );
      } else {
        setLevels([]);
      }
      setCycles([]);
      return;
    }

    if (name === "initialLevelId") {
      setFormData((prev) => ({
        ...prev,
        initialLevelId: value,
        initialCycleId: "",
      }));
      if (value) {
        AcademicService.getCyclesByLevel(parseInt(value)).then((res) =>
          setCycles(res),
        );
      } else {
        setCycles([]);
      }
      return;
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

    if (name === "scheduleOption") {
      const selectedOption = value;
      if (selectedOption === "Otro") {
        setFormData((prev) => ({
          ...prev,
          scheduleOption: "Otro",
          diaClase: "",
          horaInicio: "",
          horaFin: "",
        }));
      } else if (selectedOption) {
        const predefined = PREDEFINED_SCHEDULES.find(
          (s: PredefinedSchedule) => s.label === selectedOption,
        );
        if (predefined) {
          setFormData((prev) => ({
            ...prev,
            scheduleOption: selectedOption,
            diaClase: predefined.diaClase,
            horaInicio: predefined.horaInicio,
            horaFin: predefined.horaFin,
          }));
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          scheduleOption: "",
          diaClase: "",
          horaInicio: "",
          horaFin: "",
        }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEnrollmentTypeChange = (type: "PLAN" | "PRODUCT") => {
    if (type === "PLAN") {
      // Limpiar campos de producto
      setFormData((prev) => ({
        ...prev,
        enrollmentType: "PLAN",
        productId: "",
        examDate: "",
      }));
    } else {
      // Limpiar campos de plan y resetear campos comunes si es necesario
      setFormData((prev) => ({
        ...prev,
        enrollmentType: "PRODUCT",
        planId: "",
        courseId: "",
        initialLevelId: "",
        initialCycleId: "",
        // Limpiar horario al cambiar a producto por si acaso el producto requiere fecha de examen
        scheduleOption: "",
        diaClase: "",
        horaInicio: "",
        horaFin: "",
      }));
    }
    // Limpiar errores al cambiar de tipo
    setErrors({});
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

  const startNewEnrollment = () => {
    setEnrollmentFlow("new");
    setIsExistingStudent(false);
    setCurrentStep(1);
  };

  const startExistingEnrollment = (student: Student) => {
    setSelectedStudent(student);
    setFormData((prev) => ({
      ...prev,
      id: student.id,
      nombre: student.nombre,
      dni: student.dni || "",
      fechaNacimiento: student.fechaNacimiento || "",
      edad: student.edad?.toString() || "",
      distrito: student.distrito || "",
      celularAlumno: student.celularAlumno || "",
      celularApoderado: student.celularApoderado || "",
      email: student.correo || "",
    }));
    setEnrollmentFlow("existing");
    setIsExistingStudent(true);
    setCurrentStep(2); // Jump to step 2 as requested
  };

  const resetFlow = () => {
    setEnrollmentFlow("new");
    setIsExistingStudent(false);
    setCurrentStep(1);
    setSelectedStudent(null);
    // Optionally reset formData here if needed, but the user didn't explicitly ask for it
    // Most likely we want a fresh start
    setFormData({
      id: null,
      nombre: "",
      dni: "",
      fechaNacimiento: "",
      edad: "",
      distrito: "",
      celularAlumno: "",
      celularApoderado: "",
      email: "",
      campusId: "",
      planId: "",
      courseId: "",
      initialLevelId: "",
      initialCycleId: "",
      modalidad: "Virtual",
      horario: "",
      tipoInscripcion: "",
      enrollmentType: "" as "PLAN" | "PRODUCT" | "",
      productId: "",
      examDate: "",
      payments: [{ tipo: "", metodo: "", monto: "", mesesAdelantados: [] }],
      numeroBoleta: "",
      diaClase: "",
      horaInicio: "",
      horaFin: "",
      scheduleOption: "",
    });
    setErrors({});
  };

  // Payment management functions
  const addPayment = () => {
    setFormData((prev) => ({
      ...prev,
      payments: [
        ...prev.payments,
        { tipo: "", metodo: "", monto: "", mesesAdelantados: [] },
      ],
    }));
  };

  const removePayment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      payments: prev.payments.filter((_, i) => i !== index),
    }));
  };
  const handlePaymentChange = (index: number, field: string, value: string) => {
    // if tipo changes, find and set the price automatically
    setFormData((prev) => {
      const updatedPayments = [...prev.payments];
      let updatedMonto = updatedPayments[index].monto;
      let updatedTipo = value;

      // if tipo changes to something else than Mensualidad Adelantada, clear months
      if (field === "tipo") {
        if (value !== "Mensualidad Adelantada") {
          updatedPayments[index].mesesAdelantados = [];
        }

        // Mutual Exclusivity: Mensualidad vs Mensualidad Adelantada
        if (value === "Mensualidad Adelantada") {
          // Check if any other payment is "Mensualidad" and clear it
          updatedPayments.forEach((p, i) => {
            if (i !== index && p.tipo === "Mensualidad") {
              p.tipo = "";
              p.monto = "";
            }
          });
        } else if (value === "Mensualidad") {
          // Check if any other payment is "Mensualidad Adelantada" and clear it
          updatedPayments.forEach((p, i) => {
            if (i !== index && p.tipo === "Mensualidad Adelantada") {
              p.tipo = "";
              p.monto = "";
              p.mesesAdelantados = [];
            }
          });
        }
      }

      // if tipo changes, find and set the price automatically
      if (field === "tipo" && updatedTipo && prev.planId) {
        const planId = parseInt(prev.planId);
        const config = campusPrices.find((cp) => cp.planId === planId);

        if (config) {
          if (updatedTipo === "Inscripción") {
            updatedMonto = config.precioInscripcion.toString();
          } else if (updatedTipo === "Materiales") {
            updatedMonto = config.precioMateriales.toString();
          } else if (updatedTipo === "Mensualidad") {
            updatedMonto = config.precioMensualidad.toString();
          }
        }
      }

      // If editing monto directly, use the new value
      if (field === "monto") {
        updatedMonto = value;
      }

      updatedPayments[index] = {
        ...updatedPayments[index],
        [field]: value,
        ...(field === "tipo" || field === "monto"
          ? { monto: updatedMonto }
          : {}),
      };
      return { ...prev, payments: updatedPayments };
    });

    // Clear error for this specific payment field
    const errorKey = `payment_${index}_${field}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const addPrepaymentMonth = (paymentIndex: number) => {
    setFormData((prev) => {
      const updatedPayments = [...prev.payments];
      const payment = { ...updatedPayments[paymentIndex] };
      const months = [...(payment.mesesAdelantados || [])];

      let nextMonthStr = "";
      const now = new Date();

      if (months.length === 0) {
        // Start with current month
        nextMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      } else {
        // Get the last month in the list and increment it
        const lastMonth = months[months.length - 1].mes;
        const [year, month] = lastMonth.split("-").map(Number);
        const date = new Date(year, month - 1, 1);
        date.setMonth(date.getMonth() + 1);
        nextMonthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      }

      // Find suggested price
      const planId = parseInt(prev.planId);
      const config = campusPrices.find((cp) => cp.planId === planId);
      const suggestedPrice = config?.precioMensualidad || 0;

      months.push({ mes: nextMonthStr, monto: suggestedPrice });

      payment.mesesAdelantados = months;
      payment.monto = months
        .reduce((sum, m) => sum + Number(m.monto), 0)
        .toFixed(2)
        .toString();

      updatedPayments[paymentIndex] = payment;
      return { ...prev, payments: updatedPayments };
    });
  };

  const removePrepaymentMonth = (paymentIndex: number, monthIndex: number) => {
    setFormData((prev) => {
      const updatedPayments = [...prev.payments];
      const payment = { ...updatedPayments[paymentIndex] };
      let months = [...(payment.mesesAdelantados || [])];

      months = months.filter((_, i) => i !== monthIndex);

      payment.mesesAdelantados = months;
      payment.monto = months
        .reduce((sum, m) => sum + Number(m.monto), 0)
        .toFixed(2)
        .toString();

      updatedPayments[paymentIndex] = payment;
      return { ...prev, payments: updatedPayments };
    });
  };

  const updatePrepaymentMonth = (
    paymentIndex: number,
    monthIndex: number,
    field: string,
    value: any,
  ) => {
    setFormData((prev) => {
      const updatedPayments = [...prev.payments];
      const payment = { ...updatedPayments[paymentIndex] };
      const months = [...(payment.mesesAdelantados || [])];

      months[monthIndex] = {
        ...months[monthIndex],
        [field]: value,
      };

      payment.mesesAdelantados = months;
      payment.monto = months
        .reduce((sum, m) => sum + Number(m.monto), 0)
        .toFixed(2)
        .toString();

      updatedPayments[paymentIndex] = payment;
      return { ...prev, payments: updatedPayments };
    });
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
        newErrors.celularAlumno =
          "Debe ingresar al menos un número de contacto.";
        newErrors.celularApoderado =
          "Debe ingresar al menos un número de contacto.";
      }

      if (!formData.email) newErrors.email = "El correo es obligatorio.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = "Formato de correo inválido.";
    }

    if (step === 2) {
      if (!formData.campusId) newErrors.campusId = "Debe seleccionar una sede.";

      if (formData.enrollmentType === "PLAN") {
        // Validaciones para matrícula por Plan
        if (!formData.planId) newErrors.planId = "Debe seleccionar un plan.";
        if (!formData.courseId)
          newErrors.courseId = "Debe seleccionar un curso.";
        if (!formData.initialLevelId)
          newErrors.initialLevelId = "Debe seleccionar un nivel.";
        if (!formData.initialCycleId)
          newErrors.initialCycleId = "Debe seleccionar un ciclo.";
        if (!formData.tipoInscripcion)
          newErrors.tipoInscripcion = "Tipo de inscripción obligatorio.";
        if (!formData.scheduleOption)
          newErrors.scheduleOption = "Debe seleccionar un horario.";

        if (formData.scheduleOption === "Otro") {
          if (!formData.diaClase)
            newErrors.diaClase = "Días de clase obligatorios.";
          if (!formData.horaInicio)
            newErrors.horaInicio = "Hora inicio obligatoria.";
          if (!formData.horaFin) newErrors.horaFin = "Hora fin obligatoria.";
        }
      } else if (formData.enrollmentType === "PRODUCT") {
        // Validaciones para matrícula por Producto
        if (!formData.productId)
          newErrors.productId = "Debe seleccionar un producto.";
        if (!formData.tipoInscripcion)
          newErrors.tipoInscripcion = "Tipo de inscripción obligatorio.";

        // Validar horario o fecha de examen según el producto
        const selectedProduct = products.find(
          (p) => p.id.toString() === formData.productId,
        );
        if (selectedProduct) {
          if (selectedProduct.requiresExamDate) {
            if (!formData.examDate)
              newErrors.examDate = "Fecha de examen obligatoria.";
          } else if (selectedProduct.requiresSchedule) {
            if (!formData.scheduleOption)
              newErrors.scheduleOption = "Debe seleccionar un horario.";

            if (formData.scheduleOption === "Otro") {
              if (!formData.diaClase)
                newErrors.diaClase = "Días de clase obligatorios.";
              if (!formData.horaInicio)
                newErrors.horaInicio = "Hora inicio obligatoria.";
              if (!formData.horaFin)
                newErrors.horaFin = "Hora fin obligatoria.";
            }
          }
        }
      }
    }

    if (step === 3) {
      // Validar número de boleta (compartido)
      if (!formData.numeroBoleta)
        newErrors.numeroBoleta = "Nro. de boleta obligatorio.";

      // Validar que haya al menos un pago
      if (!formData.payments || formData.payments.length === 0) {
        newErrors.payments = "Debe agregar al menos un pago.";
      } else {
        // Validar cada pago
        const paymentTypes = new Set<string>();

        formData.payments.forEach((payment, index) => {
          if (!payment.tipo) {
            newErrors[`payment_${index}_tipo`] = "Tipo obligatorio.";
          } else {
            // Validar tipos únicos
            if (paymentTypes.has(payment.tipo)) {
              newErrors[`payment_${index}_tipo`] = "Tipo de pago duplicado.";
            }
            paymentTypes.add(payment.tipo);
          }

          if (!payment.metodo) {
            newErrors[`payment_${index}_metodo`] = "Método obligatorio.";
          }

          if (!payment.monto || Number(payment.monto) <= 0) {
            newErrors[`payment_${index}_monto`] = "Monto inválido.";
          }
        });

        // Validar que haya al menos un pago de Inscripción para alumnos nuevos
        if (!isExistingStudent) {
          const hasInscripcion = formData.payments.some(
            (payment: any) => payment.tipo === "Inscripción",
          );
          if (!hasInscripcion) {
            newErrors.payments =
              "Debe incluir al menos un pago de Inscripción para alumnos nuevos.";
          }
        }
      }
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
      if (!isExistingStudent && !studentId) {
        // Try to find by DNI first to avoid "Already exists" error on retry
        const existingStudent = await StudentService.getByDni(
          formData.dni,
        ).catch(() => null);

        if (existingStudent) {
          studentId = existingStudent.id;
        } else {
          // Create new student if not found
          const newStudent = await StudentService.create({
            nombre: formData.nombre.trim(),
            dni: formData.dni || undefined,
            fechaNacimiento: formData.fechaNacimiento || undefined,
            edad: formData.edad ? parseInt(formData.edad) : undefined,
            distrito: formData.distrito || undefined,
            celularAlumno: formData.celularAlumno || undefined,
            celularApoderado: formData.celularApoderado || undefined,
            correo: formData.email || undefined,
          });
          studentId = newStudent.id;
        }
      }

      // 2. Create Enrollment
      const enrollmentPayload: any = {
        studentId: studentId!,
        campusId: parseInt(formData.campusId) || undefined,
        modalidad: formData.modalidad || undefined,
        tipoInscripcion: formData.tipoInscripcion || undefined,
        advisorId: user?.id || undefined,
        numeroBoleta: formData.numeroBoleta || undefined,
        saldo: 0,
      };

      if (formData.enrollmentType) {
        enrollmentPayload.enrollmentType = formData.enrollmentType;
      }

      if (formData.enrollmentType === "PLAN") {
        enrollmentPayload.planId = parseInt(formData.planId) || undefined;
        enrollmentPayload.courseId = parseInt(formData.courseId) || undefined;
        enrollmentPayload.initialLevelId =
          parseInt(formData.initialLevelId) || undefined;
        enrollmentPayload.initialCycleId =
          parseInt(formData.initialCycleId) || undefined;
        enrollmentPayload.horario =
          `${formData.diaClase} ${formData.horaInicio}-${formData.horaFin}`.trim() ||
          formData.horario ||
          undefined;
      } else {
        enrollmentPayload.productId = parseInt(formData.productId) || undefined;
        const selectedProduct = products.find(
          (p) => p.id.toString() === formData.productId,
        );
        if (selectedProduct?.requiresExamDate) {
          enrollmentPayload.examDate = formData.examDate || undefined;
        } else {
          enrollmentPayload.horario =
            `${formData.diaClase} ${formData.horaInicio}-${formData.horaFin}`.trim() ||
            formData.horario ||
            undefined;
        }
      }

      console.log("Sending Enrollment Payload:", enrollmentPayload);
      const enrollment = await EnrollmentService.create(enrollmentPayload);

      // 3. Create Payments
      const now = new Date();
      const isoDate = now.toISOString().split(".")[0] + "Z";

      // Create a promise for each payment
      const paymentPromises = formData.payments.map((payment) => {
        const isPrepayment = payment.tipo === "Mensualidad Adelantada";
        const paymentPayload: any = {
          enrollmentId: enrollment.id,
          monto: Number(payment.monto),
          tipo: payment.tipo,
          metodo: payment.metodo,
          numeroBoleta: formData.numeroBoleta,
          fechaPago: isoDate,
          campusId: enrollment.campusId,
        };

        if (isPrepayment && payment.mesesAdelantados) {
          paymentPayload.esAdelantado = true;
          // Ensure each month's monto is a number
          paymentPayload.mesesAdelantados = payment.mesesAdelantados.map(
            (m: any) => ({
              mes: m.mes,
              monto: Number(m.monto),
            }),
          );
        }

        console.log("Sending Payment Payload:", paymentPayload);
        return PaymentService.create(paymentPayload);
      });

      // Wait for all payments to be created
      await Promise.all(paymentPromises);

      setSuccess("¡Matrícula y Pagos registrados con éxito!");

      // Redirect after delay
      setTimeout(() => {
        window.location.href = "/admin/dashboard";
      }, 1000);
    } catch (err: any) {
      console.error("Error completo:", err);
      if (err.response) {
        console.error("Data de respuesta de error:", err.response.data);
      }
      let message =
        err.response?.data?.message ||
        err.message ||
        "Error al registrar la matrícula o los pagos";

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
    campusPrices,
  };
};
