"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HeaderAdmin, Sidebar } from "@/shared";
import { useAuth } from "@/shared/contexts/AuthContext";
import styles from "./layout.module.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Strict route protection
  useEffect(() => {
    if (isMounted && !isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isMounted, isLoading, isAuthenticated, router]);

  if (!isMounted || isLoading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Cargando...
      </div>
    );
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
