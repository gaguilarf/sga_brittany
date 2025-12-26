"use client";

import { useEffect, useState } from "react";
import { Header, Footer } from "@/shared";
import { getLeads, Lead } from "../../services/leadService";
import styles from "./LeadsDashboard.module.css";
import * as XLSX from "xlsx";

export default function LeadsDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeads().then((data) => {
      setLeads(data);
      setLoading(false);
    });
  }, []);

  // Función para formatear fecha y hora
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

  // --- FUNCIÓN DE EXPORTACIÓN A EXCEL ---
  const handleExportExcel = () => {
    // 1. Preparamos los datos (limpiamos el ID y formateamos fechas)
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

    // 2. Creamos la hoja de trabajo (worksheet)
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // 3. Creamos el libro de trabajo (workbook)
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");

    // 4. Ajustar el ancho de las columnas automáticamente (opcional)
    const maxWidths = Object.keys(dataToExport[0] || {}).map((key) => ({
      wch: key.length + 10,
    }));
    worksheet["!cols"] = maxWidths;

    // 5. Descargar el archivo
    XLSX.writeFile(workbook, `Leads_Brittany_${new Date().getTime()}.xlsx`);
  };

  return (
    <>
      <Header />
      <main className={styles.mainContainer}>
        <div className={styles.topBar}>
          <h1 className={styles.title}>ADMINISTRACIÓN DE LEADS</h1>
          <div className={styles.buttonGroup}>
            {/* Añadimos el botón de Excel junto al de PDF si lo tenías */}
            <button
              className={`btn btn-small btn-primary ${styles.export}`}
              onClick={handleExportExcel}
              disabled={leads.length === 0}
            >
              EXPORTAR
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
                  <td colSpan={6}>Cargando...</td>
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
                        <button className={styles.editBtn}>Editar</button>
                        <button className={styles.deleteBtn}>
                          Eliminar
                        </button>{" "}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </>
  );
}
