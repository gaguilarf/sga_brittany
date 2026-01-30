"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./AlumnosPage.module.css";
import AlumnoDetalle from "./AlumnoDetalle";
import { StudentService } from "@/shared/services/api/studentService";
import { EnrollmentService } from "@/shared/services/api/enrollmentService";
import { CampusService } from "@/shared/services/api/campusService";
import {
  Student,
  EnrollmentResponse,
  Campus,
} from "@/features/matriculas/models/EnrollmentModels";
import { Loader2 } from "lucide-react";

export interface Alumno {
  id: string;
  nombre: string;
  dni: string;
  email: string;
  sede: string;
  estado: "Activo" | "Inactivo" | "Egresado";
  fechaIngreso: string;
  celularAlumno?: string;
  celularApoderado?: string;
  distrito?: string;
  fechaNacimiento?: string;
}

const mapStudentToAlumno = (
  s: Student,
  enrollments: EnrollmentResponse[] = [],
  campuses: Campus[] = [],
): Alumno => {
  const studentEnrollments = enrollments.filter((e) => e.studentId === s.id);

  const studentCampuses = Array.from(
    new Set(
      studentEnrollments
        .map((e) => campuses.find((c) => c.id === e.campusId)?.name)
        .filter(Boolean),
    ),
  );

  const sedeName =
    studentCampuses.length > 0 ? studentCampuses.join(", ") : "Sin sede";

  const latestEnrollment =
    studentEnrollments.length > 0
      ? studentEnrollments[studentEnrollments.length - 1]
      : null;

  // Use enrollment creation date if available, otherwise student creation date
  const registrationDate = latestEnrollment
    ? latestEnrollment.createdAt
    : s.createdAt;

  return {
    id: s.id.toString(),
    nombre: s.nombre,
    dni: s.dni || "",
    email: s.correo || "",
    sede: sedeName,
    estado: s.active ? "Activo" : "Inactivo",
    fechaIngreso: new Date(registrationDate).toLocaleDateString("es-PE"),
    celularAlumno: s.celularAlumno || "",
    celularApoderado: s.celularApoderado || "",
    distrito: s.distrito || "",
    fechaNacimiento: s.fechaNacimiento || "",
  };
};

type SortKey = "nombre" | "sede" | "estado" | "fechaIngreso";

export default function AlumnosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // States
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [allCampuses, setAllCampuses] = useState<Campus[]>([]);
  const [allEnrollments, setAllEnrollments] = useState<EnrollmentResponse[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sedeFilter, setSedeFilter] = useState("Todas");
  const [estadoFilter, setEstadoFilter] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "asc" | "desc";
  } | null>({ key: "nombre", direction: "asc" });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Alumno | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch logic
  useEffect(() => {
    fetchAlumnos();
  }, []);

  const fetchAlumnos = async () => {
    setLoading(true);
    try {
      const [studentsData, enrollmentsData, campusesData] = await Promise.all([
        StudentService.getAll(),
        EnrollmentService.getAll(),
        CampusService.getAll(),
      ]);

      const mapped = studentsData.map((s) =>
        mapStudentToAlumno(s, enrollmentsData, campusesData),
      );
      setAlumnos(mapped);
      setAllCampuses(campusesData);
      setAllEnrollments(enrollmentsData);
      setError(null);

      // Check URL for student detail after initial load
      const detailId = searchParams.get("id");
      if (detailId) {
        const student = mapped.find((a) => a.id === detailId);
        if (student) {
          setSelectedAlumno(student);
          setViewMode("detail");
        }
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Error al cargar los alumnos");
    } finally {
      setLoading(false);
    }
  };

  // View state: list or detail
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null);

  // Filter Logic
  const filteredAlumnos = useMemo(() => {
    return alumnos.filter((alumno) => {
      const matchesSearch =
        alumno.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumno.dni.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumno.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSede = sedeFilter === "Todas" || alumno.sede === sedeFilter;
      const matchesEstado =
        estadoFilter === "Todos" || alumno.estado === estadoFilter;

      return matchesSearch && matchesSede && matchesEstado;
    });
  }, [searchTerm, sedeFilter, estadoFilter, alumnos]);

  // Sort Logic
  const sortedAlumnos = useMemo(() => {
    if (!sortConfig) return filteredAlumnos;

    return [...filteredAlumnos].sort((a, b) => {
      let aValue: string = a[sortConfig.key];
      let bValue: string = b[sortConfig.key];

      // Especial para fechas (formato DD/MM/YYYY)
      if (sortConfig.key === "fechaIngreso") {
        const [dayA, monthA, yearA] = aValue.split("/").map(Number);
        const [dayB, monthB, yearB] = bValue.split("/").map(Number);
        const dateA = new Date(yearA, monthA - 1, dayA).getTime();
        const dateB = new Date(yearB, monthB - 1, dayB).getTime();
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredAlumnos, sortConfig]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedAlumnos.length / pageSize);
  const paginatedAlumnos = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedAlumnos.slice(start, start + pageSize);
  }, [sortedAlumnos, currentPage, pageSize]);

  const handleSort = (key: SortKey) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const startEditing = (alumno: Alumno) => {
    setEditingId(alumno.id);
    setEditForm({ ...alumno });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleSave = async () => {
    if (editForm) {
      setIsSaving(true);
      try {
        const studentId = parseInt(editForm.id);

        // Sanitize inputs
        const updateData = {
          nombre: editForm.nombre.trim(),
          correo: editForm.email.trim() || undefined,
          dni: editForm.dni.trim() || undefined,
          celularAlumno: editForm.celularAlumno?.trim() || undefined,
          celularApoderado: editForm.celularApoderado?.trim() || undefined,
          distrito: editForm.distrito?.trim() || undefined,
          fechaNacimiento: editForm.fechaNacimiento || undefined,
        };

        const updated = await StudentService.update(studentId, updateData);

        setAlumnos((prev) =>
          prev.map((a) =>
            a.id === editForm.id
              ? mapStudentToAlumno(updated, allEnrollments, allCampuses)
              : a,
          ),
        );
        setEditingId(null);
        setEditForm(null);
      } catch (err: any) {
        console.error("Error updating student. Full error:", err);
        const errorMsg =
          err.message ||
          (typeof err === "string"
            ? err
            : JSON.stringify(err, Object.getOwnPropertyNames(err)));
        alert(`Error al guardar los cambios: ${errorMsg}`);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    if (!editForm) return;
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleSeeDetails = (alumno: Alumno) => {
    setSelectedAlumno(alumno);
    setViewMode("detail");
    const params = new URLSearchParams(searchParams.toString());
    params.set("id", alumno.id);
    router.push(`?${params.toString()}`);
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedAlumno(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("id");
    router.push(`?${params.toString()}`);
  };

  // Helper para convertir DD/MM/YYYY a YYYY-MM-DD para el input date
  const formatDateForInput = (dateStr: string) => {
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleUpdateAlumno = (updatedAlumno: Alumno) => {
    setAlumnos((prev) =>
      prev.map((a) => (a.id === updatedAlumno.id ? updatedAlumno : a)),
    );
    setSelectedAlumno(updatedAlumno);
  };

  const renderSortIcon = (key: SortKey) => {
    const isActive = sortConfig?.key === key;
    return (
      <svg
        className={`${styles.sortIcon} ${isActive ? styles.activeSort : ""}`}
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {isActive && sortConfig.direction === "desc" ? (
          <polyline points="7 10 12 5 17 10"></polyline>
        ) : (
          <polyline points="7 14 12 19 17 14"></polyline>
        )}
        {!isActive && (
          <path d="M7 10 12 5 17 10 M7 14 12 19 17 14" opacity="0.3" />
        )}
      </svg>
    );
  };

  if (viewMode === "detail" && selectedAlumno) {
    return (
      <AlumnoDetalle
        alumno={selectedAlumno}
        onBack={handleBackToList}
        onUpdate={handleUpdateAlumno}
      />
    );
  }

  return (
    <div className={styles.alumnosContainer}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Lista de Alumnos</h1>
        <button
          className={styles.btnNewAlumno}
          onClick={() => router.push("/admin/matriculas?mode=new")}
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
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Nuevo Alumno
        </button>
      </header>

      <section className={styles.filterCard}>
        <div className={styles.filtersGrid}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Sede</label>
            <select
              value={sedeFilter}
              onChange={(e) => {
                setSedeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={styles.select}
            >
              <option value="Todas">Todas</option>
              {allCampuses
                .filter((c) => c.active)
                .map((campus) => (
                  <option key={campus.id} value={campus.name}>
                    {campus.name}
                  </option>
                ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Estado del alumno</label>
            <select
              value={estadoFilter}
              onChange={(e) => {
                setEstadoFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={styles.select}
            >
              <option value="Todos">Todos</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Egresado">Egresado</option>
            </select>
          </div>

          <div className={styles.searchGroup}>
            <div className={styles.searchWrapper}>
              <svg
                className={styles.searchIcon}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre, DNI o email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className={styles.searchInput}
              />
            </div>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th
                  onClick={() => handleSort("nombre")}
                  className={styles.sortableHeader}
                >
                  <div className={styles.headerContent}>
                    NOMBRE COMPLETO{renderSortIcon("nombre")}
                  </div>
                </th>
                <th>DNI</th>
                <th
                  onClick={() => handleSort("sede")}
                  className={styles.sortableHeader}
                >
                  <div className={styles.headerContent}>
                    SEDE{renderSortIcon("sede")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("estado")}
                  className={styles.sortableHeader}
                >
                  <div className={styles.headerContent}>
                    ESTADO{renderSortIcon("estado")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("fechaIngreso")}
                  className={styles.sortableHeader}
                >
                  <div className={styles.headerContent}>
                    FECHA DE INGRESO{renderSortIcon("fechaIngreso")}
                  </div>
                </th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className={styles.emptyResults}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Loader2 className={styles.spinner} size={20} />
                      Cargando alumnos...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className={styles.emptyResults}>
                    {error}
                  </td>
                </tr>
              ) : (
                paginatedAlumnos.map((alumno) => {
                  const isEditing = editingId === alumno.id;
                  const displayAlumno = isEditing ? editForm! : alumno;

                  return (
                    <tr
                      key={alumno.id}
                      className={isEditing ? styles.editingRow : ""}
                    >
                      <td className={styles.nameCell}>
                        {isEditing ? (
                          <div className={styles.editInputsStack}>
                            <input
                              type="text"
                              name="nombre"
                              value={displayAlumno.nombre}
                              onChange={handleEditChange}
                              className={styles.inlineInput}
                              placeholder="Nombre Completo"
                            />
                            <input
                              type="email"
                              name="email"
                              value={displayAlumno.email}
                              onChange={handleEditChange}
                              className={styles.inlineInputSmall}
                              placeholder="Correo electrónico"
                            />
                          </div>
                        ) : (
                          <>
                            <div>{alumno.nombre}</div>
                            <div className={styles.emailSub}>
                              {alumno.email}
                            </div>
                          </>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            name="dni"
                            value={displayAlumno.dni}
                            onChange={handleEditChange}
                            className={styles.inlineInput}
                            placeholder="DNI"
                          />
                        ) : (
                          alumno.dni
                        )}
                      </td>
                      <td>{alumno.sede}</td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            styles[alumno.estado.toLowerCase()]
                          }`}
                        >
                          <span className={styles.statusDot}></span>
                          {alumno.estado}
                        </span>
                      </td>
                      <td>{alumno.fechaIngreso}</td>
                      <td>
                        <div className={styles.actions}>
                          {isEditing ? (
                            <>
                              <button
                                className={styles.btnSave}
                                onClick={handleSave}
                                disabled={isSaving}
                              >
                                {isSaving ? (
                                  <Loader2
                                    className={styles.spinner}
                                    size={14}
                                  />
                                ) : (
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                )}
                                {isSaving ? "Guardando..." : "Guardar"}
                              </button>
                              <button
                                className={styles.btnCancel}
                                onClick={handleCancel}
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className={styles.btnEdit}
                                onClick={() => startEditing(alumno)}
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                Editar
                              </button>
                              <button
                                className={styles.btnDetails}
                                onClick={() => handleSeeDetails(alumno)}
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                Detalles
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
              {!loading && !error && paginatedAlumnos.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.emptyResults}>
                    No se encontraron alumnos que coincidan con los filtros
                    aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className={styles.tableFooter}>
          <div className={styles.footerLeft}>
            <div className={styles.recordsInfo}>
              Mostrando{" "}
              {Math.min(
                filteredAlumnos.length,
                (currentPage - 1) * pageSize + 1,
              )}
              –{Math.min(filteredAlumnos.length, currentPage * pageSize)} de{" "}
              {filteredAlumnos.length} alumnos
            </div>
            <div className={styles.pageSizeSelector}>
              <span>Mostrar</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <button
              className={`${styles.pageBtn} ${
                currentPage === 1 ? styles.activePage : ""
              }`}
              onClick={() => goToPage(1)}
            >
              1
            </button>
            {currentPage > 3 && (
              <span className={styles.paginationEllipsis}>...</span>
            )}
            {Array.from({ length: Math.min(3, totalPages - 1) }, (_, i) => {
              const pageNum =
                i + Math.max(2, Math.min(currentPage - 1, totalPages - 3));
              if (pageNum >= totalPages) return null;
              return (
                <button
                  key={pageNum}
                  className={`${styles.pageBtn} ${
                    currentPage === pageNum ? styles.activePage : ""
                  }`}
                  onClick={() => goToPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            {currentPage < totalPages - 2 && (
              <span className={styles.paginationEllipsis}>...</span>
            )}
            {totalPages > 1 && (
              <button
                className={`${styles.pageBtn} ${
                  currentPage === totalPages ? styles.activePage : ""
                }`}
                onClick={() => goToPage(totalPages)}
              >
                {totalPages}
              </button>
            )}
            <button
              className={styles.pageBtn}
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Siguiente
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
