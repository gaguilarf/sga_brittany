import type { Metadata } from "next";
import "./globals.css";
import BackToTop from "@/components/BackToTop";

export const metadata: Metadata = {
  title: "Brittany Group - Aprende Inglés de Verdad",
  description: "Programas de inglés para Pre Kids, Kids, Teens y Adultos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
        <BackToTop />
      </body>
    </html>
  );
}
