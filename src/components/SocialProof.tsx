import { Users, Calendar, MapPin, MessageSquare } from "lucide-react";
import styles from "./SocialProof.module.css";

const stats = [
    { value: "4.8/5", label: "Alumnos satisfechos", icon: <Users size={32} /> },
    {
        value: "+25 años",
        label: "Enseñando inglés",
        icon: <Calendar size={32} />,
    },
    { value: "7 Sedes", label: "En Perú", icon: <MapPin size={32} /> },
    {
        value: "Real Club",
        label: "Práctica real",
        icon: <MessageSquare size={32} />,
    },
];

export default function SocialProof() {
    return (
        <section className={styles.socialProof}>
            <div className="container">
                <div className={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <div key={index} className={styles.stat}>
                            {/* Contenedor del icono */}
                            <div className={styles.iconContainer}>{stat.icon}</div>
                            <div className={styles.statValue}>{stat.value}</div>
                            <div className={styles.statLabel}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}