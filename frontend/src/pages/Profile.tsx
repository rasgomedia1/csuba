import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usersAPI } from '../services/api';
import content from '../content.json';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  investment_min?: number;
  investment_max?: number;
  province_preferences?: string[];
  property_type_preferences?: string[];
}

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [investmentMin, setInvestmentMin] = useState('');
  const [investmentMax, setInvestmentMax] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await usersAPI.getProfile();
      setProfile(response.data);
      setInvestmentMin(response.data.investment_min || '');
      setInvestmentMax(response.data.investment_max || '');
    } catch (err: any) {
      setError(err.response?.data?.error || content.profile.loadError);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    try {
      await usersAPI.updatePreferences(
        investmentMin ? Number(investmentMin) : undefined,
        investmentMax ? Number(investmentMax) : undefined
      );

      setSuccess(content.profile.saveSuccess);
      loadProfile();
      setEditMode(false);
    } catch (err: any) {
      setError(err.response?.data?.error || content.profile.saveError);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin text-2xl">⏳</div>
          <p className="mt-4 text-gray-600">{content.profile.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{content.profile.title}</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-8 space-y-8">
        {/* Account Info */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">{content.profile.accountInfo}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">{content.profile.emailLabel}</label>
              <p className="text-lg font-semibold">{profile?.email}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">{content.profile.usernameLabel}</label>
              <p className="text-lg font-semibold">{profile?.username}</p>
            </div>
          </div>
        </div>

        {/* Investment Preferences */}
        <div className="border-t pt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">{content.profile.investmentRange}</h2>
            <button
              onClick={() => setEditMode(!editMode)}
              className="px-4 py-2 border border-brand-600 text-brand-600 rounded hover:bg-brand-50"
            >
              {editMode ? content.profile.cancel : content.profile.edit}
            </button>
          </div>

          {editMode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {content.profile.investmentMinLabel}
                </label>
                <input
                  type="number"
                  value={investmentMin}
                  onChange={(e) => setInvestmentMin(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder={content.profile.investmentMinPlaceholder}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {content.profile.investmentMaxLabel}
                </label>
                <input
                  type="number"
                  value={investmentMax}
                  onChange={(e) => setInvestmentMax(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder={content.profile.investmentMaxPlaceholder}
                />
              </div>
              <button
                onClick={handleSave}
                className="w-full px-6 py-3 bg-brand-600 text-white rounded font-semibold hover:bg-brand-700"
              >
                {content.profile.saveChanges}
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-lg">
              <p>
                <span className="text-gray-600">{content.profile.minLabel}</span>{' '}
                <span className="font-semibold">
                  {profile?.investment_min ? `€${profile.investment_min.toLocaleString('es-ES')}` : content.profile.notSet}
                </span>
              </p>
              <p>
                <span className="text-gray-600">{content.profile.maxLabel}</span>{' '}
                <span className="font-semibold">
                  {profile?.investment_max ? `€${profile.investment_max.toLocaleString('es-ES')}` : content.profile.unlimited}
                </span>
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
