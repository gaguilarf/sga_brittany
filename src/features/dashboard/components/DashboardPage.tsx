import styles from "./page.module.css";

export default function DashboardPage() {
  return (
    <>
      <h1 className={styles.pageTitle}>Panel de Control</h1>
      <p className={styles.pageDescription}>
        Bienvenido al panel de administración de Brittany Group
      </p>

      {/* Aquí irá el contenido del dashboard */}
      <div className={styles.contentPlaceholder}>
        <p>Contenido del dashboard...</p>
      </div>
    </>
  );
}
