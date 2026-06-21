import React, { useState } from 'react';

export interface FilterState {
  province?: string;
  propertyType?: string;
  priceMin?: number;
  priceMax?: number;
  auctionStatus?: string;
  occupancyStatus?: string;
  maxRiskScore?: number;
  sortBy: 'price' | 'riskScore' | 'date';
}

interface SearchFiltersProps {
  onFilter: (filters: FilterState) => void;
}

const provinces = [
  'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao',
  'Alicante', 'Córdoba', 'Málaga', 'Murcia', 'Palma',
  'Granada', 'Almería', 'Badajoz', 'Salamanca', 'Valladolid',
  'Zaragoza', 'Santander', 'A Coruña', 'León', 'Vigo'
];

const propertyTypes = ['Vivienda', 'Local', 'Garaje', 'Terreno', 'Otro'];
const auctionStatuses = ['active', 'completed', 'deserted'];
const occupancyStatuses = ['empty', 'occupied', 'unknown'];

export const SearchFilters: React.FC<SearchFiltersProps> = ({ onFilter }) => {
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'date'
  });

  const [expandFilters, setExpandFilters] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleReset = () => {
    setFilters({ sortBy: 'date' });
    onFilter({ sortBy: 'date' });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <button
        type="button"
        onClick={() => setExpandFilters(!expandFilters)}
        className="text-lg font-semibold text-gray-900 flex items-center gap-2 cursor-pointer w-full"
      >
        <span>{expandFilters ? '▼' : '▶'} Filtros de Búsqueda</span>
      </button>

      {expandFilters && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Rango de precio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                💰 Rango de Inversión
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceMin || ''}
                  onChange={(e) => handleFilterChange('priceMin', e.target.value ? Number(e.target.value) : undefined)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceMax || ''}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value ? Number(e.target.value) : undefined)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Provincia */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📍 Provincia
              </label>
              <select
                value={filters.province || ''}
                onChange={(e) => handleFilterChange('province', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Cualquier provincia</option>
                {provinces.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de propiedad */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🏠 Tipo de Bien
              </label>
              <select
                value={filters.propertyType || ''}
                onChange={(e) => handleFilterChange('propertyType', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Cualquier tipo</option>
                {propertyTypes.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado de subasta */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📋 Estado
              </label>
              <select
                value={filters.auctionStatus || ''}
                onChange={(e) => handleFilterChange('auctionStatus', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Cualquier estado</option>
                <option value="active">Activa</option>
                <option value="completed">Completada</option>
                <option value="deserted">Desierta</option>
              </select>
            </div>

            {/* Ocupación */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                👥 Ocupación
              </label>
              <select
                value={filters.occupancyStatus || ''}
                onChange={(e) => handleFilterChange('occupancyStatus', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Cualquier estado</option>
                <option value="empty">Vacía</option>
                <option value="occupied">Ocupada</option>
                <option value="unknown">Desconocido</option>
              </select>
            </div>

            {/* Riesgo máximo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ⚠️ Riesgo Máximo
              </label>
              <select
                value={filters.maxRiskScore || ''}
                onChange={(e) => handleFilterChange('maxRiskScore', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Sin límite</option>
                <option value="20">Bajo (0-20)</option>
                <option value="40">Moderado (0-40)</option>
                <option value="60">Medio (0-60)</option>
                <option value="100">Alto (0-100)</option>
              </select>
            </div>
          </div>

          {/* Ordenar */}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🔀 Ordenar por
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="date"
                  checked={filters.sortBy === 'date'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value as any)}
                />
                Fecha
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="price"
                  checked={filters.sortBy === 'price'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value as any)}
                />
                Precio
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="riskScore"
                  checked={filters.sortBy === 'riskScore'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value as any)}
                />
                Riesgo
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-brand-600 text-white rounded font-semibold hover:bg-brand-700"
            >
              🔍 Buscar
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-3 border border-gray-300 rounded hover:bg-gray-50"
            >
              Limpiar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
