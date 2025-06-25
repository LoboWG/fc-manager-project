// Fichier : webapp/src/app/admin/teams/page.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';

// On définit le type pour une Équipe
interface Team {
  id: string;
  name: string;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [name, setName] = useState(''); // Pour le champ du formulaire
  const [isLoading, setIsLoading] = useState(true);

  // Fonction pour récupérer la liste des équipes
  const fetchTeams = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/teams', { credentials: 'include' });
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des équipes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // On lance la récupération au chargement de la page
  useEffect(() => {
    fetchTeams();
  }, []);

  // Fonction pour la soumission du formulaire de création
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name) return;

    await fetch('http://localhost:3000/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name }),
    });

    fetchTeams(); // On rafraîchit la liste
    setName(''); // On vide le champ du formulaire
  };

  if (isLoading) {
    return <div className="p-8 text-white">Chargement...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-white">Gestion des Équipes</h1>

      {/* Formulaire de création d'équipe */}
      <div className="mb-8 p-6 bg-gray-800 text-white rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Ajouter une équipe au répertoire</h2>
        <form onSubmit={handleSubmit} className="flex items-end gap-4">
          <div className="flex-1">
            <label htmlFor="team-name" className="block text-sm font-medium text-gray-300 mb-1">
              Nom de l'équipe
            </label>
            <input
              id="team-name"
              type="text"
              placeholder="ex: Paris Saint-Germain"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-2 w-full border border-gray-600 bg-gray-700 rounded placeholder:text-gray-400"
              required
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 h-10">
            Ajouter l'équipe
          </button>
        </form>
      </div>

      {/* Liste des équipes existantes */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-white">Répertoire des équipes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <div key={team.id} className="p-3 bg-gray-700 border border-gray-600 rounded shadow-sm">
              {team.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}