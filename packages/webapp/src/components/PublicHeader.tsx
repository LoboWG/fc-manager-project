'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext'; // On importe notre hook personnalisé

export default function PublicHeader() {
  // On récupère l'utilisateur et l'état de chargement depuis le contexte
  const { user, loading } = useAuth();

  return (
    <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
      <Link href="/">
        <span className="text-xl font-bold text-white cursor-pointer">
          FC Manager
        </span>
      </Link>
      <Link href="/my-schedule"><span className="cursor-pointer hover:text-blue-400">Mes Présences</span></Link>

      <div className="flex items-center gap-4">
        {/* Pendant que l'on vérifie si l'utilisateur est connecté, on peut afficher un message */}
        {loading && (
          <span className="text-sm text-gray-400">Chargement...</span>
        )}

        {/* Une fois le chargement terminé ET si l'utilisateur est connecté */}
        {!loading && user && (
          <>
            <span className="text-white hidden sm:block">Bonjour, {user.username}</span>

            {/* On affiche le bouton Admin SEULEMENT si le rôle est le bon */}
            {(user.role === 'MANAGER' || user.role === 'CO_MANAGER') && (
              <Link href="/admin/dashboard">
                <span className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700">
                  Administration
                </span>
              </Link>
            )}

            <a href="http://localhost:3000/api/auth/logout" className="px-4 py-2 text-sm font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700">
              Se déconnecter
            </a>
          </>
        )}

        {/* Une fois le chargement terminé ET si l'utilisateur N'EST PAS connecté */}
        {!loading && !user && (
          <a href="http://localhost:3000/api/auth/discord" className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            Se connecter
          </a>
        )}
      </div>
    </header>
  );
}