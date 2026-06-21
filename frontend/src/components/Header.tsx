import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-brand-600">
          🏛️ SubastaHub
        </Link>

        <nav className="flex gap-6 items-center">
          <Link to="/search" className="text-gray-700 hover:text-brand-600">
            Buscar
          </Link>

          {user ? (
            <>
              <Link to="/watchlist" className="text-gray-700 hover:text-brand-600">
                Mi Lista ({user.email})
              </Link>
              <Link to="/profile" className="text-gray-700 hover:text-brand-600">
                Perfil
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 border border-brand-600 text-brand-600 rounded hover:bg-brand-50"
              >
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
