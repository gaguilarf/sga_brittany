import styles from './Testimonials.module.css';

export default function Testimonials() {
    const testimonials = [
        {
            name: 'María González',
            text: 'En 6 meses ya puedo mantener conversaciones fluidas. Los profesores son excelentes.',
            initials: 'MG',
        },
        {
            name: 'Carlos Pérez',
            text: 'Mi hijo está encantado con las clases. Ha mejorado muchísimo su pronunciación.',
            initials: 'CP',
        },
        {
            name: 'Ana Rodríguez',
            text: 'Conseguí el trabajo que quería gracias a mi nivel de inglés. ¡Totalmente recomendado!',
            initials: 'AR',
        },
    ];

    return (
        <section className={styles.section}>
            <div className="container">
                <h2 className={styles.title}>Lo dicen quienes ya empezaron</h2>

                <div className={styles.grid}>
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.avatar}>
                                {testimonial.initials}
                            </div>
                            <p className={styles.text}>"{testimonial.text}"</p>
                            <p className={styles.name}>{testimonial.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
