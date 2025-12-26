"use client";

import { useEffect, useState } from "react";
import { Header, Footer } from "@/shared";
import { getLeads, Lead } from "../../services/leadService";
import styles from "./LeadsDashboard.module.css";

export default function LeadsDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeads().then((data) => {
      setLeads(data);
      setLoading(false);
    });
  }, []);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("es-PE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
      time: date.toLocaleTimeString("es-PE", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  return (
    <>
      <Header />
      <main className={styles.mainContainer}>
        <div className={styles.topBar}>
          <h1 className={styles.title}>LEADS REGISTRADOS</h1>
          <button className={`btn btn-small btn-primary ${styles.exportBtn}`}>
            Exportar a PDF
          </button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>Edad</th>
                <th>Teléfono</th>
                <th>Sede</th>
                <th>Producto</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className={styles.loading}>
                    Cargando datos...
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const { date, time } = formatDateTime(lead.fechaRegistro);
                  return (
                    <tr key={lead.id}>
                      <td>{lead.nombreCompleto}</td>
                      <td>{lead.edad}</td>
                      <td>{lead.telefono}</td>
                      <td>{lead.sede}</td>
                      <td>{lead.producto}</td>
                      <td>{date}</td>
                      <td>{time}</td>
                      <td className={styles.actions}>
                        <button className={styles.editBtn}>Editar</button>
                        <button className={styles.deleteBtn}>Eliminar</button>
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
