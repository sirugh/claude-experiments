import { useState } from 'react';
import { HouseFilters, HouseStatus } from '../types/House';

interface FilterPanelProps {
  filters: HouseFilters;
  onFiltersChange: (filters: HouseFilters) => void;
  availableAmenities: string[];
  availablePropertyTypes: string[];
  priceRange: { min: number; max: number };
  sqftRange: { min: number; max: number };
}

export function FilterPanel({
  filters,
  onFiltersChange,
  availableAmenities,
  availablePropertyTypes,
  priceRange,
  sqftRange,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleStatusChange = (status: HouseStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];

    onFiltersChange({ ...filters, status: newStatuses.length > 0 ? newStatuses : undefined });
  };

  const handleAmenityChange = (amenity: string) => {
    const currentAmenities = filters.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];

    onFiltersChange({ ...filters, amenities: newAmenities.length > 0 ? newAmenities : undefined });
  };

  const handlePropertyTypeChange = (type: string) => {
    const currentTypes = filters.propertyTypes || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];

    onFiltersChange({ ...filters, propertyTypes: newTypes.length > 0 ? newTypes : undefined });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className={`filter-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="filter-header">
        <h2>Filters</h2>
        <div className="filter-actions">
          {hasActiveFilters && (
            <button onClick={clearFilters} className="clear-filters">
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="toggle-filters"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="filter-content">
          <div className="filter-section">
            <h3>Status</h3>
            <div className="checkbox-group">
              {Object.values(HouseStatus).map(status => (
                <label key={status} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.status?.includes(status) || false}
                    onChange={() => handleStatusChange(status)}
                  />
                  <span>{status.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Price Range</h3>
            <div className="input-group">
              <input
                type="number"
                placeholder={`Min ($${priceRange.min.toLocaleString()})`}
                value={filters.minPrice || ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  minPrice: e.target.value ? Number(e.target.value) : undefined
                })}
              />
              <span>to</span>
              <input
                type="number"
                placeholder={`Max ($${priceRange.max.toLocaleString()})`}
                value={filters.maxPrice || ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  maxPrice: e.target.value ? Number(e.target.value) : undefined
                })}
              />
            </div>
          </div>

          <div className="filter-section">
            <h3>Square Footage</h3>
            <div className="input-group">
              <input
                type="number"
                placeholder={`Min (${sqftRange.min.toLocaleString()})`}
                value={filters.minSquareFootage || ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  minSquareFootage: e.target.value ? Number(e.target.value) : undefined
                })}
              />
              <span>to</span>
              <input
                type="number"
                placeholder={`Max (${sqftRange.max.toLocaleString()})`}
                value={filters.maxSquareFootage || ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  maxSquareFootage: e.target.value ? Number(e.target.value) : undefined
                })}
              />
            </div>
          </div>

          <div className="filter-section">
            <h3>Bedrooms</h3>
            <div className="input-group">
              <input
                type="number"
                placeholder="Min"
                min="0"
                value={filters.minBedrooms || ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  minBedrooms: e.target.value ? Number(e.target.value) : undefined
                })}
              />
              <span>to</span>
              <input
                type="number"
                placeholder="Max"
                min="0"
                value={filters.maxBedrooms || ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  maxBedrooms: e.target.value ? Number(e.target.value) : undefined
                })}
              />
            </div>
          </div>

          <div className="filter-section">
            <h3>Bathrooms</h3>
            <div className="input-group">
              <input
                type="number"
                placeholder="Min"
                min="0"
                step="0.5"
                value={filters.minBathrooms || ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  minBathrooms: e.target.value ? Number(e.target.value) : undefined
                })}
              />
              <span>to</span>
              <input
                type="number"
                placeholder="Max"
                min="0"
                step="0.5"
                value={filters.maxBathrooms || ''}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  maxBathrooms: e.target.value ? Number(e.target.value) : undefined
                })}
              />
            </div>
          </div>

          {availablePropertyTypes.length > 0 && (
            <div className="filter-section">
              <h3>Property Type</h3>
              <div className="checkbox-group">
                {availablePropertyTypes.map(type => (
                  <label key={type} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.propertyTypes?.includes(type) || false}
                      onChange={() => handlePropertyTypeChange(type)}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {availableAmenities.length > 0 && (
            <div className="filter-section">
              <h3>Amenities</h3>
              <div className="checkbox-group">
                {availableAmenities.map(amenity => (
                  <label key={amenity} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.amenities?.includes(amenity) || false}
                      onChange={() => handleAmenityChange(amenity)}
                    />
                    <span>{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
