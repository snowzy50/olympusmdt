import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OlympusMDT - Système de Terminal Mobile de Données",
  description: "Plateforme MDT premium pour les forces de l'ordre FiveM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="overflow-hidden">
        {children}
      </body>
    </html>
  );
}
