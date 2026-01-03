"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import styles from "./AlumnosPage.module.css";

interface Alumno {
  id: string;
  nombre: string;
  dni: string;
  email: string;
  sede: string;
  estado: "Activo" | "Inactivo" | "Egresado";
  fechaIngreso: string;
}

// Generador de 150 alumnos mock
const generateMockAlumnos = (): Alumno[] => {
  const nombres = [
    "Ana",
    "Carlos",
    "Laura",
    "Marcos",
    "Sofia",
    "Daniel",
    "Elena",
    "Javier",
    "Lucia",
    "Ricardo",
  ];
  const apellidos = [
    "García Lopez",
    "Ruiz Gomez",
    "Martín Díaz",
    "Soler Peña",
    "Navarro Gil",
    "Vega Sanz",
    "Torres Castro",
    "Méndez Ruiz",
    "Pérez Sosa",
    "Luna Victoria",
  ];
  const sedes = ["Sede Central", "Sede Norte", "Sede Sur"];
  const estados: Alumno["estado"][] = ["Activo", "Inactivo", "Egresado"];

  return Array.from({ length: 150 }, (_, i) => {
    const nombre = nombres[i % nombres.length];
    const apellido = apellidos[i % apellidos.length];
    const fullNombre = `${nombre} ${apellido} ${i > 10 ? i : ""}`;
    return {
      id: (i + 1).toString(),
      nombre: fullNombre,
      dni: `${Math.floor(
        10000000 + Math.random() * 90000000
      )}${String.fromCharCode(65 + (i % 26))}`,
      email: `${nombre.toLowerCase()}.${apellido
        .split(" ")[0]
        .toLowerCase()}${i}@brittany.edu.pe`,
      sede: sedes[i % sedes.length],
      estado: estados[i % estados.length],
      fechaIngreso: `${((i % 28) + 1).toString().padStart(2, "0")}/${(
        (i % 12) +
        1
      )
        .toString()
        .padStart(2, "0")}/202${i % 4}`,
    };
  });
};

const ALL_ALUMNOS = generateMockAlumnos();

type SortKey = "nombre" | "sede" | "estado" | "fechaIngreso";

export default function AlumnosPage() {
  const router = useRouter();

  // States
  const [alumnos, setAlumnos] = useState<Alumno[]>(ALL_ALUMNOS);
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

  const handleSave = () => {
    if (editForm) {
      setAlumnos((prev) =>
        prev.map((a) => (a.id === editForm.id ? editForm : a))
      );
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (editForm) {
      if (name === "fechaIngreso") {
        // Convertir YYYY-MM-DD a DD/MM/YYYY
        const [year, month, day] = value.split("-");
        setEditForm({ ...editForm, [name]: `${day}/${month}/${year}` });
      } else {
        setEditForm({ ...editForm, [name]: value });
      }
    }
  };

  // Helper para convertir DD/MM/YYYY a YYYY-MM-DD para el input date
  const formatDateForInput = (dateStr: string) => {
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
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

  return (
    <div className={styles.alumnosContainer}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Lista de Alumnos</h1>
        <button
          className={styles.btnNewAlumno}
          onClick={() => router.push("/admin/matriculas")}
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
              <option value="Sede Central">Sede Central</option>
              <option value="Sede Norte">Sede Norte</option>
              <option value="Sede Sur">Sede Sur</option>
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
                  NOMBRE COMPLETO {renderSortIcon("nombre")}
                </th>
                <th>DNI</th>
                <th
                  onClick={() => handleSort("sede")}
                  className={styles.sortableHeader}
                >
                  SEDE {renderSortIcon("sede")}
                </th>
                <th
                  onClick={() => handleSort("estado")}
                  className={styles.sortableHeader}
                >
                  ESTADO {renderSortIcon("estado")}
                </th>
                <th
                  onClick={() => handleSort("fechaIngreso")}
                  className={styles.sortableHeader}
                >
                  FECHA DE INGRESO {renderSortIcon("fechaIngreso")}
                </th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAlumnos.map((alumno) => {
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
                          <div className={styles.emailSub}>{alumno.email}</div>
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
                    <td>
                      {isEditing ? (
                        <select
                          name="sede"
                          value={displayAlumno.sede}
                          onChange={handleEditChange}
                          className={styles.inlineSelect}
                        >
                          <option value="Sede Central">Sede Central</option>
                          <option value="Sede Norte">Sede Norte</option>
                          <option value="Sede Sur">Sede Sur</option>
                        </select>
                      ) : (
                        alumno.sede
                      )}
                    </td>
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
                    <td>
                      {isEditing ? (
                        <input
                          type="date"
                          name="fechaIngreso"
                          value={formatDateForInput(displayAlumno.fechaIngreso)}
                          onChange={handleEditChange}
                          className={styles.inlineInput}
                        />
                      ) : (
                        alumno.fechaIngreso
                      )}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        {isEditing ? (
                          <>
                            <button
                              className={styles.btnSave}
                              onClick={handleSave}
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
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              Guardar
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
                            <button className={styles.btnDetails}>
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
              })}
              {paginatedAlumnos.length === 0 && (
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
                (currentPage - 1) * pageSize + 1
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
