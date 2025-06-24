'use client';

import { useState, useEffect } from 'react';

// On définit des types simples pour nos données
interface Match {
  id: string;
  opponent: string;
  round: string | null;
  competition: { name: string };
}

interface Session {
  id: string;
  startTime: string;
  matches: Match[];
}

export default function ClubDashboardPage() {
  const [nextSession, setNextSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On récupère les sessions pour trouver la prochaine
    const fetchNextSession = async () => {
      const response = await fetch('http://localhost:3000/api/sessions');
      const sessions: Session[] = await response.json();

      // Logique très simple pour trouver la prochaine session
      if (sessions.length > 0) {
        setNextSession(sessions[0]);
      }
      setIsLoading(false);
    };

    fetchNextSession();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-white">Chargement du portail...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Portail du Club</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Colonne de gauche : Prochaine Session */}
        <div className="md:col-span-2 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Prochaine Session</h2>
          {nextSession ? (
            <div>
              <p className="text-lg text-blue-400 font-bold">
                {new Date(nextSession.startTime).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <p className="text-gray-300">
                Début à {new Date(nextSession.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <div className="mt-4 border-t border-gray-700 pt-4">
                <h4 className="font-bold mb-2">Matchs prévus :</h4>
                {nextSession.matches.length > 0 ? (
                   nextSession.matches.map(match => (
                     <p key={match.id} className="text-gray-400">{match.round || ''} vs {match.opponent}</p>
                   ))
                ) : (
                  <p className="text-gray-500 italic">Aucun match assigné pour le moment.</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Aucune session planifiée.</p>
          )}
        </div>

        {/* Colonne de droite : à venir */}
        <div className="p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Classement</h2>
          <p className="text-gray-500 italic">(À venir)</p>
        </div>
      </div>
    </div>
  );
}