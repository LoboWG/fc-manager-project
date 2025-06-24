'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';

// Interfaces pour typer nos données
interface CompetitionProvider {
  id: string;
  name: string;
}

interface Competition {
  id: string;
  name: string;
  format: string;
  season: string;
  provider: CompetitionProvider; // On inclut le provider pour l'affichage
}

export default function CompetitionsPage() {
  // --- GESTION DES ÉTATS (STATE) ---
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [providers, setProviders] = useState<CompetitionProvider[]>([]);

  // États pour les champs du formulaire
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [competitionName, setCompetitionName] = useState(''); // Pour "Ligue 1" ou "Coupe de France"
  const [season, setSeason] = useState('');
  
  const [isLoading, setIsLoading] = useState(true); // Pour savoir quand les données chargent

  // --- RÉCUPÉRATION DES DONNÉES (FETCHING) ---
  const fetchInitialData = async () => {
    setIsLoading(true);
    // On lance les 2 requêtes en parallèle pour plus d'efficacité
    const [competitionsRes, providersRes] = await Promise.all([
      fetch('http://localhost:3000/api/competitions'),
      fetch('http://localhost:3000/api/competition-providers'),
    ]);
    
    const competitionsData = await competitionsRes.json();
    const providersData = await providersRes.json();
    
    setCompetitions(competitionsData);
    setProviders(providersData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // --- GESTION DU FORMULAIRE ---
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedProviderId || !selectedFormat) {
      alert('Veuillez sélectionner un fournisseur et un format.');
      return;
    }

    const newCompetitionData = {
      providerId: selectedProviderId,
      format: selectedFormat,
      name: competitionName,
      season: season,
    };

    await fetch('http://localhost:3000/api/competitions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCompetitionData),
    });

    // On rafraîchit les données et on vide le formulaire
    fetchInitialData();
    setSelectedProviderId('');
    setSelectedFormat('');
    setCompetitionName('');
    setSeason('');
  };

  // --- AFFICHAGE (JSX) ---
  if (isLoading) {
    return <div className="p-8">Chargement...</div>;
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-white">Gestion des Compétitions</h1>

      <div className="mb-8 p-6 bg-gray-800 text-white rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Créer une nouvelle compétition</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Menu déroulant pour les Fournisseurs */}
            <select
              value={selectedProviderId}
              onChange={(e) => setSelectedProviderId(e.target.value)}
              className="p-2 border border-gray-600 bg-gray-700 rounded"
              required
            >
              <option value="" disabled>-- Choisir un fournisseur --</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>

            {/* Menu déroulant pour le Format */}
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="p-2 border border-gray-600 bg-gray-700 rounded"
              required
            >
              <option value="" disabled>-- Choisir un format --</option>
              <option value="LIGUE">Ligue</option>
              <option value="COUPE">Coupe</option>
            </select>
            
            {/* Champ conditionnel pour le nom de la ligue/division */}
            {selectedFormat === 'LIGUE' && (
              <input
                type="text"
                placeholder="Nom de la Division (ex: Ligue 1)"
                value={competitionName}
                onChange={(e) => setCompetitionName(e.target.value)}
                className="p-2 border border-gray-600 bg-gray-700 rounded placeholder:text-gray-400"
                required
              />
            )}

            {/* Champ conditionnel pour le nom de la coupe */}
            {selectedFormat === 'COUPE' && (
              <input
                type="text"
                placeholder="Nom de la Coupe (ex: Coupe de France)"
                value={competitionName}
                onChange={(e) => setCompetitionName(e.target.value)}
                className="p-2 border border-gray-600 bg-gray-700 rounded placeholder:text-gray-400"
                required
              />
            )}

            <input
              type="text"
              placeholder="Saison (ex: Saison 1)"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="p-2 border border-gray-600 bg-gray-700 rounded placeholder:text-gray-400"
              required
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Créer la compétition
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-white">Compétitions existantes</h2>
        <ul className="space-y-2">
          {competitions.map((comp) => (
            <Link href={`/admin/competitions/${comp.id}`} key={comp.id}>
              <li className="p-3 bg-gray-800 text-white border border-gray-700 rounded shadow-sm hover:bg-gray-700 cursor-pointer">
                <span className="font-bold">{comp.provider.name}</span> - {comp.name} ({comp.format}), {comp.season}
              </li>
            </Link>
          ))}
        </ul>
      </div>
    </div>
  );
}