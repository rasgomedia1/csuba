import React, { useState, useEffect } from 'react';

// Level 1 — only the parameters the Apify actor's Input Schema accepts.
// Submitting this section triggers a new backend query + real Apify sync.
export interface ApifyFilterState {
  tipoBien?: 'inmueble' | 'vehiculo' | 'bien_mueble' | 'todos';
  province?: string;
  minimumBidMax?: number; // actor's `precioMaximo`
  investmentScore?: string; // actor's `scoreMinimo`
  maxResultados?: number;
}

// Level 2 — only variables already shown on the auction card. Filtering here
// never calls the backend again; it just narrows the results already fetched.
export interface LocalFilterState {
  propertyType?: string;
  areaMin?: number;
  minimumBidMin?: number;
  maxTasacion?: number;
  search?: string;
  sortBy: 'tasacion' | 'date' | 'pricePerM2' | 'auctionEnd' | 'minimumBid' | 'depositAmount' | 'investmentScore';
}

interface SearchFiltersProps {
  onApifyFilter: (filters: ApifyFilterState) => void;
  onLocalFilter: (filters: LocalFilterState) => void;
  initialApifyFilters?: ApifyFilterState;
  initialLocalFilters?: LocalFilterState;
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

const tiposBien: { value: ApifyFilterState['tipoBien']; label: string }[] = [
  { value: 'inmueble', label: 'Inmueble' },
  { value: 'vehiculo', label: 'Vehículo' },
  { value: 'bien_mueble', label: 'Bien Mueble' },
  { value: 'todos', label: 'Todos' }
];

const propertyTypes = ['Vivienda', 'Local', 'Garaje', 'Terreno', 'Otro'];
const investmentScores = ['BAJO', 'MEDIO', 'ALTO', 'MUY_ALTO'];

const defaultApifyFilters: ApifyFilterState = {
  tipoBien: 'inmueble',
  province: 'Castellón',
  minimumBidMax: 1000,
  investmentScore: 'MUY_ALTO',
  maxResultados: 10
};

const defaultLocalFilters: LocalFilterState = {
  sortBy: 'tasacion'
};

const selectCls = 'px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';
const labelCls = 'block text-xs font-semibold text-gray-600 mb-0.5';

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  onApifyFilter,
  onLocalFilter,
  initialApifyFilters,
  initialLocalFilters
}) => {
  const [apifyFilters, setApifyFilters] = useState<ApifyFilterState>(
    initialApifyFilters || defaultApifyFilters
  );
  const [localFilters, setLocalFilters] = useState<LocalFilterState>(
    initialLocalFilters || defaultLocalFilters
  );

  useEffect(() => {
    if (initialApifyFilters) setApifyFilters(initialApifyFilters);
  }, [initialApifyFilters]);

  useEffect(() => {
    if (initialLocalFilters) setLocalFilters(initialLocalFilters);
  }, [initialLocalFilters]);

  const handleApifyChange = (key: keyof ApifyFilterState, value: any) => {
    setApifyFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleLocalChange = (key: keyof LocalFilterState, value: any) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    onLocalFilter(updated);
  };

  const handleApifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApifyFilter(apifyFilters);
  };

  const handleApifyReset = () => {
    setApifyFilters(defaultApifyFilters);
    onApifyFilter(defaultApifyFilters);
  };

  const handleLocalReset = () => {
    setLocalFilters(defaultLocalFilters);
    onLocalFilter(defaultLocalFilters);
  };

  return (
    <div className="space-y-3">
      {/* Level 1 — queries the Apify actor for real BOE data */}
      <div className="bg-white rounded-lg shadow p-3">
        <form onSubmit={handleApifySubmit} className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div>
              <label className={labelCls}>Tipo de Bien</label>
              <select
                value={apifyFilters.tipoBien || 'inmueble'}
                onChange={(e) => handleApifyChange('tipoBien', e.target.value || undefined)}
                className={`${selectCls} w-full`}
              >
                {tiposBien.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Provincia</label>
              <select
                value={apifyFilters.province || ''}
                onChange={(e) => handleApifyChange('province', e.target.value || undefined)}
                className={`${selectCls} w-full`}
              >
                <option value="">Todas</option>
                {provinces.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Puja Min hasta (€)</label>
              <input
                type="number"
                placeholder="Puja mínima máxima"
                value={apifyFilters.minimumBidMax ?? ''}
                onChange={(e) => handleApifyChange('minimumBidMax', e.target.value ? Number(e.target.value) : undefined)}
                className={`${selectCls} w-full`}
              />
            </div>

            <div>
              <label className={labelCls}>Score Mínimo</label>
              <select
                value={apifyFilters.investmentScore || ''}
                onChange={(e) => handleApifyChange('investmentScore', e.target.value || undefined)}
                className={`${selectCls} w-full`}
              >
                <option value="">Todos</option>
                {investmentScores.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Máx. Resultados</label>
              <input
                type="number"
                min={1}
                max={50}
                value={apifyFilters.maxResultados ?? 20}
                onChange={(e) => handleApifyChange('maxResultados', e.target.value ? Math.min(Number(e.target.value), 50) : undefined)}
                className={`${selectCls} w-full`}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-brand-600 text-white rounded font-semibold text-sm hover:bg-brand-700"
            >
              Buscar
            </button>
            <button
              type="button"
              onClick={handleApifyReset}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm font-semibold hover:bg-gray-300"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Level 2 — filters only the results already fetched, client-side */}
      <div className="bg-white rounded-lg shadow p-3 space-y-3">
        <div>
          <label className={labelCls}>Buscar</label>
          <input
            type="text"
            placeholder="Buscar por ubicación, dirección o descripción..."
            value={localFilters.search || ''}
            onChange={(e) => handleLocalChange('search', e.target.value || undefined)}
            className={`${selectCls} w-full`}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div>
            <label className={labelCls}>Tipo de Propiedad</label>
            <select
              value={localFilters.propertyType || ''}
              onChange={(e) => handleLocalChange('propertyType', e.target.value || undefined)}
              className={`${selectCls} w-full`}
            >
              <option value="">Todos los Tipos</option>
              {propertyTypes.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Tasación Máxima (€)</label>
            <input
              type="number"
              placeholder="Ex: 500000"
              value={localFilters.maxTasacion ?? ''}
              onChange={(e) => handleLocalChange('maxTasacion', e.target.value ? Number(e.target.value) : undefined)}
              className={`${selectCls} w-full`}
            />
          </div>

          <div>
            <label className={labelCls}>Ordenar Por</label>
            <select
              value={localFilters.sortBy}
              onChange={(e) => handleLocalChange('sortBy', e.target.value)}
              className={`${selectCls} w-full`}
            >
              <option value="tasacion">Tasación</option>
              <option value="date">Fecha</option>
              <option value="pricePerM2">Precio por m2</option>
              <option value="auctionEnd">Fecha Cierre</option>
              <option value="minimumBid">Puja Mínima</option>
              <option value="depositAmount">Importe Depósito</option>
              <option value="investmentScore">Score</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Área Mínima (m2)</label>
            <input
              type="number"
              value={localFilters.areaMin ?? ''}
              onChange={(e) => handleLocalChange('areaMin', e.target.value ? Number(e.target.value) : undefined)}
              className={`${selectCls} w-full`}
            />
          </div>

          <div>
            <label className={labelCls}>Puja Mínima desde (€)</label>
            <input
              type="number"
              value={localFilters.minimumBidMin ?? ''}
              onChange={(e) => handleLocalChange('minimumBidMin', e.target.value ? Number(e.target.value) : undefined)}
              className={`${selectCls} w-full`}
            />
          </div>
        </div>

        <div className="flex">
          <button
            type="button"
            onClick={handleLocalReset}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm font-semibold hover:bg-gray-300"
          >
            Reset Filtros
          </button>
        </div>
      </div>
    </div>
  );
};
