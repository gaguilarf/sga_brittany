"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./Header.module.css";

export default function Header() {
  const router = useRouter();
<<<<<<< HEAD
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
=======
>>>>>>> birttany_front/main

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.headerContent}>
          <div
            className={styles.logo}
<<<<<<< HEAD
            onMouseDown={startPress}
            onMouseUp={cancelPress}
            onMouseLeave={cancelPress} // Cancela si el mouse sale del logo
            onTouchStart={startPress} // Soporte para móviles
            onTouchEnd={cancelPress}
=======
            onClick={() => router.push("/")}
>>>>>>> birttany_front/main
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
<<<<<<< HEAD
              href="https://wa.me/51999999999"
              target="_blank"
              rel="noopener noreferrer"
              className={`btn btn-small btn-primary ${styles.whatsappBtn}`}
            >
              Hablar por WhatsApp
=======
              href="/login"
              className={`btn btn-small btn-primary ${styles.loginBtn}`}
            >
              Iniciar Sesión
>>>>>>> birttany_front/main
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
