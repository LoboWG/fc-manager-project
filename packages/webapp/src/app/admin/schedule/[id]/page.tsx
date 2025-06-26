'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useParams } from 'next/navigation';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useMemo } from 'react'; // Assurez-vous que useMemo est importé

// --- Interfaces complètes ---
interface User { id: string; username: string; }
interface Provider { name: string; }
interface Competition { id: string; name: string; provider: Provider; }
interface Team { id: string; name: string; }
interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  round: string | null;
  matchDate: string | null;
  competition?: Competition;
  isOurMatch: boolean;
}
interface Availability { status: string; user: User; }
interface LineupPlayer { id: string; position: string; status: string; user: User; }
interface Session {
  id: string;
  startTime: string;
  endTime: string;
  matches: Match[];
  availabilities: Availability[];
  lineup: LineupPlayer[];
}

// --- Fonctions Utilitaires ---
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const formatTime = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

// --- Sous-Composants pour le Drag and Drop ---
function DraggablePlayer({ id, name }: { id: string; name: string }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 10, touchAction: 'none' } : {touchAction: 'none'};
  return (<div ref={setNodeRef} style={style} {...listeners} {...attributes} className="p-2 bg-gray-700 text-white rounded cursor-grab">{name}</div>);
}

function DroppablePosition({ id, player }: { id: string; player: User | null }) {
  const { isOver, setNodeRef } = useDroppable({ id: id });
  return (<div ref={setNodeRef} className={`border-2 border-dashed rounded-lg flex items-center justify-center p-2 text-white font-bold h-16 transition-colors ${isOver ? 'border-white bg-white/30' : 'border-white/20'} ${player ? 'bg-blue-600 border-solid' : ''}`}>{player ? player.username : id}</div>);
}

// --- Le Composant Principal ---
export default function PlanSessionPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [unassignedMatches, setUnassignedMatches] = useState<Match[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lineup, setLineup] = useState<{ [key: string]: User | null }>({});
  
  const [matchToAssignId, setMatchToAssignId] = useState('');
  const [kickoffTime, setKickoffTime] = useState('');
  const [friendlyOpponentName, setFriendlyOpponentName] = useState('');
  const [friendlyKickoffTime, setFriendlyKickoffTime] = useState('');
  const [isOurTeamHome, setIsOurTeamHome] = useState(true);

  const fetchData = async () => {
    if (!sessionId) return;
    setIsLoading(true);
    try {
      const [sessionRes, unassignedMatchesRes, allTeamsRes] = await Promise.all([
        fetch(`http://localhost:3000/api/sessions/${sessionId}`, { credentials: 'include' }),
        fetch(`http://localhost:3000/api/matches?unassigned=true`, { credentials: 'include' }),
        fetch(`http://localhost:3000/api/teams`, { credentials: 'include' }),
      ]);
      if (!sessionRes.ok || !unassignedMatchesRes.ok || !allTeamsRes.ok) {
        throw new Error('Une des requêtes API a échoué');
      }
      const sessionData: Session = await sessionRes.json();
      const unassignedMatchesData = await unassignedMatchesRes.json();
      const allTeamsData = await allTeamsRes.json();
      
      setSession(sessionData);
      setUnassignedMatches(unassignedMatchesData);
      setAllTeams(allTeamsData);

      const initialLineup: { [key: string]: User | null } = {};
      if (sessionData.lineup) {
        sessionData.lineup.forEach(p => {
          if (p.user) initialLineup[p.position] = p.user;
        });
      }
      setLineup(initialLineup);
    } catch (error) {
      console.error("Erreur détaillée lors du chargement:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [sessionId]);

  const handleAssignMatch = async (event: FormEvent) => {
    event.preventDefault();
    if (!matchToAssignId || !kickoffTime || !session) {
      alert("Veuillez choisir un match et une heure.");
      return;
    }
    const sessionDate = session.startTime.split('T')[0];
    const matchDateTime = new Date(`${sessionDate}T${kickoffTime}:00`).toISOString();
    await fetch(`http://localhost:3000/api/matches/${matchToAssignId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: session.id, matchDate: matchDateTime }), credentials: 'include' });
    fetchData();
    setMatchToAssignId('');
    setKickoffTime('');
  };

  const handleFriendlySubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!friendlyOpponentName || !friendlyKickoffTime || !session) return;
    const sessionDate = session.startTime.split('T')[0];
    const matchDateTime = new Date(`${sessionDate}T${friendlyKickoffTime}:00`).toISOString();
    const friendlyMatchData = {
      opponentName: friendlyOpponentName,
      isOurTeamHome: isOurTeamHome,
      matchDate: matchDateTime,
      sessionId: session.id,
    };
    try {
      const response = await fetch('http://localhost:3000/api/matches/friendly', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(friendlyMatchData) });
      if (!response.ok) throw new Error("La création du match amical a échoué.");
      fetchData();
      setFriendlyOpponentName('');
      setFriendlyKickoffTime('');
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la création du match amical.");
    }
  };

  const handleSaveLineup = async () => {
    if (!session) return;
    const lineupPayload = Object.keys(lineup).filter(p => lineup[p]).map(p => ({ userId: lineup[p]!.id, position: p, status: 'TITULAIRE' }));
    await fetch(`http://localhost:3000/api/sessions/${session.id}/lineup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lineup: lineupPayload }), credentials: 'include' });
    alert('Composition sauvegardée !');
    fetchData();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    if (over) {
      const position = over.id as string;
      const playerId = active.id as string;
      const player = presentPlayers.find(p => p.id === playerId);
      if (player) {
        let updatedLineup = { ...lineup };
        Object.keys(updatedLineup).forEach(pos => { if (updatedLineup[pos]?.id === playerId) updatedLineup[pos] = null; });
        updatedLineup[position] = player;
        setLineup(updatedLineup);
      }
    }
  };

  const presentPlayers = session?.availabilities.filter(a => a.status === 'PRESENT').map(a => a.user) || [];
  const availablePlayers = presentPlayers.filter(p => !Object.values(lineup).some(lp => lp?.id === p.id));
  const formation = ['G', 'DG', 'DCG', 'DCD', 'DD', 'MDG', 'MDD', 'MOC', 'AG', 'AD', 'BU'];
  
  const groupedUnassignedMatches = useMemo(() => {
    return unassignedMatches.reduce((acc, match) => {
      const compName = match.competition 
        ? `${match.competition.provider.name} - ${match.competition.name}`
        : 'Amicaux';
      if (!acc[compName]) acc[compName] = [];
      acc[compName].push(match);
      return acc;
    }, {} as Record<string, Match[]>);
  }, [unassignedMatches]);

  if (isLoading) return <div className="p-8 text-white">Chargement...</div>;
  if (!session) return <div className="p-8 text-white">Session non trouvée.</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white">Planification de la Session</h1>
      <h2 className="text-xl text-blue-400 mb-6">{formatDate(session.startTime)}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="p-6 bg-gray-800 text-white rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Ajouter un match de compétition</h3>
          <form onSubmit={handleAssignMatch} className="space-y-4">
            <div>
              <label htmlFor="match-select" className="block text-sm font-medium text-gray-300 mb-1">Match non planifié (Nos matchs)</label>
              <select id="match-select" value={matchToAssignId} onChange={(e) => setMatchToAssignId(e.target.value)} className="p-2 w-full border border-gray-600 bg-gray-700 rounded" required>
                <option value="" disabled>-- Choisir une fixture --</option>
                {Object.entries(groupedUnassignedMatches).map(([compName, matchesInComp]) => (
                  <optgroup label={compName} key={compName}>
                    {matchesInComp.map((match) => (
                      <option key={match.id} value={match.id}>
                        {`${match.round || 'N/A'}: ${match.homeTeam.name} vs ${match.awayTeam.name}`}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="kickoff-time-comp" className="block text-sm font-medium text-gray-300 mb-1">Heure du coup d'envoi</label>
              <input id="kickoff-time-comp" type="time" value={kickoffTime} onChange={(e) => setKickoffTime(e.target.value)} className="p-2 w-full border border-gray-600 bg-gray-700 rounded" required />
            </div>
            <button type="submit" className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Planifier ce match</button>
          </form>
        </div>
        <div className="p-6 bg-gray-800 text-white rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Ajouter un match amical</h3>
          <form onSubmit={handleFriendlySubmit} className="space-y-4">
            <div>
              <label htmlFor="friendly-opponent" className="block text-sm font-medium text-gray-300 mb-1">Adversaire</label>
              <input id="friendly-opponent" type="text" list="teams-list" value={friendlyOpponentName} onChange={(e) => setFriendlyOpponentName(e.target.value)}
                className="p-2 w-full border border-gray-600 bg-gray-700 rounded placeholder:text-gray-400" required/>
              <datalist id="teams-list">
                {allTeams.map(team => (<option key={team.id} value={team.name} />))}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Lieu</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center"><input type="radio" checked={isOurTeamHome} onChange={() => setIsOurTeamHome(true)} name="location" className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-500" /> <span className="ml-2">Domicile</span></label>
                <label className="flex items-center"><input type="radio" checked={!isOurTeamHome} onChange={() => setIsOurTeamHome(false)} name="location" className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-500" /> <span className="ml-2">Extérieur</span></label>
              </div>
            </div>
            <div>
              <label htmlFor="kickoff-time-friendly" className="block text-sm font-medium text-gray-300 mb-1">Heure du coup d'envoi</label>
              <input id="kickoff-time-friendly" type="time" value={friendlyKickoffTime} onChange={(e) => setFriendlyKickoffTime(e.target.value)} className="p-2 w-full border border-gray-600 bg-gray-700 rounded" required/>
            </div>
            <button type="submit" className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Planifier le match amical</button>
          </form>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 text-white">Matchs planifiés pour cette session</h3>
        <div className="space-y-2">
          {session.matches.length > 0 ? (
            session.matches.map((match) => (
              <div key={match.id} className="p-3 bg-gray-700 rounded flex items-center gap-4">
                <span className="font-bold text-lg text-blue-300">{formatTime(match.matchDate)}</span>
                <div>
                  <p className="font-semibold">{`${match.round || 'Match'}: ${match.homeTeam.name} vs ${match.awayTeam.name}`}</p>
                  <p className="text-sm text-gray-400">{match.competition ? `${match.competition.provider.name} - ${match.competition.name}` : 'Amical'}</p>
                </div>
              </div>
            ))
          ) : (<p className="text-gray-500 italic">Aucun match planifié pour cette session.</p>)}
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