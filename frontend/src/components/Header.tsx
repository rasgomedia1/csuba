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
      <div className="max-w-7xl mx-auto px-3 py-2 flex flex-wrap justify-between items-center gap-x-3 gap-y-1">
        <Link to="/" className="text-xl font-bold text-brand-600 shrink-0">
          CSUBA
        </Link>

        <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <Link to="/search" className="text-gray-700 hover:text-brand-600 whitespace-nowrap">
            Search
          </Link>

          <Link to="/watchlist" className="text-gray-700 hover:text-brand-600 whitespace-nowrap" title="Favorites">
            ❤️ Favorites
          </Link>

          {user ? (
            <>
              <Link to="/profile" className="text-gray-700 hover:text-brand-600 whitespace-nowrap">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 whitespace-nowrap"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-1.5 bg-brand-600 text-white rounded hover:bg-brand-700 whitespace-nowrap"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 border border-brand-600 text-brand-600 rounded hover:bg-brand-50 whitespace-nowrap"
              >
                Create Account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
