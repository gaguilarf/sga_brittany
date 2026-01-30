"use client";

import { useEffect, useState } from "react";
import {
  List,
  PlusCircle,
  FileDown,
  Search,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { getLeads, Lead, patchLead } from "../../services/leadService";
import styles from "./LeadsDashboard.module.css";
import * as XLSX from "xlsx";
import EditLeadModal from "../../components/EditLeadModal/EditLeadModal";
import LeadForm from "./LeadForm";
import { SEDES, PRODUCTOS } from "@/features/landing/models/Lead";

export default function LeadsDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"form" | "table">("form");

  // --- ESTADOS PARA LA EDICIÓN Y NOTIFICACIÓN ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

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

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
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
    const fetchLeads = () => {
      getLeads().then((data) => {
        setLeads(data);
        setLoading(false);
      });
    };

    fetchLeads();
    const intervalId = setInterval(fetchLeads, 5000);
    return () => clearInterval(intervalId);
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
      const { id, fechaRegistro, ...rest } = updatedLead;
      const payload = { ...rest, edad: Number(rest.edad) };

      const savedLead = await patchLead(id!, payload);

      setLeads((prev) => prev.map((l) => (l.id === id ? savedLead : l)));

      setNotification({
        message: "¡Lead actualizado con éxito!",
        type: "success",
      });

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
        Asesor: lead.asesor,
        "Fecha de Registro": fecha,
        Hora: hora,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");

    worksheet["!cols"] = Object.keys(dataToExport[0] || {}).map((k) => ({
      wch: k.length + 15,
    }));

    XLSX.writeFile(workbook, `Leads_Brittany_${Date.now()}.xlsx`);
  };

  return (
    <main className={styles.mainContainer}>
      <div className={styles.topBar}>
        <h1 className={styles.title}>ADMINISTRACIÓN DE LEADS</h1>
        <div className={styles.buttonGroup}>
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
                className={styles.exportBtn}
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
          {/* filtros + tabla (idéntico a branch birttany_front/main) */}
        </div>
      )}

      {notification && (
        <div className={`${styles.toast} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}

      {isModalOpen && selectedLead && (
        <EditLeadModal
          lead={selectedLead}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveLead}
        />
      )}
    </main>
  );
}
