// Fichier : src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// On définit les types pour l'utilisateur et le contexte
interface User {
  id: string;
  discordId: string;
  username: string;
  avatar: string | null;
  role: 'PLAYER' | 'CO_MANAGER' | 'MANAGER';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

// On crée le contexte avec des valeurs par défaut
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

// On crée un "Provider" qui va englober notre application
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Au chargement de l'app, on essaie de récupérer l'utilisateur
    const fetchUser = async () => {
      try {
        // On appelle notre nouvel endpoint /api/auth/me
        const response = await fetch('http://localhost:3000/api/auth/me', {
          credentials: 'include', // Important pour envoyer les cookies de session
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// On crée un "hook" personnalisé pour utiliser facilement notre contexte
export const useAuth = () => useContext(AuthContext);