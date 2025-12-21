import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brittany Group - Aprende Inglés de Verdad",
  description: "Programas de inglés para Pre Kids, Kids, Teens y Adultos. Certificación internacional, profesores extranjeros y horarios flexibles. Virtual y presencial en Lima y Arequipa.",
  keywords: "inglés, clases de inglés, Brittany Group, certificación internacional, British Council, Lima, Arequipa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
