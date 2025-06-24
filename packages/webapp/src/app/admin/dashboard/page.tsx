import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-white">Tableau de Bord Manager</h1>
      <p className="text-gray-300 mb-8">
        Bienvenue sur votre espace de gestion. Choisissez une action ci-dessous pour commencer.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Carte pour les Compétitions */}
        <Link href="/admin/competitions">
          <div className="p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 cursor-pointer transition-colors">
            <h2 className="text-xl font-bold text-white mb-2">Compétitions</h2>
            <p className="text-gray-400">Gérer les organisateurs et les compétitions (ligues, coupes...).</p>
          </div>
        </Link>
        
        {/* Carte pour le Calendrier */}
        <Link href="/admin/schedule">
          <div className="p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 cursor-pointer transition-colors">
            <h2 className="text-xl font-bold text-white mb-2">Calendrier & Sessions</h2>
            <p className="text-gray-400">Créer des sessions de jeu et planifier vos matchs.</p>
          </div>
        </Link>
        
        {/* Carte future pour les Joueurs */}
        <div className="p-6 bg-gray-800 rounded-lg shadow-lg opacity-50">
          <h2 className="text-xl font-bold text-white mb-2">Joueurs</h2>
          <p className="text-gray-400">Gérer les membres de votre équipe (à venir).</p>
        </div>
      </div>
    </div>
  );
}