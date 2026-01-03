"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HeaderAdmin, Sidebar } from "@/shared";
import { useAuth } from "@/shared/contexts/AuthContext";
import styles from "./layout.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <div className={styles.loadingContainer}>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar onToggle={setIsSidebarCollapsed} />

      <div
        className={`${styles.mainWrapper} ${
          isSidebarCollapsed ? styles.expanded : ""
        }`}
      >
        <HeaderAdmin
          adminName={user?.fullname || "Usuario"}
          adminRole={user?.roleName || "Admin"}
          notificationCount={3}
          hideLogo={!isSidebarCollapsed}
        />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
