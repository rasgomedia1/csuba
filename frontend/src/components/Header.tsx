import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import content from '../content.json';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-3 py-2 flex flex-wrap justify-between items-center gap-x-3 gap-y-1">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-brand-600 shrink-0">
          <img src="/favicon.png" alt={content.app.iconAlt} className="w-8 h-8 rounded-md" />
          {content.app.name}
        </Link>

        <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <Link to="/search" className="text-gray-700 hover:text-brand-600 whitespace-nowrap">
            {content.header.search}
          </Link>

          <Link to="/watchlist" className="text-gray-700 hover:text-brand-600 whitespace-nowrap" title={content.common.favoritesTitle}>
            {content.header.favorites}
          </Link>

          {user ? (
            <>
              <Link to="/profile" className="text-gray-700 hover:text-brand-600 whitespace-nowrap">
                {content.header.profile}
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 whitespace-nowrap"
              >
                {content.header.signOut}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-1.5 bg-brand-600 text-white rounded hover:bg-brand-700 whitespace-nowrap"
              >
                {content.header.signIn}
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 border border-brand-600 text-brand-600 rounded hover:bg-brand-50 whitespace-nowrap"
              >
                {content.header.createAccount}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
