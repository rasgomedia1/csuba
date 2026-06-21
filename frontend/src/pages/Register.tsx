import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [investmentMin, setInvestmentMin] = useState('');
  const [investmentMax, setInvestmentMax] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.register(
        email,
        username,
        password,
        investmentMin ? Number(investmentMin) : undefined,
        investmentMax ? Number(investmentMax) : undefined
      );

      // Auto-login after registration
      const loginResponse = await authAPI.login(email, password);
      login(loginResponse.data.token, loginResponse.data.user);
      navigate('/search');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-blue-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">Crear Cuenta</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="tu_usuario"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="••••••••"
            />
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-3">💰 Rango de inversión (opcional):</p>
            <div className="flex gap-2">
              <input
                type="number"
                value={investmentMin}
                onChange={(e) => setInvestmentMin(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Mín (€)"
              />
              <input
                type="number"
                value={investmentMax}
                onChange={(e) => setInvestmentMax(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Máx (€)"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-brand-600 text-white rounded font-semibold hover:bg-brand-700 disabled:bg-gray-400"
          >
            {loading ? '⏳ Registrando...' : 'Crear Cuenta'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-700">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};
