import styles from './Programs.module.css';

export default function Programs() {
    const programs = [
        {
            title: 'Brittany Pre Kids',
            age: '4–6 años',
            description: 'Introducción al inglés de forma lúdica y divertida',
            color: 'var(--color-orange-primary)',
        },
        {
            title: 'Brittany Kids',
            age: '7–11 años',
            description: 'Desarrollo de habilidades comunicativas básicas',
            color: 'var(--color-blue-primary)',
        },
        {
            title: 'Teens',
            age: '12–17 años',
            description: 'Inglés para adolescentes con enfoque práctico',
            color: 'var(--color-orange-primary)',
        },
        {
            title: 'Adultos',
            age: '18+ años',
            description: 'Inglés para trabajo, viajes y entrevistas',
            color: 'var(--color-blue-primary)',
        },
    ];

    return (
        <section className={styles.section} id="programas">
            <div className="container">
                <h2 className={styles.title}>Nuestros Programas</h2>

                <div className={styles.grid}>
                    {programs.map((program, index) => (
                        <div
                            key={index}
                            className={styles.card}
                            style={{ '--accent-color': program.color } as React.CSSProperties}
                        >
                            <div className={styles.cardHeader}>
                                <h3 className={styles.programTitle}>{program.title}</h3>
                                <div className={styles.age}>{program.age}</div>
                            </div>
                            <p className={styles.description}>{program.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
