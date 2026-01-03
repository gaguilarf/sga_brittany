"use client";

import styles from "./ConstructionPlaceholder.module.css";

interface ConstructionPlaceholderProps {
  moduleName: string;
}

export default function ConstructionPlaceholder({
  moduleName,
}: ConstructionPlaceholderProps) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>
        <h1 className={styles.title}>Módulo de {moduleName}</h1>
        <p className={styles.message}>
          Módulo en construcción. Próximamente disponible.
        </p>
      </div>
    </div>
  );
}
