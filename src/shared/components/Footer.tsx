import styles from './Footer.module.css';

export default function Footer() {
    const sedes = [
        {
            ciudad: 'Lima',
            direcciones: [
                { nombre: 'Miraflores', direccion: 'Av. Benavides 330', telefono: '(01) 4085672' },
                { nombre: 'Lince', direccion: 'Av. Arequipa 1604', telefono: '(01) 4128243' },
            ],
        },
        {
            ciudad: 'Arequipa',
            direcciones: [
                { nombre: 'José Luis Bustamante R.', direccion: 'Av. EEUU (a media cuadra de la pizzería Presto) ', telefono: '(054) 691874' },
                { nombre: 'San José', direccion: 'Calle San José 105, frente a La Ibérica', telefono: '+51 928 200 102' },
                { nombre: 'Umacollo', direccion: 'Calle María Nieves Bustamante 115, Umacollo (a 1/2 cuadra del parque de la    U. Católica)', telefono: '(054) 627563' },
                { nombre: 'Cayma', direccion: 'Calle Los Arces 102 (a media cuada del paradero de Real Plaza)', telefono: '+51 957 167 441' },
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
