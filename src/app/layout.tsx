import type { Metadata } from "next";
import "./globals.css";
import BackToTop from "@/shared/components/BackToTop";
import { AuthProvider } from "@/shared/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Brittany Group - Aprende Inglés de Verdad",
  description: "Programas de inglés para Pre Kids, Kids, Teens y Adultos.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
          <BackToTop />
        </AuthProvider>
      </body>
    </html>
  );
}
