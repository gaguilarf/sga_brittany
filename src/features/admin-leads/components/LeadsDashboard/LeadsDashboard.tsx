"use client";

import { useEffect, useState } from "react";
<<<<<<< HEAD
import { Header, Footer } from "@/shared";
=======
import {
  List,
  PlusCircle,
  FileDown,
  Search,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
>>>>>>> birttany_front/main
import { getLeads, Lead, patchLead } from "../../services/leadService";
import styles from "./LeadsDashboard.module.css";
import * as XLSX from "xlsx";
import EditLeadModal from "../../components/EditLeadModal/EditLeadModal";
<<<<<<< HEAD
=======
import LeadForm from "./LeadForm";
import { SEDES, PRODUCTOS } from "@/features/landing/models/Lead";
>>>>>>> birttany_front/main

export default function LeadsDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
=======
  const [viewMode, setViewMode] = useState<"form" | "table">("form");
>>>>>>> birttany_front/main

  // --- ESTADOS PARA LA EDICIÓN Y NOTIFICACIÓN ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

<<<<<<< HEAD
  useEffect(() => {
    getLeads().then((data) => {
      setLeads(data);
      setLoading(false);
    });
=======
  // --- ESTADOS PARA FILTROS Y ORDENAMIENTO ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSede, setFilterSede] = useState("");
  const [filterProducto, setFilterProducto] = useState("");
  const [filterAsesor, setFilterAsesor] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Lead | "fechaRegistro";
    direction: "asc" | "desc";
  }>({ key: "fechaRegistro", direction: "desc" });

  // --- LÓGICA DE FILTRADO Y ORDENAMIENTO ---
  const filteredAndSortedLeads = leads
    .filter((lead) => {
      const matchesSearch = lead.nombreCompleto
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesSede = filterSede === "" || lead.sede === filterSede;
      const matchesProducto =
        filterProducto === "" || lead.producto === filterProducto;
      const matchesAsesor =
        filterAsesor === "" ||
        lead.asesor.toLowerCase().includes(filterAsesor.toLowerCase());
      return matchesSearch && matchesSede && matchesProducto && matchesAsesor;
    })
    .sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === undefined || bValue === undefined) return 0;

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

  const requestSort = (key: keyof Lead | "fechaRegistro") => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Lead | "fechaRegistro") => {
    if (sortConfig.key !== key)
      return <ChevronDown size={14} style={{ opacity: 0.5 }} />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp size={14} />
    ) : (
      <ChevronDown size={14} />
    );
  };

  useEffect(() => {
    // Polling function for real-time updates
    const fetchLeads = () => {
      getLeads().then((data) => {
        setLeads(data);
        setLoading(false);
      });
    };

    fetchLeads(); // Initial fetch

    const intervalId = setInterval(fetchLeads, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
>>>>>>> birttany_front/main
  }, []);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      fecha: date.toLocaleDateString("es-PE"),
      hora: date.toLocaleTimeString("es-PE", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  // --- MANEJADORES DE EDICIÓN ---
  const handleEditClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleSaveLead = async (updatedLead: Lead) => {
    try {
      // Limpiamos el objeto: quitamos ID y fechaRegistro del body del PATCH
      const { id, fechaRegistro, ...rest } = updatedLead;
      const payload = { ...rest, edad: Number(rest.edad) };

      const savedLead = await patchLead(id, payload);

      // Actualizamos estado local
      setLeads((prev) => prev.map((l) => (l.id === id ? savedLead : l)));

      // Notificación de éxito
      setNotification({
        message: "¡Lead actualizado con éxito!",
        type: "success",
      });

      // Cerramos modal tras un breve delay
      setTimeout(() => {
        setIsModalOpen(false);
        setSelectedLead(null);
        setNotification(null);
      }, 1000);
    } catch (error: any) {
      setNotification({ message: error.message, type: "error" });
      setTimeout(() => setNotification(null), 2000);
    }
  };

  const handleExportExcel = () => {
    const dataToExport = leads.map((lead) => {
      const { fecha, hora } = formatDateTime(lead.fechaRegistro);
      return {
        "Nombre Completo": lead.nombreCompleto,
        Edad: lead.edad,
        Teléfono: lead.telefono,
        Sede: lead.sede,
        Modalidad: lead.modalidad,
        Producto: lead.producto,
        "Medio de Contacto": lead.medioContacto,
<<<<<<< HEAD
=======
        Asesor: lead.asesor,
>>>>>>> birttany_front/main
        "Fecha de Registro": fecha,
        Hora: hora,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");

    const maxWidths = Object.keys(dataToExport[0] || {}).map((key) => ({
      wch: key.length + 15,
    }));
    worksheet["!cols"] = maxWidths;

    XLSX.writeFile(workbook, `Leads_Brittany_${new Date().getTime()}.xlsx`);
  };

  return (
    <>
<<<<<<< HEAD
      <Header />
=======
>>>>>>> birttany_front/main
      <main className={styles.mainContainer}>
        <div className={styles.topBar}>
          <h1 className={styles.title}>ADMINISTRACIÓN DE LEADS</h1>
          <div className={styles.buttonGroup}>
<<<<<<< HEAD
            <button
              className={`btn btn-small btn-primary ${styles.export}`}
              onClick={handleExportExcel}
              disabled={leads.length === 0}
            >
              EXPORTAR EXCEL
            </button>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Sede</th>
                <th>Producto</th>
                <th>Fecha/Hora</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className={styles.loadingText}>
                    Cargando leads...
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const { fecha, hora } = formatDateTime(lead.fechaRegistro);
                  return (
                    <tr key={lead.id}>
                      <td>{lead.nombreCompleto}</td>
                      <td>{lead.telefono}</td>
                      <td>{lead.sede}</td>
                      <td>{lead.producto}</td>
                      <td>
                        {fecha} - {hora}
                      </td>
                      <td className={styles.actions}>
                        <button
                          className={styles.editBtn}
                          onClick={() => handleEditClick(lead)}
                        >
                          Editar
                        </button>
                        {/*  <button className={styles.deleteBtn}>Eliminar</button> */}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
=======
            {viewMode === "table" ? (
              <>
                <button
                  className={styles.viewToggleBtn}
                  onClick={() => setViewMode("form")}
                >
                  <PlusCircle size={18} />
                  Registrar Lead
                </button>
                <button
                  className={`${styles.exportBtn}`}
                  onClick={handleExportExcel}
                  disabled={leads.length === 0}
                >
                  <FileDown size={18} />
                  EXPORTAR EXCEL
                </button>
              </>
            ) : (
              <button
                className={styles.viewToggleBtn}
                onClick={() => setViewMode("table")}
              >
                <List size={18} />
                Ver Leads Registrados
              </button>
            )}
          </div>
        </div>

        {viewMode === "form" ? (
          <LeadForm />
        ) : (
          <div className={styles.tableContent}>
            {/* Barra de Filtros */}
            <div className={styles.filterBar}>
              <div className={styles.filterGroup}>
                <label>Nombre</label>
                <div style={{ position: "relative" }}>
                  <Search
                    size={16}
                    style={{
                      position: "absolute",
                      left: "0.8rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#9ca3af",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Buscar nombre..."
                    className={styles.searchInput}
                    style={{ paddingLeft: "2.5rem" }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.filterGroup}>
                <label>Sede</label>
                <select
                  className={styles.filterSelect}
                  value={filterSede}
                  onChange={(e) => setFilterSede(e.target.value)}
                >
                  <option value="">Todas las sedes</option>
                  {SEDES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label>Programa</label>
                <select
                  className={styles.filterSelect}
                  value={filterProducto}
                  onChange={(e) => setFilterProducto(e.target.value)}
                >
                  <option value="">Todos los programas</option>
                  {PRODUCTOS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label>Asesor</label>
                <input
                  type="text"
                  placeholder="Buscar asesor..."
                  className={styles.searchInput}
                  value={filterAsesor}
                  onChange={(e) => setFilterAsesor(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th
                      onClick={() => requestSort("nombreCompleto")}
                      className={styles.sortableHeader}
                    >
                      <div className={styles.headerContent}>
                        Nombre {getSortIcon("nombreCompleto")}
                      </div>
                    </th>
                    <th
                      onClick={() => requestSort("telefono")}
                      className={styles.sortableHeader}
                    >
                      <div className={styles.headerContent}>
                        Teléfono {getSortIcon("telefono")}
                      </div>
                    </th>
                    <th
                      onClick={() => requestSort("sede")}
                      className={styles.sortableHeader}
                    >
                      <div className={styles.headerContent}>
                        Sede {getSortIcon("sede")}
                      </div>
                    </th>
                    <th
                      onClick={() => requestSort("producto")}
                      className={styles.sortableHeader}
                    >
                      <div className={styles.headerContent}>
                        Producto {getSortIcon("producto")}
                      </div>
                    </th>
                    <th
                      onClick={() => requestSort("asesor")}
                      className={styles.sortableHeader}
                    >
                      <div className={styles.headerContent}>
                        Asesor {getSortIcon("asesor")}
                      </div>
                    </th>
                    <th
                      onClick={() => requestSort("fechaRegistro")}
                      className={styles.sortableHeader}
                    >
                      <div className={styles.headerContent}>
                        Fecha/Hora {getSortIcon("fechaRegistro")}
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerContent}>Acciones</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className={styles.loadingText}>
                        Cargando leads...
                      </td>
                    </tr>
                  ) : filteredAndSortedLeads.length > 0 ? (
                    filteredAndSortedLeads.map((lead) => {
                      const { fecha, hora } = formatDateTime(
                        lead.fechaRegistro,
                      );
                      return (
                        <tr key={lead.id}>
                          <td>{lead.nombreCompleto}</td>
                          <td>{lead.telefono}</td>
                          <td>{lead.sede}</td>
                          <td>{lead.producto}</td>
                          <td>
                            <span
                              className={
                                lead.asesor === "no asesor"
                                  ? styles.statusLanding
                                  : styles.statusInternal
                              }
                            >
                              {lead.asesor}
                            </span>
                          </td>
                          <td>
                            {fecha} - {hora}
                          </td>
                          <td className={styles.actions}>
                            <button
                              className={styles.editBtn}
                              onClick={() => handleEditClick(lead)}
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className={styles.loadingText}>
                        No se encontraron leads con estos filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
>>>>>>> birttany_front/main

        {/* COMPONENTE DE NOTIFICACIÓN (Toast) */}
        {notification && (
          <div className={`${styles.toast} ${styles[notification.type]}`}>
            {notification.message}
          </div>
        )}

        {/* MODAL DE EDICIÓN */}
        {isModalOpen && selectedLead && (
          <EditLeadModal
            lead={selectedLead}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveLead}
          />
        )}
      </main>
<<<<<<< HEAD
      <Footer />
=======
>>>>>>> birttany_front/main
    </>
  );
}
