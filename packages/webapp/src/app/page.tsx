import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white pt-20">
      {/* Section Héros */}
      <section className="text-center py-20 px-6">
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4">
          Votre Équipe. Mieux Organisée.
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
          La plateforme tout-en-un pour gérer les présences, planifier les matchs, suivre les statistiques et centraliser la communication de votre club Pro.
        </p>
        <a
          href="http://localhost:3000/api/auth/discord"
          className="inline-block px-10 py-4 text-lg font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
        >
          Se connecter via Discord
        </a>
      </section>

      {/* Section Fonctionnalités */}
      <section className="w-full max-w-6xl mx-auto py-20 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-gray-800 rounded-lg">
            <h3 className="text-2xl font-bold mb-2">Planification Simplifiée</h3>
            <p className="text-gray-400">
              Gérez les sessions de jeu et les présences de vos joueurs en quelques clics, avec des rappels automatiques via le bot Discord.
            </p>
          </div>
          <div className="p-6 bg-gray-800 rounded-lg">
            <h3 className="text-2xl font-bold mb-2">Suivi de Performances</h3>
            <p className="text-gray-400">
              Saisissez les statistiques de chaque match et suivez les classements des meilleurs buteurs, passeurs et joueurs de votre équipe.
            </p>
          </div>
          <div className="p-6 bg-gray-800 rounded-lg">
            <h3 className="text-2xl font-bold mb-2">Hub Centralisé</h3>
            <p className="text-gray-400">
              Toutes les informations (calendrier, résultats, classements) sont regroupées au même endroit et synchronisées avec votre serveur Discord.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}