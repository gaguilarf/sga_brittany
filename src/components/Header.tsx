import Image from 'next/image';
import styles from './Header.module.css';

export default function Header() {
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.headerContent}>
                    <div className={styles.logo}>
                        <Image
                            src="/logo_blanco.png"
                            alt="Brittany Group"
                            width={180}
                            height={50}
                            priority
                            className={styles.logoImage}
                        />
                    </div>

                    <nav className={styles.nav}>
                        <a href="#programas" className={styles.navLink}>Programas</a>
                        <a href="#sedes" className={styles.navLink}>Sedes</a>
                        <a href="#faq" className={styles.navLink}>FAQ</a>

                        <a
                            href="https://wa.me/51999999999"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`btn btn-small btn-primary ${styles.whatsappBtn}`}
                        >
                            Hablar por WhatsApp
                        </a>
                    </nav>
                </div>
            </div>
        </header>
    );
}
