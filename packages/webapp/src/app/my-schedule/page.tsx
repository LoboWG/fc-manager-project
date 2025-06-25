'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // <--- 1. IMPORTER LE HOOK

// --- Interfaces ---
type AvailabilityStatus = 'PRESENT' | 'ABSENT' | 'MAYBE';
interface Session {
  id: string;
  startTime: string;
  endTime: string;
  availabilities: { status: AvailabilityStatus }[];
}

// --- Fonctions Utilitaires ---
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

export default function MySchedulePage() {
  // --- États ---
  const { user, loading: authLoading } = useAuth(); // <--- 2. UTILISER LE HOOK POUR OBTENIR L'UTILISATEUR
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Récupération des données ---
  const fetchSessions = async () => {
    // Cette condition est maintenant valide car "user" existe
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3000/api/sessions/my-schedule', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('La récupération des sessions a échoué');
      }
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // On attend que le chargement de l'authentification soit terminé avant de fetcher
    if (!authLoading) {
      fetchSessions();
    }
  }, [user, authLoading]); // On relance si l'utilisateur ou le statut de chargement change

  // --- Gestion des clics ---
  const handleSetAvailability = async (sessionId: string, status: AvailabilityStatus) => {
    setSessions(currentSessions =>
      currentSessions.map(s => 
        s.id === sessionId ? { ...s, availabilities: [{ status }] } : s
      )
    );

    await fetch(`http://localhost:3000/api/sessions/${sessionId}/availabilities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
  };

  // --- Rendu ---
  if (isLoading || authLoading) {
    return <div className="p-8 text-white">Chargement de votre calendrier...</div>;
  }

  if (!user) {
    return <div className="p-8 text-white">Veuillez vous connecter pour voir votre calendrier.</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Mes Présences</h1>
      <div className="space-y-6">
        {sessions.map((session) => {
          const currentUserStatus = session.availabilities[0]?.status;
          return (
            <div key={session.id} className="p-6 bg-gray-800 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold text-white mb-2">
                Session du {formatDate(session.startTime)}
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
                <p className="text-gray-300 flex-grow">
                  Votre statut :
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSetAvailability(session.id, 'PRESENT')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      currentUserStatus === 'PRESENT'
                        ? 'bg-green-500 text-white ring-2 ring-white'
                        : 'bg-gray-600 hover:bg-green-700'
                    }`}
                  >
                    ✅ Présent
                  </button>
                  <button
                    onClick={() => handleSetAvailability(session.id, 'ABSENT')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      currentUserStatus === 'ABSENT'
                        ? 'bg-red-500 text-white ring-2 ring-white'
                        : 'bg-gray-600 hover:bg-red-700'
                    }`}
                  >
                    ❌ Absent
                  </button>
                  <button
                    onClick={() => handleSetAvailability(session.id, 'MAYBE')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      currentUserStatus === 'MAYBE'
                        ? 'bg-yellow-500 text-white ring-2 ring-white'
                        : 'bg-gray-600 hover:bg-yellow-700'
                    }`}
                  >
                    ❔ Peut-être
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {sessions.length === 0 && (
          <div className="p-6 bg-gray-800 rounded-lg text-center text-gray-400">
            Aucune session n'est planifiée pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}