import LeadForm from "./LeadForm";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      {/* 1. Video: Debe estar fuera del div container para no empujar el texto */}
      <video autoPlay muted loop playsInline className={styles.videoBackground}>
<<<<<<< HEAD
        {/* IMPORTANTE: El video debe estar en la carpeta 'public' y llamarse así */}
        <source src="/background.mp4" type="video/mp4" />
=======
        <source src="/background_video.mp4" type="video/mp4" />
>>>>>>> birttany_front/main
      </video>

      {/* 2. Capa de transparencia para que el texto se lea bien */}
      <div className={styles.overlay}></div>

      {/* 3. Contenido: Envuelta en contentWrapper para estar sobre el video */}
      <div className={`container ${styles.contentWrapper}`}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.mainTitle}>
              <span className={styles.badgeBlue}>APRENDE INGLÉS</span>
              {/* <span className={styles.badgeWhite}>Inglés de verdad</span> */}
              <span className={styles.badgeOrange}>EN 1 AÑO</span>
            </h1>

            {/* <div className={styles.textBlock}>
              <p className={styles.subtitle}>
                Programas para Pre Kids, Kids, Teens y Adultos. Modalidad
                virtual o presencial.
              </p>

              <p className={styles.description}>
                Empieza desde cero o rinde un examen de clasificación y conoce
                la sede ideal para ti.
              </p>
            </div> */}

            <ul className={styles.benefits}>
              <li className={styles.benefit}>
                <span className={styles.checkIcon}>✓</span>
                <span className={styles.benefitText}>
                  Certificación internacional (British Council)
                </span>
              </li>
              <li className={styles.benefit}>
                <span className={styles.checkIcon}>✓</span>
                <span className={styles.benefitText}>
                  Clases recuperables + reforzamientos
                </span>
              </li>
              <li className={styles.benefit}>
                <span className={styles.checkIcon}>✓</span>
                <span className={styles.benefitText}>
                  Horarios flexibles (L–V y fines de semana)
                </span>
              </li>
            </ul>
          </div>

          <div className={styles.heroForm} id="formulario">
            <LeadForm />
          </div>
        </div>
      </div>
    </section>
  );
}
