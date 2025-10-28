import { House, HouseStatus } from '../types/House';

/**
 * Service for fetching and managing housing market data
 */
export class DataService {
  private houses: House[] = [];
  private lastFetchTime: Date | null = null;

  /**
   * Fetch housing data from a data source
   * In a real implementation, this would call an API or scrape a website
   */
  async fetchHouses(): Promise<House[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // For now, return mock data
    // In production, this would fetch from a real data source
    this.houses = this.generateMockData();
    this.lastFetchTime = new Date();

    return this.houses;
  }

  /**
   * Get all houses from cache
   */
  getHouses(): House[] {
    return this.houses;
  }

  /**
   * Get a single house by ID
   */
  getHouseById(id: string): House | undefined {
    return this.houses.find(house => house.id === id);
  }

  /**
   * Get the last time data was fetched
   */
  getLastFetchTime(): Date | null {
    return this.lastFetchTime;
  }

  /**
   * Update a house's data
   */
  updateHouse(id: string, updates: Partial<House>): House | undefined {
    const index = this.houses.findIndex(house => house.id === id);
    if (index === -1) return undefined;

    this.houses[index] = {
      ...this.houses[index],
      ...updates,
      lastModified: new Date(),
    };

    return this.houses[index];
  }

  /**
   * Generate mock housing data for demonstration
   * In production, this would be replaced with actual data fetching
   */
  private generateMockData(): House[] {
    const addresses = [
      '123 Main St, Austin, TX 78701',
      '456 Oak Ave, Austin, TX 78702',
      '789 Pine Rd, Austin, TX 78703',
      '321 Elm St, Austin, TX 78704',
      '654 Maple Dr, Austin, TX 78705',
      '987 Cedar Ln, Austin, TX 78731',
      '147 Birch Way, Austin, TX 78732',
      '258 Willow Ct, Austin, TX 78733',
      '369 Aspen Pl, Austin, TX 78734',
      '741 Spruce Ave, Austin, TX 78735',
    ];

    const amenities = [
      'Pool', 'Garage', 'Hardwood Floors', 'Updated Kitchen',
      'Fireplace', 'Walk-in Closet', 'Granite Countertops',
      'Stainless Steel Appliances', 'Central AC', 'Backyard',
      'Patio', 'Deck', 'Finished Basement', 'Smart Home',
      'Energy Efficient', 'Solar Panels'
    ];

    const propertyTypes = ['Single Family', 'Townhouse', 'Condo', 'Multi-Family'];

    const statuses = [
      HouseStatus.AVAILABLE,
      HouseStatus.UNDER_CONTRACT,
      HouseStatus.SOLD,
    ];

    // Austin, TX coordinates range
    const baseLatitude = 30.2672;
    const baseLongitude = -97.7431;

    return addresses.map((address, index) => {
      const selectedAmenities = amenities
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 6) + 3);

      const bedrooms = Math.floor(Math.random() * 4) + 2;
      const bathrooms = Math.floor(Math.random() * 3) + 1.5;
      const sqft = Math.floor(Math.random() * 2000) + 1200;
      const price = sqft * (200 + Math.random() * 150);

      return {
        id: `house-${index + 1}`,
        address,
        price: Math.round(price / 1000) * 1000,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        squareFootage: sqft,
        bedrooms,
        bathrooms,
        amenities: selectedAmenities,
        floorPlanLink: `https://example.com/floorplan-${index + 1}.pdf`,
        images: [
          `https://picsum.photos/800/600?random=${index * 3 + 1}`,
          `https://picsum.photos/800/600?random=${index * 3 + 2}`,
          `https://picsum.photos/800/600?random=${index * 3 + 3}`,
        ],
        description: `Beautiful ${bedrooms} bedroom, ${bathrooms} bathroom home in a great location. Features ${selectedAmenities.slice(0, 3).join(', ')} and more!`,
        coordinates: {
          lat: baseLatitude + (Math.random() - 0.5) * 0.1,
          lng: baseLongitude + (Math.random() - 0.5) * 0.1,
        },
        lastModified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        listedDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        lotSize: Math.floor(Math.random() * 5000) + 3000,
        yearBuilt: Math.floor(Math.random() * 30) + 1995,
        propertyType: propertyTypes[Math.floor(Math.random() * propertyTypes.length)],
        mlsNumber: `MLS-${String(index + 1).padStart(6, '0')}`,
      };
    });
  }
}

export const dataService = new DataService();
