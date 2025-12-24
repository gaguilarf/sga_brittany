'use client';

import { useState } from 'react';
import styles from './FAQ.module.css';

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs = [
        {
            question: '¿En cuánto tiempo veo resultados?',
            answer: 'Desde el primer mes notarás mejoras en tu comprensión y pronunciación. En 6 meses podrás mantener conversaciones de nivel intermedio, y en 1 año alcanzarás un nivel avanzado con certificación internacional.',
        },
        {
            question: '¿Puedo recuperar clases?',
            answer: 'Sí, todas nuestras clases son recuperables. Si faltas a una sesión, puedes asistir a otra clase del mismo nivel en un horario diferente sin costo adicional.',
        },
        {
            question: '¿Qué horarios tienen?',
            answer: 'Ofrecemos horarios flexibles de lunes a viernes en la mañana, tarde y noche, además de opciones los fines de semana. Puedes elegir el horario que mejor se adapte a tu rutina.',
        },
        {
            question: '¿Virtual funciona igual?',
            answer: 'Absolutamente. Nuestras clases virtuales mantienen la misma calidad y metodología que las presenciales, con profesores en vivo, interacción en tiempo real y acceso a todos los materiales digitales.',
        },
        {
            question: '¿Puedo pausar mis ciclos?',
            answer: 'Sí, entendemos que pueden surgir imprevistos. Puedes pausar tu ciclo por razones justificadas y retomarlo cuando estés listo, manteniendo tu nivel y progreso.',
        },
    ];

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className={styles.section} id="faq">
            <div className="container">
                <h2 className={styles.title}>Preguntas Frecuentes</h2>

                <div className={styles.faqList}>
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`${styles.faqItem} ${openIndex === index ? styles.open : ''}`}
                        >
                            <button
                                className={styles.question}
                                onClick={() => toggleFAQ(index)}
                            >
                                <span>{faq.question}</span>
                                <span className={styles.icon}>
                                    {openIndex === index ? '−' : '+'}
                                </span>
                            </button>

                            {openIndex === index && (
                                <div className={styles.answer}>
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
