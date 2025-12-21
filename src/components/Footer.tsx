import styles from './Footer.module.css';

export default function Footer() {
    const sedes = [
        {
            ciudad: 'Lima',
            direcciones: [
                { nombre: 'Miraflores', direccion: 'Av. Larco 1234', telefono: '+51 987 654 321' },
                { nombre: 'Lince', direccion: 'Av. Arenales 5678', telefono: '+51 987 654 322' },
            ],
        },
        {
            ciudad: 'Arequipa',
            direcciones: [
                { nombre: 'Bustamante', direccion: 'Calle Bustamante 123', telefono: '+51 987 654 323' },
                { nombre: 'Centro', direccion: 'Calle Mercaderes 456', telefono: '+51 987 654 324' },
                { nombre: 'Cayma', direccion: 'Av. Cayma 789', telefono: '+51 987 654 325' },
                { nombre: 'Umacollo', direccion: 'Av. Umacollo 321', telefono: '+51 987 654 326' },
                { nombre: 'Brittany Kids (JLByR)', direccion: 'Av. JLByR 654', telefono: '+51 987 654 327' },
            ],
        },
    ];

    return (
        <footer className={styles.footer} id="sedes">
            <div className="container">
                <div className={styles.brand}>
                    <h3 className={styles.brandTitle}>Brittany Group</h3>
                    <p className={styles.tagline}>El verdadero INGLÉS</p>
                </div>

                <div className={styles.sedesGrid}>
                    {sedes.map((ciudad, index) => (
                        <div key={index} className={styles.ciudadSection}>
                            <h4 className={styles.ciudadTitle}>{ciudad.ciudad}</h4>
                            <div className={styles.sedesList}>
                                {ciudad.direcciones.map((sede, sedeIndex) => (
                                    <div key={sedeIndex} className={styles.sede}>
                                        <p className={styles.sedeName}>{sede.nombre}</p>
                                        <p className={styles.sedeInfo}>{sede.direccion}</p>
                                        <p className={styles.sedeInfo}>
                                            <a href={`tel:${sede.telefono}`} className={styles.phone}>
                                                {sede.telefono}
                                            </a>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.bottom}>
                    <p className={styles.copyright}>
                        © {new Date().getFullYear()} Brittany Group. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
}
