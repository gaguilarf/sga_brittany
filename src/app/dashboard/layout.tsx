"use client";

import { useState } from "react";
import { HeaderAdmin, Sidebar } from "@/shared";
import styles from "./layout.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar onToggle={setIsSidebarCollapsed} />

      <div
        className={`${styles.mainWrapper} ${
          isSidebarCollapsed ? styles.expanded : ""
        }`}
      >
        <HeaderAdmin
          adminName="Carlos Ruiz"
          adminRole="Admin"
          notificationCount={3}
          hideLogo={!isSidebarCollapsed}
        />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
