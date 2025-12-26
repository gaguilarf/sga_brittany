"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./Header.module.css";

export default function Header() {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Inicia el contador (ej. 3 segundos para que sea realmente secreto)
  const startPress = () => {
    timerRef.current = setTimeout(() => {
      router.push("/admin");
    }, 1000);
  };

  // Cancela si se suelta el click antes de tiempo
  const cancelPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.headerContent}>
          <div
            className={styles.logo}
            onMouseDown={startPress}
            onMouseUp={cancelPress}
            onMouseLeave={cancelPress} // Cancela si el mouse sale del logo
            onTouchStart={startPress} // Soporte para móviles
            onTouchEnd={cancelPress}
            style={{ cursor: "pointer", userSelect: "none" }}
          >
            <Image
              src="/logo_blanco.png"
              alt="Brittany Group"
              width={180}
              height={50}
              priority
              className={styles.logoImage}
            />
          </div>

          <nav className={styles.nav}>
            <a href="#programas" className={styles.navLink}>
              Programas
            </a>
            <a href="#sedes" className={styles.navLink}>
              Sedes
            </a>
            <a href="#faq" className={styles.navLink}>
              FAQ
            </a>

            <a
              href="https://wa.me/51999999999"
              target="_blank"
              rel="noopener noreferrer"
              className={`btn btn-small btn-primary ${styles.whatsappBtn}`}
            >
              Hablar por WhatsApp
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
