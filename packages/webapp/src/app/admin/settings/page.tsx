// Fichier : webapp/src/app/admin/settings/page.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';

// On définit le type de nos "Organisateurs"
interface Provider {
  id: string;
  name: string;
}

export default function SettingsPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [name, setName] = useState(''); // Pour le champ du formulaire
  const [isLoading, setIsLoading] = useState(true);

  // Fonction pour récupérer la liste des organisateurs
  const fetchProviders = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/competition-providers');
      const data = await response.json();
      setProviders(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des organisateurs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // On lance la récupération au chargement de la page
  useEffect(() => {
    fetchProviders();
  }, []);

  // Fonction pour la soumission du formulaire de création
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name) return;

    await fetch('http://localhost:3000/api/competition-providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    fetchProviders(); // On rafraîchit la liste
    setName(''); // On vide le champ du formulaire
  };

  if (isLoading) {
    return <div className="p-8 text-white">Chargement...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-white">Paramètres</h1>

      {/* Formulaire de création d'organisateur */}
      <div className="mb-8 p-6 bg-gray-800 text-white rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Gérer les Organisateurs</h2>
        <form onSubmit={handleSubmit} className="flex items-end gap-4">
          <div className="flex-1">
            <label htmlFor="provider-name" className="block text-sm font-medium text-gray-300 mb-1">
              Nom de l'organisateur
            </label>
            <input
              id="provider-name"
              type="text"
              placeholder="ex: Eproleague"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-2 w-full border border-gray-600 bg-gray-700 rounded placeholder:text-gray-400"
              required
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 h-10">
            Créer l'organisateur
          </button>
        </form>
      </div>

      {/* Liste des organisateurs existants */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-white">Organisateurs existants</h2>
        <ul className="space-y-2">
          {providers.map((provider) => (
            <li key={provider.id} className="p-3 bg-gray-700 border border-gray-600 rounded shadow-sm">
              {provider.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}