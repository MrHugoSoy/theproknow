import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TheProKnow · Aprende de quienes saben",
    template: "%s · TheProKnow",
  },
  description:
    "Red social de conocimiento en español: comparte consejos, preguntas, tutoriales y artículos.",
};

export const viewport: Viewport = {
  themeColor: "#0B1B3B",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
