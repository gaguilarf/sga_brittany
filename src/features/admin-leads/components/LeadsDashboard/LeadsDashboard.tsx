"use client";

import { useEffect, useState } from "react";
import { Header, Footer } from "@/shared";
import LeadCard from "../LeadCard/LeadCard";
import { getLeads, Lead } from "../../services/leadService";
import styles from "./LeadsDashboard.module.css";

export default function LeadsDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      const data = await getLeads();
      setLeads(data);
      setLoading(false);
    };
    fetchLeads();
  }, []);

  return (
    <>
      <Header />
      <main className="container">
        <div className={styles.adminHeader}>
          <h1 className={styles.title}>LEADS</h1>
          <button className={styles.exportBtn}>Exportar a pdf</button>
        </div>

        <section className={styles.leadsList}>
          {loading ? (
            <p>Cargando leads...</p>
          ) : (
            leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
