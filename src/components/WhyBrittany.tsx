import styles from './WhyBrittany.module.css';

export default function WhyBrittany() {
    const features = [
        {
            icon: '💬',
            title: 'Método práctico',
            description: 'Hablas desde el inicio',
        },
        {
            icon: '🌍',
            title: 'Profesores extranjeros',
            description: 'Confianza y fluidez real',
        },
        {
            icon: '📚',
            title: 'Soporte y reforzamiento',
            description: 'Clínicas personalizadas',
        },
        {
            icon: '⏰',
            title: 'Flexibilidad',
            description: 'Virtual/presencial + horarios',
        },
        {
            icon: '👥',
            title: 'Para cada edad',
            description: 'Kids, Teens, Adultos',
        },
    ];

    return (
        <section className={styles.section}>
            <div className="container">
                <h2 className={styles.title}>¿Por qué Brittany?</h2>

                <div className={styles.grid}>
                    {features.map((feature, index) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.icon}>{feature.icon}</div>
                            <h3 className={styles.cardTitle}>{feature.title}</h3>
                            <p className={styles.cardDescription}>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
