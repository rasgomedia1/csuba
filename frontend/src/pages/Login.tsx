import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { PasswordInput } from '../components/PasswordInput';
import content from '../content.json';

export const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('expired') === '1';
  // Only allow in-app relative paths as the post-login destination.
  const nextParam = searchParams.get('next');
  const next = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/search';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(identifier.trim(), password);
      login(response.data.token, response.data.user);
      navigate(next, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || content.login.errorFallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] py-8 px-4 bg-gradient-to-br from-brand-50 to-blue-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">{content.login.title}</h1>

        {sessionExpired && !error && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-6">
            {content.login.sessionExpired}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {content.login.emailLabel}
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder={content.login.emailPlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {content.login.passwordLabel}
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder={content.login.passwordPlaceholder}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-brand-600 text-white rounded font-semibold hover:bg-brand-700 disabled:bg-gray-400"
          >
            {loading ? content.login.submitting : content.login.submit}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-700">
          {content.login.noAccount}{' '}
          <Link to="/register" className="text-brand-600 font-semibold hover:text-brand-700">
            {content.login.registerLink}
          </Link>
        </p>
      </div>
    </div>
  );
};
