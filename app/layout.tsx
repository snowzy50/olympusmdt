import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "Olympus - MDT",
  description: "Plateforme MDT premium pour les forces de l'ordre FiveM",
  icons: {
    icon: '/images/logo.png',
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  },
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
