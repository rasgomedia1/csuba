import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import content from '../content.json';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userPlan, setUserPlan] = useState<'free' | 'donor'>('free');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.register(email, username, password, userPlan);

      // Auto-login after registration
      const loginResponse = await authAPI.login(email, password);
      login(loginResponse.data.token, loginResponse.data.user);
      navigate('/search');
    } catch (err: any) {
      setError(err.response?.data?.error || content.register.errorFallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-blue-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">{content.register.title}</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {content.register.emailLabel}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder={content.register.emailPlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {content.register.usernameLabel}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder={content.register.usernamePlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {content.register.passwordLabel}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder={content.register.passwordPlaceholder}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? content.common.hidePassword : content.common.showPassword}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-brand-600"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">{content.register.planLabel}</p>
            <div className="space-y-2">
              <label
                className={`flex items-center gap-3 px-4 py-3 border rounded cursor-pointer transition-colors ${
                  userPlan === 'free' ? 'border-brand-500 bg-brand-50' : 'border-gray-300'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    userPlan === 'free' ? 'border-brand-600' : 'border-gray-400'
                  }`}
                >
                  {userPlan === 'free' && <span className="w-2.5 h-2.5 rounded-full bg-brand-600" />}
                </span>
                <input
                  type="radio"
                  name="userPlan"
                  value="free"
                  checked={userPlan === 'free'}
                  onChange={() => setUserPlan('free')}
                  className="sr-only"
                />
                <span>
                  <span className="block font-semibold text-gray-800">{content.register.planFreeTitle}</span>
                  <span className="block text-sm text-gray-500">{content.register.planFreeDescription}</span>
                </span>
              </label>

              <label
                className={`flex items-center gap-3 px-4 py-3 border rounded cursor-pointer transition-colors ${
                  userPlan === 'donor' ? 'border-accent-500 bg-emerald-50' : 'border-gray-300'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    userPlan === 'donor' ? 'border-accent-600' : 'border-gray-400'
                  }`}
                >
                  {userPlan === 'donor' && <span className="w-2.5 h-2.5 rounded-full bg-accent-600" />}
                </span>
                <input
                  type="radio"
                  name="userPlan"
                  value="donor"
                  checked={userPlan === 'donor'}
                  onChange={() => setUserPlan('donor')}
                  className="sr-only"
                />
                <span>
                  <span className="block font-semibold text-gray-800">{content.register.planDonorTitle}</span>
                  <span className="block text-sm text-gray-500">{content.register.planDonorDescription}</span>
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-brand-600 text-white rounded font-semibold hover:bg-brand-700 disabled:bg-gray-400"
          >
            {loading ? content.register.submitting : content.register.submit}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-700">
          {content.register.haveAccount}{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700">
            {content.register.loginLink}
          </Link>
        </p>
      </div>
    </div>
  );
};
