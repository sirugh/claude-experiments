import { describe, it, expect } from 'vitest';
import { FilterService } from './FilterService';
import { House, HouseStatus, HouseFilters } from '../types/House';

describe('FilterService', () => {
  const filterService = new FilterService();

  const mockHouses: House[] = [
    {
      id: '1',
      address: '123 Main St',
      price: 300000,
      status: HouseStatus.AVAILABLE,
      squareFootage: 2000,
      bedrooms: 3,
      bathrooms: 2,
      amenities: ['Pool', 'Garage'],
      images: [],
      description: 'Nice house',
      coordinates: { lat: 30.0, lng: -97.0 },
      lastModified: new Date(),
      listedDate: new Date(),
      propertyType: 'Single Family',
    },
    {
      id: '2',
      address: '456 Oak Ave',
      price: 450000,
      status: HouseStatus.UNDER_CONTRACT,
      squareFootage: 2500,
      bedrooms: 4,
      bathrooms: 3,
      amenities: ['Garage', 'Fireplace'],
      images: [],
      description: 'Great house',
      coordinates: { lat: 30.1, lng: -97.1 },
      lastModified: new Date(),
      listedDate: new Date(),
      propertyType: 'Townhouse',
    },
    {
      id: '3',
      address: '789 Pine Rd',
      price: 200000,
      status: HouseStatus.SOLD,
      squareFootage: 1500,
      bedrooms: 2,
      bathrooms: 1.5,
      amenities: ['Patio'],
      images: [],
      description: 'Cozy house',
      coordinates: { lat: 30.2, lng: -97.2 },
      lastModified: new Date(),
      listedDate: new Date(),
      propertyType: 'Condo',
    },
  ];

  describe('filterHouses', () => {
    it('should return all houses when no filters are applied', () => {
      const filters: HouseFilters = {};
      const result = filterService.filterHouses(mockHouses, filters);

      expect(result).toEqual(mockHouses);
    });

    it('should filter by status', () => {
      const filters: HouseFilters = {
        status: [HouseStatus.AVAILABLE],
      };
      const result = filterService.filterHouses(mockHouses, filters);

      expect(result.length).toBe(1);
      expect(result[0].status).toBe(HouseStatus.AVAILABLE);
    });

    it('should filter by multiple statuses', () => {
      const filters: HouseFilters = {
        status: [HouseStatus.AVAILABLE, HouseStatus.UNDER_CONTRACT],
      };
      const result = filterService.filterHouses(mockHouses, filters);

      expect(result.length).toBe(2);
    });

    it('should filter by minimum price', () => {
      const filters: HouseFilters = {
        minPrice: 250000,
      };
      const result = filterService.filterHouses(mockHouses, filters);

      expect(result.length).toBe(2);
      result.forEach(house => {
        expect(house.price).toBeGreaterThanOrEqual(250000);
      });
    });

    it('should filter by maximum price', () => {
      const filters: HouseFilters = {
        maxPrice: 350000,
      };
      const result = filterService.filterHouses(mockHouses, filters);

      expect(result.length).toBe(2);
      result.forEach(house => {
        expect(house.price).toBeLessThanOrEqual(350000);
      });
    });

    it('should filter by price range', () => {
      const filters: HouseFilters = {
        minPrice: 250000,
        maxPrice: 400000,
      };
      const result = filterService.filterHouses(mockHouses, filters);

      expect(result.length).toBe(1);
      expect(result[0].price).toBe(300000);
    });

    it('should filter by minimum square footage', () => {
      const filters: HouseFilters = {
        minSquareFootage: 2000,
      };
      const result = filterService.filterHouses(mockHouses, filters);

      expect(result.length).toBe(2);
    });

    it('should filter by maximum square footage', () => {
      const filters: HouseFilters = {
        maxSquareFootage: 2000,
      };
      const result = filterService.filterHouses(mockHouses, filters);

      expect(result.length).toBe(2);
    });

    it('should filter by minimum bedrooms', () => {
      const filters: HouseFilters = {
        minBedrooms: 3,
      };
      const result = filterService.filterHouses(mockHouses, filters);

      expect(result.length).toBe(2);
    });

    it('should filter by maximum bedrooms', () => {
      const filters: HouseFilters = {
        maxBedrooms: 3,
      };
      const result = filterService.filterHouses(mockHouses, filters);

      expect(result.length).toBe(2);
    });

    it('should filter by minimum bathrooms', () => {
      const filters: HouseFilters = {
        minBathrooms: 2,
      };
      const result = filterService.filterHouses(mockHouses, filters);

      expect(result.length).toBe(2);
    });

    it('should filter by maximum bathrooms', () => {
      const filters: HouseFilters = {
        maxBathrooms: 2,
      };
      const result = filterService.filterHouses(mockHouses, filters);

      expect(result.length).toBe(2);
    });

    it('should filter by amenities (all must be present)', () => {
      const filters: HouseFilters = {
        amenities: ['Garage'],
      };
      const result = filterService.filterHouses(mockHouses, filters);

      expect(result.length).toBe(2);
      result.forEach(house => {
        expect(house.amenities).toContain('Garage');
      });
    });

    it('should filter by multiple amenities', () => {
      const filters: HouseFilters = {
        amenities: ['Garage', 'Pool'],
      };
      const result = filterService.filterHouses(mockHouses, filters);

      expect(result.length).toBe(1);
      expect(result[0].id).toBe('1');
    });

    it('should filter by property type', () => {
      const filters: HouseFilters = {
        propertyTypes: ['Single Family'],
      };
      const result = filterService.filterHouses(mockHouses, filters);

      expect(result.length).toBe(1);
      expect(result[0].propertyType).toBe('Single Family');
    });

    it('should filter by multiple property types', () => {
      const filters: HouseFilters = {
        propertyTypes: ['Single Family', 'Townhouse'],
      };
      const result = filterService.filterHouses(mockHouses, filters);

      expect(result.length).toBe(2);
    });

    it('should apply multiple filters simultaneously', () => {
      const filters: HouseFilters = {
        status: [HouseStatus.AVAILABLE, HouseStatus.UNDER_CONTRACT],
        minPrice: 250000,
        minBedrooms: 3,
      };
      const result = filterService.filterHouses(mockHouses, filters);

      expect(result.length).toBe(2);
    });
  });

  describe('getUniqueAmenities', () => {
    it('should return all unique amenities sorted', () => {
      const amenities = filterService.getUniqueAmenities(mockHouses);

      expect(amenities).toEqual(['Fireplace', 'Garage', 'Patio', 'Pool']);
    });

    it('should return empty array for empty houses list', () => {
      const amenities = filterService.getUniqueAmenities([]);

      expect(amenities).toEqual([]);
    });
  });

  describe('getUniquePropertyTypes', () => {
    it('should return all unique property types sorted', () => {
      const types = filterService.getUniquePropertyTypes(mockHouses);

      expect(types).toEqual(['Condo', 'Single Family', 'Townhouse']);
    });

    it('should return empty array for empty houses list', () => {
      const types = filterService.getUniquePropertyTypes([]);

      expect(types).toEqual([]);
    });
  });

  describe('getPriceRange', () => {
    it('should return correct min and max prices', () => {
      const range = filterService.getPriceRange(mockHouses);

      expect(range.min).toBe(200000);
      expect(range.max).toBe(450000);
    });

    it('should return zeros for empty houses list', () => {
      const range = filterService.getPriceRange([]);

      expect(range.min).toBe(0);
      expect(range.max).toBe(0);
    });
  });

  describe('getSquareFootageRange', () => {
    it('should return correct min and max square footage', () => {
      const range = filterService.getSquareFootageRange(mockHouses);

      expect(range.min).toBe(1500);
      expect(range.max).toBe(2500);
    });

    it('should return zeros for empty houses list', () => {
      const range = filterService.getSquareFootageRange([]);

      expect(range.min).toBe(0);
      expect(range.max).toBe(0);
    });
  });
});
