'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useParams } from 'next/navigation';

// --- Interfaces pour nos types de données ---
interface Provider { name: string; }
interface Team { id: string; name: string; }
interface Competition {
  id: string;
  name: string;
  provider: Provider;
  teams: Team[];
}
interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  round: string | null;
  isOurMatch: boolean;
}
// Type pour les champs de notre générateur de journée
type FixtureInput = {
  homeTeamId: string;
  awayTeamId: string;
  isOurMatch: boolean;
};

// --- Le Composant Principal ---
export default function CompetitionDetailPage() {
  const params = useParams();
  const competitionId = params.id as string;

  // --- États du composant ---
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // État pour la sélection des équipes de la compétition
  const [selectedTeamIds, setSelectedTeamIds] = useState<Record<string, boolean>>({});

  // États pour le nouveau générateur de journée
  const [roundName, setRoundName] = useState('');
  const [fixtureInputs, setFixtureInputs] = useState<FixtureInput[]>([]);

  // --- Fonctions de récupération de données ---
  const fetchData = async () => {
    if (!competitionId) return;
    setIsLoading(true);

    const [compRes, matchesRes, teamsRes] = await Promise.all([
      fetch(`http://localhost:3000/api/competitions/${competitionId}`, { credentials: 'include' }),
      fetch(`http://localhost:3000/api/matches?competitionId=${competitionId}`, { credentials: 'include' }),
      fetch(`http://localhost:3000/api/teams`, { credentials: 'include' }),
    ]);

    const compData: Competition = await compRes.json();
    const matchesData = await matchesRes.json();
    const teamsData = await teamsRes.json();
    
    setCompetition(compData);
    setMatches(matchesData);
    setAllTeams(teamsData);

    const initialSelectedIds: Record<string, boolean> = {};
    teamsData.forEach((team: Team) => {
      initialSelectedIds[team.id] = compData.teams.some(compTeam => compTeam.id === team.id);
    });
    setSelectedTeamIds(initialSelectedIds);
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [competitionId]);

  // --- Fonctions de gestion des événements ---
  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setSelectedTeamIds(prev => ({ ...prev, [name]: checked }));
  };

  const handleTeamSelectionSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const selectedIds = Object.keys(selectedTeamIds).filter(id => selectedTeamIds[id]);
    await fetch(`http://localhost:3000/api/competitions/${competitionId}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ teamIds: selectedIds }),
    });
    alert('Équipes de la compétition mises à jour !');
    fetchData();
  };

  const handleGenerateFixtures = () => {
    const teamCount = competition?.teams?.length || 0;
    if (teamCount < 2) {
      alert("Veuillez d'abord lier au moins 2 équipes à cette compétition.");
      return;
    }
    const numberOfMatches = Math.floor(teamCount / 2);
    const emptyFixtures: FixtureInput[] = Array.from({ length: numberOfMatches }, () => ({
      homeTeamId: '',
      awayTeamId: '',
      isOurMatch: false,
    }));
    setFixtureInputs(emptyFixtures);
  };

  const handleFixtureInputChange = (index: number, field: keyof FixtureInput, value: string | boolean) => {
    const updatedFixtures = [...fixtureInputs];
    (updatedFixtures[index] as any)[field] = value;
    setFixtureInputs(updatedFixtures);
  };

  const handleMatchdaySubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!roundName || fixtureInputs.some(f => !f.homeTeamId || !f.awayTeamId)) {
      alert('Veuillez remplir le nom de la journée et toutes les paires de matchs.');
      return;
    }
    
    const fixturesToCreate = fixtureInputs.map(fixture => ({
      ...fixture,
      round: roundName,
      competitionId: competitionId,
    }));

    await fetch('http://localhost:3000/api/matches/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ fixtures: fixturesToCreate }),
    });

    fetchData();
    setRoundName('');
    setFixtureInputs([]);
  };

  if (isLoading) return <div className="p-8 text-white">Chargement...</div>;
  if (!competition) return <div className="p-8 text-white">Compétition non trouvée.</div>;

  const participatingTeams = competition.teams;

  // --- Rendu ---
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white">{competition.provider.name} - {competition.name}</h1>
      <p className="text-lg text-gray-400 mb-6">Gestion des équipes et des matchs</p>
      
      {/* Section pour sélectionner les équipes de la compétition */}
      <div className="mb-8 p-6 bg-gray-800 text-white rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Équipes participant à la compétition</h2>
        <form onSubmit={handleTeamSelectionSubmit}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {allTeams.map(team => (
              <div key={team.id} className="flex items-center">
                <input type="checkbox" id={`team-${team.id}`} name={team.id}
                  checked={!!selectedTeamIds[team.id]} onChange={handleCheckboxChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor={`team-${team.id}`} className="ml-3 text-sm text-gray-200">{team.name}</label>
              </div>
            ))}
          </div>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Sauvegarder la sélection</button>
        </form>
      </div>

      <hr className="my-8 border-gray-700" />

      {/* Le nouveau générateur de journée */}
      <div className="mb-8 p-6 bg-gray-800 text-white rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Générateur de Journée</h2>
        <div className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-300 mb-1">Nom de la Journée / du Tour</label>
              <input type="text" placeholder="ex: Journée 1" value={roundName} onChange={(e) => setRoundName(e.target.value)}
                className="p-2 w-full border border-gray-600 bg-gray-700 rounded placeholder:text-gray-400" />
            </div>
            <button onClick={handleGenerateFixtures} type="button" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 h-10">
              Générer les matchs
            </button>
          </div>

          {fixtureInputs.length > 0 && (
            <form onSubmit={handleMatchdaySubmit} className="space-y-3 pt-4 border-t border-gray-700">
              {fixtureInputs.map((fixture, index) => (
                <div key={index} className="grid grid-cols-11 gap-2 items-center">
                  <select value={fixture.homeTeamId} onChange={(e) => handleFixtureInputChange(index, 'homeTeamId', e.target.value)} className="col-span-4 p-2 w-full border border-gray-600 bg-gray-700 rounded" required>
                    <option value="">-- Domicile --</option>
                    {participatingTeams.map(team => (<option key={team.id} value={team.id}>{team.name}</option>))}
                  </select>
                  <span className="col-span-1 text-center text-gray-400">vs</span>
                  <select value={fixture.awayTeamId} onChange={(e) => handleFixtureInputChange(index, 'awayTeamId', e.target.value)} className="col-span-4 p-2 w-full border border-gray-600 bg-gray-700 rounded" required>
                    <option value="">-- Extérieur --</option>
                    {participatingTeams.map(team => (<option key={team.id} value={team.id}>{team.name}</option>))}
                  </select>
                  <div className="col-span-2 flex items-center justify-center">
                    <input id={`isOurMatch-${index}`} type="checkbox" checked={fixture.isOurMatch} onChange={(e) => handleFixtureInputChange(index, 'isOurMatch', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor={`isOurMatch-${index}`} className="ml-2 text-sm text-gray-300">Notre match</label>
                  </div>
                </div>
              ))}
              <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Sauvegarder la journée
              </button>
            </form>
          )}
        </div>
      </div>

      <hr className="my-8 border-gray-700" />

      {/* La liste des fixtures existantes */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-white">Fixtures de la compétition</h2>
        <div className="space-y-2">
          {matches.map((match) => (
            <div key={match.id} className={`p-3 rounded flex items-center gap-4 ${match.isOurMatch ? 'bg-blue-900/50 border border-blue-500' : 'bg-gray-700'}`}>
              <span className="font-mono text-gray-400 w-24">{match.round || 'N/A'}</span>
              <div className="flex-1 text-right font-bold">{match.homeTeam.name}</div>
              <span className="text-lg font-light text-gray-400">vs</span>
              <div className="flex-1 font-bold">{match.awayTeam.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}