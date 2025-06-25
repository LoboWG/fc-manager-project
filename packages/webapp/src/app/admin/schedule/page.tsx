// Fichier : webapp/src/app/admin/schedule/page.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';

// On garde nos types
interface Match {
  id: string;
  opponent: string;
  round: string | null;
}

interface Session {
  id: string;
  startTime: string;
  endTime: string;
  matches: Match[];
}

export default function SchedulePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  // États pour notre nouveau formulaire
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Fonction pour récupérer les sessions (ne change pas)
  const fetchSessions = async () => {
    const response = await fetch('http://localhost:3000/api/sessions');
    const data = await response.json();
    setSessions(data);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Nouvelle fonction pour la soumission du formulaire
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!startTime || !endTime) return;

    await fetch('http://localhost:3000/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // On s'assure que les dates sont au format ISO attendu par le backend
      body: JSON.stringify({
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      }),
    });

    fetchSessions(); // On rafraîchit la liste
    setStartTime(''); // On vide les champs
    setEndTime('');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-white">Gestion des Sessions</h1>

      {/* Formulaire de création de session */}
      <div className="mb-8 p-6 bg-gray-800 text-white rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Créer une nouvelle session</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end" suppressHydrationWarning={true}>
          <div>
            <label htmlFor="start-time" className="block text-sm font-medium text-gray-300 mb-1">
              Début de la session
            </label>
            <input
              id="start-time"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="p-2 w-full border border-gray-600 bg-gray-700 rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="end-time" className="block text-sm font-medium text-gray-300 mb-1">
              Fin de la session
            </label>
            <input
              id="end-time"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="p-2 w-full border border-gray-600 bg-gray-700 rounded"
              required
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 h-10">
            Créer la session
          </button>
        </form>
      </div>

      {/* Liste des sessions (on la rend cliquable) */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-white">Sessions Planifiées</h2>
        <div className="space-y-4">
          {sessions.map((session) => (
            // Chaque session est maintenant un lien vers sa page de détail
            <Link href={`/admin/schedule/${session.id}`} key={session.id} className='block'>
              <div className="block p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
                <h3 className="font-bold text-lg">
                  Session du {new Date(session.startTime).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <p className="text-sm text-gray-300">
                  De {new Date(session.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} à {new Date(session.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}