import { AuthProvider } from '@/contexts/AuthContext';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PublicHeader from "@/components/PublicHeader"; // <-- L'import de notre nouveau header

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// J'en profite pour mettre à jour les métadonnées
export const metadata: Metadata = {
  title: "FC Manager",
  description: "La plateforme de gestion pour votre équipe Esport.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-white`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
        <PublicHeader />
        <main className="pt-20">{children}</main> {/* C'est une bonne pratique d'envelopper le contenu principal dans une balise <main> */}
        </AuthProvider>
        </body>
    </html>
  );
}