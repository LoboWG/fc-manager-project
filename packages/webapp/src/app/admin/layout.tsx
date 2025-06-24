import Link from 'next/link';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Barre de Navigation Latérale (Sidebar) */}
      <aside className="w-64 bg-gray-800 p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-8">FC Manager</h1>
        <nav className="flex flex-col space-y-4">
          <Link href="/admin/dashboard">
            <span className="px-4 py-2 rounded hover:bg-gray-700 cursor-pointer">Tableau de Bord</span>
          </Link>
          <Link href="/admin/competitions">
            <span className="px-4 py-2 rounded hover:bg-gray-700 cursor-pointer">Compétitions</span>
          </Link>
          <Link href="/admin/schedule">
            <span className="px-4 py-2 rounded hover:bg-gray-700 cursor-pointer">Calendrier</span>
          </Link>
          <Link href="/admin/settings">
            <span className="px-4 py-2 rounded hover:bg-gray-700 cursor-pointer">Paramètres</span>
          </Link>
        </nav>
      </aside>

      {/* Contenu Principal de la Page */}
      <main className="flex-1 p-8">
        {children} {/* C'est ici que le contenu de vos pages s'affichera */}
      </main>
    </div>
  );
}