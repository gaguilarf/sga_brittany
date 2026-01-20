"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MapPin,
  Users,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  onToggle?: (isCollapsed: boolean) => void;
}

export default function Sidebar({ onToggle }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    {
      label: "Inicio",
      href: "/admin/dashboard",
      icon: <Home size={20} />,
    },
    {
      label: "Gestión de Sedes",
      href: "/admin/sedes",
      icon: <MapPin size={20} />,
    },
  ];

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onToggle) onToggle(newState);
  };

  return (
    <aside
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}
    >
      <div className={styles.sidebarHeader}>
        <div className={styles.logoContainer}>
          <Image
            src={isCollapsed ? "/logo_simple.png" : "/logo_blanco.png"}
            alt="Brittany"
            width={isCollapsed ? 40 : 170}
            height={40}
            className={styles.logo}
            priority
          />
        </div>
        <button
          className={styles.toggleBtn}
          onClick={handleToggle}
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className={styles.sidebarNav}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
            >
              <span className={styles.icon}>{item.icon}</span>
              {!isCollapsed && (
                <span className={styles.label}>{item.label}</span>
              )}
              {isCollapsed && (
                <div className={styles.tooltip}>{item.label}</div>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
