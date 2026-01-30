"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "./Header.module.css";

export default function Header() {
  const router = useRouter();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.headerContent}>
          <div
            className={styles.logo}
            onClick={() => router.push("/")}
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

            <Link
              href="/login"
              className={`btn btn-small btn-primary ${styles.loginBtn}`}
            >
              Iniciar Sesión
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
