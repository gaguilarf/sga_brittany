import styles from './CTAFinal.module.css';

export default function CTAFinal() {
    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.content}>
                    <h2 className={styles.title}>¿Listo para empezar?</h2>
                    <p className={styles.subtitle}>
                        Únete a miles de estudiantes que ya están aprendiendo inglés de verdad
                    </p>

                    <div className={styles.buttons}>
                        <a href="#formulario" className="btn btn-primary">
                            Quiero que me contacten
                        </a>
                        <a
                            href="https://wa.me/51928200102"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                        >
                            Hablar por WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
