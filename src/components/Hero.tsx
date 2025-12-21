import LeadForm from './LeadForm';
import styles from './Hero.module.css';

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className="container">
                <div className={styles.heroContent}>
                    <div className={styles.heroText}>
                        <h1 className={styles.title}>
                            Aprende inglés de verdad. En 1 año, con profesores extranjeros y certificación internacional.
                        </h1>

                        <p className={styles.subtitle}>
                            Programas para Pre Kids, Kids, Teens y Adultos. Modalidad virtual o presencial.
                        </p>

                        <p className={styles.description}>
                            Empieza desde cero o rinde un examen de clasificación y conoce la sede ideal para ti.
                        </p>

                        <ul className={styles.benefits}>
                            <li className={styles.benefit}>
                                <span className={styles.checkIcon}>✓</span>
                                <span>Certificación internacional (British Council)</span>
                            </li>
                            <li className={styles.benefit}>
                                <span className={styles.checkIcon}>✓</span>
                                <span>Clases recuperables + reforzamientos</span>
                            </li>
                            <li className={styles.benefit}>
                                <span className={styles.checkIcon}>✓</span>
                                <span>Horarios flexibles (L–V y fines de semana)</span>
                            </li>
                        </ul>

                        <div className={styles.ctaMobile}>
                            <a href="#formulario" className="btn btn-primary btn-large">
                                Quiero información
                            </a>
                        </div>
                    </div>

                    <div className={styles.heroForm} id="formulario">
                        <LeadForm />
                    </div>
                </div>
            </div>
        </section>
    );
}
