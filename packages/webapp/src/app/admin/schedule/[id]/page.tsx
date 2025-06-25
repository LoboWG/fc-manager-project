'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams } from 'next/navigation';
import { DndContext, useDraggable, useDroppable, DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// --- Interfaces ---
interface User { id: string; username: string; }
interface Provider { name: string; }
interface Competition { id: string; name: string; provider: Provider; }
interface Match { id: string; opponent: string; round: string | null; matchDate: string | null; competition?: Competition; }
interface Availability { status: string; user: User; }
interface LineupPlayer { id: string; position: string; status: string; userId: string; user: User; }
interface Session { id: string; startTime: string; endTime: string; matches: Match[]; availabilities: Availability[]; lineup: LineupPlayer[]; }

// --- Fonctions Utilitaires ---
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const formatTime = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

// --- Composant Principal ---
export default function PlanSessionPage() {
  const params = useParams();
  const sessionId = params.id as string;

  // --- États ---
  const [session, setSession] = useState<Session | null>(null);
  const [unassignedMatches, setUnassignedMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [matchToAssignId, setMatchToAssignId] = useState('');
  const [kickoffTime, setKickoffTime] = useState('');
  const [friendlyOpponent, setFriendlyOpponent] = useState('');
  const [friendlyKickoffTime, setFriendlyKickoffTime] = useState('');

  const [lineup, setLineup] = useState<{ [key: string]: User | null }>({});
  
  // --- Fonctions ---
  const fetchData = async () => {
    if (!sessionId) return;
    setIsLoading(true);
    const [sessionRes, unassignedMatchesRes] = await Promise.all([
      fetch(`http://localhost:3000/api/sessions/${sessionId}`, { credentials: 'include' }),
      fetch(`http://localhost:3000/api/matches?unassigned=true`, { credentials: 'include' }),
    ]);

    if(sessionRes.ok && unassignedMatchesRes.ok) {
      const sessionData: Session = await sessionRes.json();
      const unassignedMatchesData = await unassignedMatchesRes.json();
      
      setSession(sessionData);
      setUnassignedMatches(unassignedMatchesData);

      const initialLineup: { [key: string]: User | null } = {};
      sessionData.lineup.forEach(p => {
        if(p.user) initialLineup[p.position] = p.user;
      });
      setLineup(initialLineup);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, [sessionId]);

  const handleAssignMatch = async (event: FormEvent) => {
    event.preventDefault();
    if (!matchToAssignId || !kickoffTime || !session) return;
    const sessionDate = session.startTime.split('T')[0];
    const matchDateTime = new Date(`${sessionDate}T${kickoffTime}:00`).toISOString();
    await fetch(`http://localhost:3000/api/matches/${matchToAssignId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: session.id, matchDate: matchDateTime }), credentials: 'include' });
    fetchData();
    setMatchToAssignId('');
    setKickoffTime('');
  };

  const handleFriendlySubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!friendlyOpponent || !friendlyKickoffTime || !session) return;
    const sessionDate = session.startTime.split('T')[0];
    const matchDateTime = new Date(`${sessionDate}T${friendlyKickoffTime}:00`).toISOString();
    await fetch('http://localhost:3000/api/matches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ opponent: friendlyOpponent, round: "Amical", matchDate: matchDateTime, sessionId: session.id }), credentials: 'include' });
    fetchData();
    setFriendlyOpponent('');
    setFriendlyKickoffTime('');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    if (over) {
      const position = over.id as string;
      const playerId = active.id as string;
      const player = presentPlayers.find(p => p.id === playerId);
      if (player) {
        let updatedLineup = { ...lineup };
        Object.keys(updatedLineup).forEach(pos => {
          if (updatedLineup[pos]?.id === playerId) {
            updatedLineup[pos] = null;
          }
        });
        updatedLineup[position] = player;
        setLineup(updatedLineup);
      }
    }
  };

  const handleSaveLineup = async () => {
    if (!session) return;
    const lineupPayload = Object.keys(lineup).filter(position => lineup[position] !== null).map(position => ({ userId: lineup[position]!.id, position: position, status: 'TITULAIRE' }));
    await fetch(`http://localhost:3000/api/sessions/${session.id}/lineup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lineup: lineupPayload }), credentials: 'include' });
    alert('Composition sauvegardée !');
    fetchData();
  };

  const presentPlayers = session?.availabilities.filter(a => a.status === 'PRESENT').map(a => a.user) || [];
  const availablePlayers = presentPlayers.filter(p => !Object.values(lineup).some(lineupPlayer => lineupPlayer?.id === p.id));
  const formation = ['G', 'DD', 'DCG', 'DCD', 'DG', 'MDG', 'MDD', 'MOC', 'AG', 'AD', 'BU'];

  if (isLoading) return <div className="p-8 text-white">Chargement...</div>;
  if (!session) return <div className="p-8 text-white">Session non trouvée.</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white">Planification de la Session</h1>
      <h2 className="text-xl text-blue-400 mb-6">{formatDate(session.startTime)}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 bg-gray-800 text-white rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Ajouter un match de compétition</h3>
          <form onSubmit={handleAssignMatch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Match non planifié</label>
              <select value={matchToAssignId} onChange={(e) => setMatchToAssignId(e.target.value)} className="p-2 w-full border border-gray-600 bg-gray-700 rounded" required>
                <option value="" disabled>-- Choisir une fixture --</option>
                {unassignedMatches.map((match) => (
                  <option key={match.id} value={match.id}>
                    {match.competition ? `${match.competition.provider.name} | ${match.competition.name}` : 'Amical'} | {match.round || 'N/A'} vs {match.opponent}
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
        <div className="p-6 bg-gray-800 text-white rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Ajouter un match amical</h3>
          <form onSubmit={handleFriendlySubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Adversaire</label>
              <input type="text" value={friendlyOpponent} onChange={(e) => setFriendlyOpponent(e.target.value)} className="p-2 w-full border border-gray-600 bg-gray-700 rounded placeholder:text-gray-400" required/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Heure du coup d'envoi</label>
              <input type="time" value={friendlyKickoffTime} onChange={(e) => setFriendlyKickoffTime(e.target.value)} className="p-2 w-full border border-gray-600 bg-gray-700 rounded" required/>
            </div>
            <button type="submit" className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Planifier le match amical</button>
          </form>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 text-white">Matchs planifiés pour cette session</h3>
        <div className="space-y-2">
          {session.matches.map((match) => (
            <div key={match.id} className="p-3 bg-gray-700 rounded flex items-center gap-4">
              <span className="font-bold text-lg text-blue-300">{formatTime(match.matchDate)}</span>
              <div>
                <p className="font-semibold">{match.round || 'Match'} vs {match.opponent}</p>
                <p className="text-sm text-gray-400">{match.competition ? `${match.competition.provider.name} - ${match.competition.name}` : 'Amical'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="my-8 border-gray-700" />

      <DndContext onDragEnd={handleDragEnd}>
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Composition d'Équipe</h2>
            <button onClick={handleSaveLineup} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Sauvegarder la Composition</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 p-4 bg-gray-800 rounded-lg h-fit">
              <h3 className="font-semibold mb-3 text-white">Joueurs Présents ({availablePlayers.length})</h3>
              <div className="space-y-2">
                {availablePlayers.map(player => (<DraggablePlayer key={player.id} id={player.id} name={player.username} />))}
              </div>
            </div>
            <div className="md:col-span-3 p-4 bg-green-900/30 rounded-lg min-h-[500px] grid grid-cols-3 grid-rows-4 gap-4 place-content-around">
              {formation.map(position => (<DroppablePosition key={position} id={position} player={lineup[position] || null} />))}
            </div>
          </div>
        </div>
      </DndContext>
    </div>
  );
}

// --- Sous-Composants pour le Drag and Drop ---
function DraggablePlayer({ id, name }: { id: string, name: string }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="p-2 bg-gray-700 text-white rounded cursor-grab touch-none">
      {name}
    </div>
  );
}

function DroppablePosition({ id, player }: { id: string, player: User | null }) {
  const { isOver, setNodeRef } = useDroppable({ id: id });
  return (
    <div ref={setNodeRef} className={`border-2 border-dashed rounded-lg flex items-center justify-center p-2 text-white font-bold h-16
      ${isOver ? 'border-white bg-white/30' : 'border-white/20'}
      ${player ? 'bg-blue-600 border-solid' : ''}`}>
      {player ? player.username : id}
    </div>
  );
}