import styles from "./page.module.css";

export default function MatriculasPage() {
  return (
    <>
      <h1 className={styles.pageTitle}>Gestión de Matrículas</h1>
      <p className={styles.pageDescription}>
        Desde aquí podrás gestionar todas las matrículas del sistema.
      </p>

      <div className={styles.contentPlaceholder}>
        <p>Próximamente: Listado y filtros de matrículas.</p>
      </div>
    </>
  );
}
