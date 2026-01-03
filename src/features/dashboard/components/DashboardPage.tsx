import { HeaderAdmin } from "@/shared";
import styles from "./page.module.css";

export default function DashboardPage() {
  return (
    <div className={styles.dashboardLayout}>
      <HeaderAdmin
        adminName="Carlos Ruiz"
        adminRole="Admin"
        notificationCount={3}
      />

      <main className={styles.mainContent}>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>Panel de Control</h1>
          <p className={styles.pageDescription}>
            Bienvenido al panel de administración de Brittany Group
          </p>

          {/* Aquí irá el contenido del dashboard */}
          <div className={styles.contentPlaceholder}>
            <p>Contenido del dashboard...</p>
          </div>
        </div>
      </main>
    </div>
  );
}
