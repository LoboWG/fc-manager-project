'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams } from 'next/navigation';

// --- Interfaces (mise à jour pour la compétition optionnelle) ---
interface Provider { name: string; }
interface Competition { id: string; name: string; provider: Provider; }
interface Match {
  id: string;
  opponent: string;
  round: string | null;
  matchDate: string | null;
  competition?: Competition; // Le '?' indique que la compétition peut ne pas exister
}
interface Session {
  id: string;
  startTime: string;
  endTime: string;
  matches: Match[];
}

// --- Fonctions utilitaires ---
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const formatTime = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

// --- Le Composant Principal ---
export default function PlanSessionPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [unassignedMatches, setUnassignedMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [matchToAssignId, setMatchToAssignId] = useState('');
  const [kickoffTime, setKickoffTime] = useState('');
  const [friendlyOpponent, setFriendlyOpponent] = useState('');
  const [friendlyKickoffTime, setFriendlyKickoffTime] = useState('');

  const fetchData = async () => {
    if (!sessionId) return;
    setIsLoading(true);
    const [sessionRes, unassignedMatchesRes] = await Promise.all([
      fetch(`http://localhost:3000/api/sessions/${sessionId}`),
      fetch(`http://localhost:3000/api/matches?unassigned=true`),
    ]);
    const sessionData = await sessionRes.json();
    const unassignedMatchesData = await unassignedMatchesRes.json();
    setSession(sessionData);
    setUnassignedMatches(unassignedMatchesData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [sessionId]);

  const handleAssignMatch = async (event: FormEvent) => {
    event.preventDefault();
    if (!matchToAssignId || !kickoffTime || !session) {
      alert("Veuillez choisir un match et une heure de coup d'envoi.");
      return;
    }
    const sessionDate = session.startTime.split('T')[0];
    const matchDateTime = new Date(`${sessionDate}T${kickoffTime}:00`).toISOString();

    await fetch(`http://localhost:3000/api/matches/${matchToAssignId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session.id, matchDate: matchDateTime }),
    });

    fetchData();
    setMatchToAssignId('');
    setKickoffTime('');
  };

  const handleFriendlySubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!friendlyOpponent || !friendlyKickoffTime || !session) return;
    const sessionDate = session.startTime.split('T')[0];
    const matchDateTime = new Date(`${sessionDate}T${friendlyKickoffTime}:00`).toISOString();

    await fetch('http://localhost:3000/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        opponent: friendlyOpponent,
        round: "Amical",
        matchDate: matchDateTime,
        sessionId: session.id,
      }),
    });
    fetchData();
    setFriendlyOpponent('');
    setFriendlyKickoffTime('');
  };

  if (isLoading) return <div className="p-8 text-white">Chargement...</div>;
  if (!session) return <div className="p-8 text-white">Session non trouvée.</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white">Planification de la Session</h1>
      <h2 className="text-xl text-blue-400 mb-6">{formatDate(session.startTime)}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulaire pour les matchs de compétition */}
        <div className="p-6 bg-gray-800 text-white rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Ajouter un match de compétition</h3>
          <form onSubmit={handleAssignMatch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Match non planifié</label>
              <select value={matchToAssignId} onChange={(e) => setMatchToAssignId(e.target.value)} className="p-2 w-full border border-gray-600 bg-gray-700 rounded" required>
                <option value="" disabled>-- Choisir une fixture --</option>
                {unassignedMatches.map((match) => (
                  <option key={match.id} value={match.id}>
                    {/* On gère ici le cas où la compétition n'existe pas */}
                    {match.competition ? `${match.competition.provider.name} | ${match.competition.name}` : 'Match Amical'} | {match.round || 'N/A'} vs {match.opponent}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Heure du coup d'envoi</label>
              <input type="time" value={kickoffTime} onChange={(e) => setKickoffTime(e.target.value)} className="p-2 w-full border border-gray-600 bg-gray-700 rounded" required />
            </div>
            <button type="submit" className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Planifier ce match</button>
          </form>
        </div>
        
        {/* Formulaire pour les matchs amicaux */}
        <div className="p-6 bg-gray-800 text-white rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Ajouter un match amical</h3>
          <form onSubmit={handleFriendlySubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Adversaire</label>
              <input type="text" value={friendlyOpponent} onChange={(e) => setFriendlyOpponent(e.target.value)}
                className="p-2 w-full border border-gray-600 bg-gray-700 rounded placeholder:text-gray-400" required/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Heure du coup d'envoi</label>
              <input type="time" value={friendlyKickoffTime} onChange={(e) => setFriendlyKickoffTime(e.target.value)}
                className="p-2 w-full border border-gray-600 bg-gray-700 rounded" required/>
            </div>
            <button type="submit" className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
              Planifier le match amical
            </button>
          </form>
        </div>
      </div>

      {/* Liste des matchs planifiés */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 text-white">Matchs planifiés pour cette session</h3>
        <div className="space-y-2">
          {session.matches.length > 0 ? (
            session.matches.map((match) => (
              <div key={match.id} className="p-3 bg-gray-700 rounded flex items-center gap-4">
                <span className="font-bold text-lg text-blue-300">{formatTime(match.matchDate)}</span>
                <div>
                  <p className="font-semibold">{match.round || 'Match'} vs {match.opponent}</p>
                  <p className="text-sm text-gray-400">
                    {/* On gère ici le cas où la compétition n'existe pas */}
                    {match.competition ? `${match.competition.provider.name} - ${match.competition.name}` : 'Amical'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">Aucun match planifié pour cette session.</p>
          )}
        </div>
      </div>
    </div>
  );
}