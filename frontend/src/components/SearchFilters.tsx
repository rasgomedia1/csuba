import React, { useState } from 'react';

export interface FilterState {
  province?: string;
  propertyType?: string;
  priceMax?: number;
  areaMin?: number;
  auctionStatus?: string;
  occupancyStatus?: string;
  investmentScore?: string;
  search?: string;
  sortBy: 'price' | 'riskScore' | 'date' | 'investmentScore';
}

interface SearchFiltersProps {
  onFilter: (filters: FilterState) => void;
}

const provinces = [
  'Madrid', 'Barcelona',
  'Albacete', 'Alicante', 'Almeria', 'Avila', 'Badajoz', 'Baleares', 'Bilbao',
  'Burgos', 'Caceres', 'Cadiz', 'Cantabria', 'Castellon', 'Ceuta', 'Ciudad Real',
  'Cordoba', 'A Coruna', 'Cuenca', 'Girona', 'Granada', 'Guadalajara', 'Guipuzcoa',
  'Huelva', 'Huesca', 'Jaen', 'Leon', 'Lleida', 'Lugo', 'Malaga', 'Melilla', 'Murcia',
  'Navarra', 'Ourense', 'Palencia', 'Palma', 'Pontevedra', 'La Rioja', 'Salamanca',
  'Segovia', 'Sevilla', 'Soria', 'Tarragona', 'Teruel', 'Toledo', 'Valencia',
  'Valladolid', 'Vizcaya', 'Zamora', 'Zaragoza'
];

const propertyTypes = ['House', 'Commercial', 'Garage', 'Land', 'Other'];
const auctionStatuses = ['active', 'completed', 'deserted'];
const occupancyStatuses = ['empty', 'occupied', 'unknown'];
const investmentScores = ['BAJO', 'MEDIO', 'ALTO', 'MUY_ALTO'];

export const SearchFilters: React.FC<SearchFiltersProps> = ({ onFilter }) => {
  const [filters, setFilters] = useState<FilterState>({
    province: 'Castellon',
    areaMin: 8,
    sortBy: 'date'
  });

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleReset = () => {
    setFilters({ province: 'Castellon', areaMin: 8, sortBy: 'date' });
    onFilter({ province: 'Castellon', areaMin: 8, sortBy: 'date' });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by location, address or description..."
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Max Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Max Price (EUR)
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

          {/* Auction Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.auctionStatus || ''}
              onChange={(e) => handleFilterChange('auctionStatus', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Status</option>
              <option value="activa">Active</option>
              <option value="completada">Completed</option>
              <option value="desierta">Deserted</option>
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
