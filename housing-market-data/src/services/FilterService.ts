import { House, HouseFilters } from '../types/House';

/**
 * Service for filtering housing data
 */
export class FilterService {
  /**
   * Apply filters to a list of houses
   */
  filterHouses(houses: House[], filters: HouseFilters): House[] {
    return houses.filter(house => {
      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(house.status)) {
          return false;
        }
      }

      // Price filters
      if (filters.minPrice !== undefined && house.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== undefined && house.price > filters.maxPrice) {
        return false;
      }

      // Square footage filters
      if (filters.minSquareFootage !== undefined && house.squareFootage < filters.minSquareFootage) {
        return false;
      }
      if (filters.maxSquareFootage !== undefined && house.squareFootage > filters.maxSquareFootage) {
        return false;
      }

      // Bedroom filters
      if (filters.minBedrooms !== undefined && house.bedrooms < filters.minBedrooms) {
        return false;
      }
      if (filters.maxBedrooms !== undefined && house.bedrooms > filters.maxBedrooms) {
        return false;
      }

      // Bathroom filters
      if (filters.minBathrooms !== undefined && house.bathrooms < filters.minBathrooms) {
        return false;
      }
      if (filters.maxBathrooms !== undefined && house.bathrooms > filters.maxBathrooms) {
        return false;
      }

      // Amenities filter - house must have all selected amenities
      if (filters.amenities && filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(amenity =>
          house.amenities.includes(amenity)
        );
        if (!hasAllAmenities) {
          return false;
        }
      }

      // Property type filter
      if (filters.propertyTypes && filters.propertyTypes.length > 0) {
        if (!filters.propertyTypes.includes(house.propertyType)) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Get unique amenities from a list of houses
   */
  getUniqueAmenities(houses: House[]): string[] {
    const amenitiesSet = new Set<string>();
    houses.forEach(house => {
      house.amenities.forEach(amenity => amenitiesSet.add(amenity));
    });
    return Array.from(amenitiesSet).sort();
  }

  /**
   * Get unique property types from a list of houses
   */
  getUniquePropertyTypes(houses: House[]): string[] {
    const typesSet = new Set<string>();
    houses.forEach(house => {
      typesSet.add(house.propertyType);
    });
    return Array.from(typesSet).sort();
  }

  /**
   * Get price range from a list of houses
   */
  getPriceRange(houses: House[]): { min: number; max: number } {
    if (houses.length === 0) {
      return { min: 0, max: 0 };
    }

    const prices = houses.map(house => house.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }

  /**
   * Get square footage range from a list of houses
   */
  getSquareFootageRange(houses: House[]): { min: number; max: number } {
    if (houses.length === 0) {
      return { min: 0, max: 0 };
    }

    const sqft = houses.map(house => house.squareFootage);
    return {
      min: Math.min(...sqft),
      max: Math.max(...sqft),
    };
  }
}

export const filterService = new FilterService();
