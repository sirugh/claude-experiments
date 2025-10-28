import { useState, useEffect, useMemo } from 'react';
import { House, HouseFilters } from './types/House';
import { dataService } from './services/DataService';
import { filterService } from './services/FilterService';
import { MapView } from './components/MapView';
import { ListView } from './components/ListView';
import { DetailView } from './components/DetailView';
import { FilterPanel } from './components/FilterPanel';
import './App.css';

type ViewMode = 'map' | 'list' | 'both';

function App() {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filters, setFilters] = useState<HouseFilters>({});
  const [viewMode, setViewMode] = useState<ViewMode>('both');

  useEffect(() => {
    loadHouses();
  }, []);

  const loadHouses = async () => {
    setLoading(true);
    try {
      const data = await dataService.fetchHouses();
      setHouses(data);
    } catch (error) {
      console.error('Failed to load houses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHouses = useMemo(() => {
    return filterService.filterHouses(houses, filters);
  }, [houses, filters]);

  const availableAmenities = useMemo(() => {
    return filterService.getUniqueAmenities(houses);
  }, [houses]);

  const availablePropertyTypes = useMemo(() => {
    return filterService.getUniquePropertyTypes(houses);
  }, [houses]);

  const priceRange = useMemo(() => {
    return filterService.getPriceRange(houses);
  }, [houses]);

  const sqftRange = useMemo(() => {
    return filterService.getSquareFootageRange(houses);
  }, [houses]);

  const handleHouseSelect = (house: House) => {
    setSelectedHouse(house);
    setShowDetail(true);
  };

  const handleDetailClose = () => {
    setShowDetail(false);
  };

  const lastFetchTime = dataService.getLastFetchTime();

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <h2>Loading housing data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Housing Market Data</h1>
        <div className="header-info">
          {lastFetchTime && (
            <span className="last-update">
              Last updated: {lastFetchTime.toLocaleString()}
            </span>
          )}
          <button onClick={loadHouses} className="refresh-button">
            Refresh Data
          </button>
        </div>
      </header>

      <div className="view-controls">
        <button
          className={viewMode === 'map' ? 'active' : ''}
          onClick={() => setViewMode('map')}
        >
          Map View
        </button>
        <button
          className={viewMode === 'list' ? 'active' : ''}
          onClick={() => setViewMode('list')}
        >
          List View
        </button>
        <button
          className={viewMode === 'both' ? 'active' : ''}
          onClick={() => setViewMode('both')}
        >
          Both
        </button>
      </div>

      <div className="app-content">
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          availableAmenities={availableAmenities}
          availablePropertyTypes={availablePropertyTypes}
          priceRange={priceRange}
          sqftRange={sqftRange}
        />

        <div className={`main-content ${viewMode}`}>
          {(viewMode === 'map' || viewMode === 'both') && (
            <MapView
              houses={filteredHouses}
              selectedHouse={selectedHouse}
              onHouseSelect={handleHouseSelect}
            />
          )}

          {(viewMode === 'list' || viewMode === 'both') && (
            <ListView
              houses={filteredHouses}
              selectedHouse={selectedHouse}
              onHouseSelect={handleHouseSelect}
            />
          )}
        </div>
      </div>

      {showDetail && (
        <DetailView house={selectedHouse} onClose={handleDetailClose} />
      )}
    </div>
  );
}

export default App;
