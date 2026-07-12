import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import content from '../content.json';

export const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-blue-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img src="/favicon.png" alt={content.app.iconAlt} className="w-20 h-20 md:w-24 md:h-24 rounded-2xl shadow-md" />
            <h1 className="text-5xl font-bold text-gray-900">
              {content.home.title}
            </h1>
          </div>
          <p className="text-xl text-gray-700 mb-8">
            {content.home.subtitle}
          </p>

          {!user ? (
            <div className="flex gap-4 justify-center">
              <Link
                to="/login"
                className="px-8 py-4 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 text-lg"
              >
                {content.home.signIn}
              </Link>
              <Link
                to="/register"
                className="px-8 py-4 border-2 border-brand-600 text-brand-600 rounded-lg font-semibold hover:bg-brand-50 text-lg"
              >
                {content.home.createAccount}
              </Link>
            </div>
          ) : (
            <Link
              to="/search"
              className="inline-block px-8 py-4 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 text-lg"
            >
              {content.home.searchAuctions}
            </Link>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-bold mb-2">{content.home.features.search.title}</h3>
            <p className="text-gray-600">
              {content.home.features.search.description}
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-bold mb-2">{content.home.features.score.title}</h3>
            <p className="text-gray-600">
              {content.home.features.score.description}
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-bold mb-2">{content.home.features.tracking.title}</h3>
            <p className="text-gray-600">
              {content.home.features.tracking.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
