import React, { useState, useEffect } from 'react';

export interface FilterState {
  province?: string;
  propertyType?: string;
  priceMax?: number;
  areaMin?: number;
  auctionStatus?: string;
  occupancyStatus?: string;
  investmentScore?: string;
  minimumBidMax?: number;
  search?: string;
  sortBy: 'price' | 'date' | 'investmentScore' | 'pricePerM2';
}

interface SearchFiltersProps {
  onFilter: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

const provinces = [
  'Madrid', 'Barcelona',
  'Albacete', 'Alicante', 'Almería', 'Ávila', 'Badajoz', 'Baleares', 'Bilbao',
  'Burgos', 'Cáceres', 'Cádiz', 'Cantabria', 'Castellón', 'Ceuta', 'Ciudad Real',
  'Córdoba', 'A Coruña', 'Cuenca', 'Girona', 'Granada', 'Guadalajara', 'Guipúzcoa',
  'Huelva', 'Huesca', 'Jaén', 'León', 'Lleida', 'Lugo', 'Málaga', 'Melilla', 'Murcia',
  'Navarra', 'Ourense', 'Palencia', 'Palma', 'Pontevedra', 'La Rioja', 'Salamanca',
  'Segovia', 'Sevilla', 'Soria', 'Tarragona', 'Teruel', 'Toledo', 'Valencia',
  'Valladolid', 'Vizcaya', 'Zamora', 'Zaragoza'
];

const propertyTypes = ['Vivienda', 'Local', 'Garaje', 'Terreno', 'Otro'];
const auctionStatuses = ['active', 'completed', 'deserted'];
const occupancyStatuses = ['empty', 'occupied', 'unknown'];
const investmentScores = ['BAJO', 'MEDIO', 'ALTO', 'MUY_ALTO'];

export const SearchFilters: React.FC<SearchFiltersProps> = ({ onFilter, initialFilters }) => {
  const defaultFilters: FilterState = {
    province: 'Castellón',
    areaMin: 8,
    investmentScore: 'MUY_ALTO',
    minimumBidMax: 2000,
    sortBy: 'pricePerM2'
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters || defaultFilters);

  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleReset = () => {
    const defaultFilters = { province: 'Castellón', areaMin: 8, investmentScore: 'MUY_ALTO', minimumBidMax: 2000, sortBy: 'date' };
    setFilters(defaultFilters);
    onFilter(defaultFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Search
        </label>
        <input
          type="text"
          placeholder="Search by location, address or description..."
          value={filters.search || ''}
          onChange={(e) => {
            handleFilterChange('search', e.target.value || undefined);
            onFilter({ ...filters, search: e.target.value || undefined });
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Max Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Max Price (€)
            </label>
            <input
              type="number"
              placeholder="Ex: 500000"
              value={filters.priceMax || ''}
              onChange={(e) => handleFilterChange('priceMax', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Min Area */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Min Area (m2)
            </label>
            <input
              type="number"
              value={filters.areaMin || ''}
              onChange={(e) => handleFilterChange('areaMin', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Province */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Province
            </label>
            <select
              value={filters.province || ''}
              onChange={(e) => handleFilterChange('province', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Provinces</option>
              {provinces.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Property Type
            </label>
            <select
              value={filters.propertyType || ''}
              onChange={(e) => handleFilterChange('propertyType', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Types</option>
              {propertyTypes.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Occupancy */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Occupancy
            </label>
            <select
              value={filters.occupancyStatus || ''}
              onChange={(e) => handleFilterChange('occupancyStatus', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All</option>
              <option value="empty">Empty</option>
              <option value="occupied">Occupied</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>

          {/* Investment Score */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Investment Score
            </label>
            <select
              value={filters.investmentScore || ''}
              onChange={(e) => handleFilterChange('investmentScore', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Scores</option>
              {investmentScores.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="date">Date</option>
              <option value="price">Price</option>
              <option value="pricePerM2">Price per m2</option>
              <option value="investmentScore">Score</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-brand-600 text-white rounded font-semibold hover:bg-brand-700"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded font-semibold hover:bg-gray-300"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};
