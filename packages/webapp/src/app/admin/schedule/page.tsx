'use client';

import { useState, useEffect, FormEvent } from 'react';

// --- Interfaces pour typer nos données (mises à jour) ---
interface Provider {
  id: string;
  name: string;
}
interface Competition {
  id: string;
  name: string;
  provider: Provider;
}
interface Match {
  id: string;
  opponent: string;
  round: string | null;
  matchDate: string | null;
  competition: Competition;
}
interface Session {
  id: string;
  startTime: string;
  endTime: string;
  matches: Match[]; // Chaque session contient maintenant ses matchs
}

// --- Fonctions utilitaires ---
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

// --- Le Composant Principal ---
export default function SchedulePage() {
  // --- États du composant ---
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // États pour la modale
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [unassignedMatches, setUnassignedMatches] = useState<Match[]>([]);
  const [matchToAssignId, setMatchToAssignId] = useState('');
  const [kickoffTime, setKickoffTime] = useState(''); // Nouvel état pour l'heure du match

  // --- Fonctions ---
  const fetchSessions = async () => {
    setIsLoading(true);
    const response = await fetch('http://localhost:3000/api/sessions');
    const data = await response.json();
    setSessions(data);
    setIsLoading(false);
  };
  
  const fetchUnassignedMatches = async () => {
    const response = await fetch('http://localhost:3000/api/matches?unassigned=true');
    const data = await response.json();
    setUnassignedMatches(data);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const openModal = (session: Session) => {
    setSelectedSession(session);
    fetchUnassignedMatches();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // ... reste du code de la modale ...
  };

  const handleAssignMatch = async (event: FormEvent) => {
    event.preventDefault();
    if (!matchToAssignId || !selectedSession || !kickoffTime) {
      alert("Veuillez choisir un match et définir une heure de coup d'envoi.");
      return;
    }

    // On combine la date de la session avec l'heure choisie
    const sessionDate = selectedSession.startTime.split('T')[0];
    const matchDateTime = new Date(`${sessionDate}T${kickoffTime}:00`).toISOString();

    // On envoie la mise à jour avec l'ID de la session ET la nouvelle date du match
    await fetch(`http://localhost:3000/api/matches/${matchToAssignId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        sessionId: selectedSession.id,
        matchDate: matchDateTime,
      }),
    });
    
    fetchSessions(); // On rafraîchit TOUT pour voir les changements
    closeModal();
  };

  // --- Rendu JSX ---
  if (isLoading) return <div className="p-8 text-white">Chargement...</div>;

  return (
    <div className="p-8">
      {/* ... Votre formulaire de création de session ici ... */}
      <h1 className="text-2xl font-bold mb-6 text-white">Gestion des Sessions</h1>
      
      <div>
        <h2 className="text-xl font-semibold mb-4 text-white">Sessions Planifiées</h2>
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="p-4 bg-gray-800 text-white border border-gray-700 rounded shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="font-bold text-lg">Session du {formatDate(session.startTime)}</h3>
                  <p className="text-sm text-gray-400">De {formatTime(session.startTime)} à {formatTime(session.endTime)}</p>
                </div>
                <button onClick={() => openModal(session)} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                  Planifier un match
                </button>
              </div>
              {/* On affiche la liste des matchs de la session */}
              <div className="border-t border-gray-700 pt-3 space-y-2">
                {session.matches.length > 0 ? (
                  session.matches.map(match => (
                    <div key={match.id} className="flex items-center gap-4 text-sm">
                      <span className="font-semibold text-blue-400">{formatTime(match.matchDate!)}</span>
                      <span className="text-gray-300">{match.competition.provider.name} - {match.competition.name}</span>
                      <span>{match.round || ''} vs {match.opponent}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">Aucun match planifié pour cette session.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* La Modale de Planification (améliorée) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4 text-white">Planifier un match</h2>
            <form onSubmit={handleAssignMatch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Match à planifier</label>
                <select
                  value={matchToAssignId} onChange={(e) => setMatchToAssignId(e.target.value)}
                  className="p-2 w-full border border-gray-600 bg-gray-700 text-white rounded" required
                >
                  <option value="" disabled>-- Choisir un match --</option>
                  {unassignedMatches.map((match) => (
                    <option key={match.id} value={match.id}>
                      {match.competition.provider.name} - {match.competition.name} - {match.round || 'N/A'} vs {match.opponent}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Heure du coup d'envoi</label>
                <input
                  type="time" value={kickoffTime} onChange={(e) => setKickoffTime(e.target.value)}
                  className="p-2 w-full border border-gray-600 bg-gray-700 rounded" required
                />
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Ajouter à la session</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}