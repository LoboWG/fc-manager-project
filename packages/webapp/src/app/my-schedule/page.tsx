// Fichier : webapp/src/app/my-schedule/page.tsx
'use client';

import { useState, useEffect } from 'react';

// --- Types de Données ---
type AvailabilityStatus = 'PRESENT' | 'ABSENT' | 'MAYBE';
interface Session {
  id: string;
  startTime: string;
  availabilities: { status: AvailabilityStatus }[];
}

// --- Fonctions Utilitaires ---
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

export default function MySchedulePage() {
  // --- États ---
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Récupération des données ---
  const fetchSessions = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/sessions', {
        credentials: 'include', // Important pour envoyer le cookie de session !
      });
      if (!response.ok) {
        // Gérer le cas où l'utilisateur n'est pas connecté
        setIsLoading(false);
        return;
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
    fetchSessions();
  }, []);

  // --- Gestion des clics ---
  const handleSetAvailability = async (sessionId: string, status: AvailabilityStatus) => {
    // On met à jour l'affichage immédiatement pour une meilleure réactivité (Optimistic Update)
    setSessions(currentSessions =>
      currentSessions.map(s => 
        s.id === sessionId ? { ...s, availabilities: [{ status }] } : s
      )
    );

    // Puis on envoie la vraie requête à l'API
    await fetch(`http://localhost:3000/api/sessions/${sessionId}/availabilities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Route protégée !
      body: JSON.stringify({ status }),
    });

    // On pourrait rafraîchir les données ici avec fetchSessions() pour être sûr,
    // mais l'update optimiste suffit souvent pour l'expérience utilisateur.
  };

  // --- Rendu ---
  if (isLoading) return <div className="p-8 text-white">Chargement du calendrier...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Mes Présences</h1>
      <div className="space-y-6">
        {sessions.map((session) => {
          // On récupère le statut actuel de l'utilisateur pour cette session
          const currentUserStatus = session.availabilities[0]?.status;

          return (
            <div key={session.id} className="p-6 bg-gray-800 rounded-lg">
              <h2 className="text-xl font-bold text-white mb-2">
                Session du {formatDate(session.startTime)}
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <p className="text-gray-300 flex-grow">
                  Indiquez votre présence pour cette session :
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSetAvailability(session.id, 'PRESENT')}
                    className={`px-4 py-2 rounded transition-colors ${
                      currentUserStatus === 'PRESENT'
                        ? 'bg-green-500 text-white font-bold'
                        : 'bg-gray-600 hover:bg-green-700'
                    }`}
                  >
                    ✅ Présent
                  </button>
                  <button
                    onClick={() => handleSetAvailability(session.id, 'ABSENT')}
                    className={`px-4 py-2 rounded transition-colors ${
                      currentUserStatus === 'ABSENT'
                        ? 'bg-red-500 text-white font-bold'
                        : 'bg-gray-600 hover:bg-red-700'
                    }`}
                  >
                    ❌ Absent
                  </button>
                  <button
                    onClick={() => handleSetAvailability(session.id, 'MAYBE')}
                    className={`px-4 py-2 rounded transition-colors ${
                      currentUserStatus === 'MAYBE'
                        ? 'bg-yellow-500 text-white font-bold'
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
      </div>
    </div>
  );
}