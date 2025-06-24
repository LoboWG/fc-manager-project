'use client';

// MODIFICATION 1: On importe le hook "use" depuis React
import { useState, useEffect, FormEvent, use } from 'react';

// ... les interfaces ne changent pas ...
interface Competition {
  id: string;
  name: string;
  provider: { name: string };
}
interface Match {
  id: string;
  opponent: string;
  round: string | null;
}

// MODIFICATION 2: On change le type de "params" pour indiquer que c'est une promesse
export default function CompetitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  
  // MODIFICATION 3: On "déballe" la promesse avec le hook use()
  const resolvedParams = use(params);
  const competitionId = resolvedParams.id; // On récupère l'ID depuis l'objet résolu

  const [competition, setCompetition] = useState<Competition | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Le reste du code ne change pas
  const [opponent, setOpponent] = useState('');
  const [round, setRound] = useState('');

  const fetchData = async () => {
    const [compRes, matchesRes] = await Promise.all([
      fetch(`http://localhost:3000/api/competitions/${competitionId}`),
      fetch(`http://localhost:3000/api/matches?competitionId=${competitionId}`),
    ]);

    const compData = await compRes.json();
    const matchesData = await matchesRes.json();

    setCompetition(compData);
    setMatches(matchesData);
    setIsLoading(false);
  };

  useEffect(() => {
    if (competitionId) {
      fetchData();
    }
  }, [competitionId]);

  const handleMatchSubmit = async (event: FormEvent) => {
    event.preventDefault();
    // On doit aussi utiliser competitionId ici, qui est maintenant correctement défini
    const newMatchData = { opponent, round, competitionId };

    await fetch('http://localhost:3000/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMatchData),
    });

    fetchData();
    setOpponent('');
    setRound('');
  };

  if (isLoading) return <div className="p-8">Chargement de la compétition...</div>;
  if (!competition) return <div className="p-8">Compétition non trouvée.</div>;

  // Le JSX de retour ne change pas du tout
  return (
    <div className="p-8">
      {/* ... tout le reste du code JSX est identique ... */}
      <h1 className="text-2xl font-bold text-white">
        {competition.provider.name} - {competition.name}
      </h1>
      <p className="text-lg text-gray-400 mb-6">Gestion des matchs</p>

      <div className="mb-8 p-6 bg-gray-800 text-white rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Ajouter une nouvelle fixture</h2>
        <form onSubmit={handleMatchSubmit} className="flex items-end gap-4">
          <div className="flex-1">
            <label htmlFor="round" className="block text-sm font-medium text-gray-300 mb-1">Tour / Journée</label>
            <input
              id="round" type="text" placeholder="ex: Journée 1"
              value={round} onChange={(e) => setRound(e.target.value)}
              className="p-2 w-full border border-gray-600 bg-gray-700 rounded placeholder:text-gray-400"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="opponent" className="block text-sm font-medium text-gray-300 mb-1">Adversaire</label>
            <input
              id="opponent" type="text" placeholder="Nom de l'équipe adverse"
              value={opponent} onChange={(e) => setOpponent(e.target.value)}
              className="p-2 w-full border border-gray-600 bg-gray-700 rounded placeholder:text-gray-400"
              required
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 h-10">
            Ajouter le match
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-white">Fixtures de la compétition</h2>
        <div className="space-y-2">
          {matches.map((match) => (
            <div key={match.id} className="p-3 bg-gray-800 text-white border border-gray-700 rounded shadow-sm">
              <span className="font-medium">{match.round || 'N/A'}</span> vs <span className="font-bold">{match.opponent}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}