import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-blue-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            CSUBA
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            The complete platform to discover and manage auctions in Spain
          </p>

          {!user ? (
            <div className="flex gap-4 justify-center">
              <Link
                to="/login"
                className="px-8 py-4 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 text-lg"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-8 py-4 border-2 border-brand-600 text-brand-600 rounded-lg font-semibold hover:bg-brand-50 text-lg"
              >
                Create Account
              </Link>
            </div>
          ) : (
            <Link
              to="/search"
              className="inline-block px-8 py-4 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 text-lg"
            >
              Search Auctions
            </Link>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition">
            <div className="text-4xl mb-4">Search</div>
            <h3 className="text-xl font-bold mb-2">Advanced Search</h3>
            <p className="text-gray-600">
              Filter by price, location, property type and conditions. Find exactly what you need.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition">
            <div className="text-4xl mb-4">Score</div>
            <h3 className="text-xl font-bold mb-2">Investment Score</h3>
            <p className="text-gray-600">
              Automatic analysis of occupancy, legal charges and market factors for each property.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition">
            <div className="text-4xl mb-4">Heart</div>
            <h3 className="text-xl font-bold mb-2">Personal Tracking</h3>
            <p className="text-gray-600">
              Save your favorite properties and get alerts on important changes in real time.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 bg-white rounded-lg shadow p-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-brand-600">+50K</div>
              <p className="text-gray-600">Auctions Available</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-brand-600">+50</div>
              <p className="text-gray-600">Provinces</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-brand-600">24/7</div>
              <p className="text-gray-600">Active Monitoring</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-brand-600">100%</div>
              <p className="text-gray-600">Free</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
