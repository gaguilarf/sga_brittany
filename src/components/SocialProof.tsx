import styles from './SocialProof.module.css';

export default function SocialProof() {
    const stats = [
        { value: '4.8/5', label: 'Alumnos satisfechos' },
        { value: '+25 años', label: 'Enseñando inglés' },
        { value: '7 Sedes', label: 'En Perú' },
        { value: 'Conversation Club', label: 'Práctica real' },
    ];

    return (
        <section className={styles.socialProof}>
            <div className="container">
                <div className={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <div key={index} className={styles.stat}>
                            <div className={styles.statValue}>{stat.value}</div>
                            <div className={styles.statLabel}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
