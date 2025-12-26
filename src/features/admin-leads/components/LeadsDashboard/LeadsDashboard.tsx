"use client";

import { useEffect, useState } from "react";
import { Header, Footer } from "@/shared";
import { getLeads, Lead, patchLead } from "../../services/leadService";
import styles from "./LeadsDashboard.module.css";
import * as XLSX from "xlsx";
import EditLeadModal from "../../components/EditLeadModal/EditLeadModal";

export default function LeadsDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS PARA LA EDICIÓN Y NOTIFICACIÓN ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    getLeads().then((data) => {
      setLeads(data);
      setLoading(false);
    });
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
      }, 2000);
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
      <Header />
      <main className={styles.mainContainer}>
        <div className={styles.topBar}>
          <h1 className={styles.title}>ADMINISTRACIÓN DE LEADS</h1>
          <div className={styles.buttonGroup}>
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
      <Footer />
    </>
  );
}
