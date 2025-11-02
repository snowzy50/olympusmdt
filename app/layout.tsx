import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";

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
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
