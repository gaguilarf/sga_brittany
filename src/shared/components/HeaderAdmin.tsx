"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./HeaderAdmin.module.css";

interface HeaderAdminProps {
  adminName?: string;
  adminRole?: string;
  notificationCount?: number;
  hideLogo?: boolean;
}

export default function HeaderAdmin({
  adminName = "Carlos Ruiz",
  adminRole = "Admin",
  notificationCount = 0,
  hideLogo = false,
}: HeaderAdminProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: "Matrículas", href: "/admin/matriculas", icon: "" },
    { label: "Alumnos", href: "/admin/alumnos", icon: "" },
    { label: "Docentes", href: "/admin/docentes", icon: "" },
    { label: "Pagos", href: "/admin/pagos", icon: "" },
    { label: "Leads", href: "/admin/leads", icon: "" },
    { label: "Reportes", href: "/admin/reportes", icon: "" },
    { label: "Sedes", href: "/admin/sedes", icon: "" },
  ];

  const handleLogout = () => {
    // Implementar lógica de logout
    console.log("Logout");
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.headerContent}>
          {/* Logo */}
          {!hideLogo && (
            <div className={styles.logo}>
              <Image
                src="/logo_azul.png"
                alt="Brittany Group"
                width={150}
                height={40}
                priority
                className={styles.logoImage}
              />
            </div>
          )}

          {/* Navigation Menu (Desktop) */}
          <nav className={styles.nav}>
            {menuItems.map((item) => (
              <a key={item.label} href={item.href} className={styles.navLink}>
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Section: Notifications & User */}
          <div className={styles.rightSection}>
            {/* Hamburger Button (Mobile) */}
            <button
              className={styles.hamburgerBtn}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menú"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {isMobileMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18" />
                )}
              </svg>
            </button>
            {/* Notifications */}
            <div className={styles.notificationWrapper}>
              <button
                className={styles.notificationBtn}
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notificaciones"
              >
                <svg
                  className={styles.bellIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {notificationCount > 0 && (
                  <span className={styles.notificationBadge}>
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className={styles.notificationDropdown}>
                  <div className={styles.dropdownHeader}>
                    <h4>Notificaciones</h4>
                  </div>
                  <div className={styles.notificationList}>
                    {notificationCount === 0 ? (
                      <p className={styles.emptyNotifications}>
                        No hay notificaciones nuevas
                      </p>
                    ) : (
                      <p className={styles.emptyNotifications}>
                        {notificationCount} notificaciones pendientes
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className={styles.userWrapper}>
              <button
                className={styles.userBtn}
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className={styles.userAvatar}>
                  <span>{adminName.charAt(0)}</span>
                </div>
                <div className={styles.userInfo}>
                  <span className={styles.userRole}>{adminRole}:</span>
                  <span className={styles.userName}>{adminName}</span>
                </div>
                <svg
                  className={styles.chevronIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className={styles.userDropdown}>
                  <a href="/admin/perfil" className={styles.dropdownItem}>
                    <svg
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Mi Perfil
                  </a>
                  <a
                    href="/admin/configuracion"
                    className={styles.dropdownItem}
                  >
                    <svg
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Configuración
                  </a>
                  <div className={styles.dropdownDivider}></div>
                  <button
                    onClick={handleLogout}
                    className={styles.dropdownItem}
                  >
                    <svg
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`${styles.mobileNav} ${
          isMobileMenuOpen ? styles.mobileNavOpen : ""
        }`}
      >
        {menuItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={styles.mobileNavLink}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className={styles.mobileNavIcon}>{item.icon}</span>
            {item.label}
          </a>
        ))}
      </div>
    </header>
  );
}
