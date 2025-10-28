import { describe, it, expect, beforeEach } from 'vitest';
import { DataService } from './DataService';
import { HouseStatus } from '../types/House';

describe('DataService', () => {
  let dataService: DataService;

  beforeEach(() => {
    dataService = new DataService();
  });

  describe('fetchHouses', () => {
    it('should fetch and return an array of houses', async () => {
      const houses = await dataService.fetchHouses();

      expect(Array.isArray(houses)).toBe(true);
      expect(houses.length).toBeGreaterThan(0);
    });

    it('should set lastFetchTime after fetching', async () => {
      const beforeFetch = new Date();
      await dataService.fetchHouses();
      const lastFetchTime = dataService.getLastFetchTime();

      expect(lastFetchTime).not.toBeNull();
      expect(lastFetchTime!.getTime()).toBeGreaterThanOrEqual(beforeFetch.getTime());
    });

    it('should return houses with all required properties', async () => {
      const houses = await dataService.fetchHouses();
      const house = houses[0];

      expect(house).toHaveProperty('id');
      expect(house).toHaveProperty('address');
      expect(house).toHaveProperty('price');
      expect(house).toHaveProperty('status');
      expect(house).toHaveProperty('squareFootage');
      expect(house).toHaveProperty('bedrooms');
      expect(house).toHaveProperty('bathrooms');
      expect(house).toHaveProperty('amenities');
      expect(house).toHaveProperty('images');
      expect(house).toHaveProperty('description');
      expect(house).toHaveProperty('coordinates');
      expect(house).toHaveProperty('lastModified');
      expect(house).toHaveProperty('listedDate');
      expect(house).toHaveProperty('propertyType');
    });

    it('should return houses with valid status values', async () => {
      const houses = await dataService.fetchHouses();
      const validStatuses = Object.values(HouseStatus);

      houses.forEach(house => {
        expect(validStatuses).toContain(house.status);
      });
    });

    it('should return houses with valid coordinates', async () => {
      const houses = await dataService.fetchHouses();

      houses.forEach(house => {
        expect(house.coordinates.lat).toBeTypeOf('number');
        expect(house.coordinates.lng).toBeTypeOf('number');
        expect(house.coordinates.lat).toBeGreaterThan(-90);
        expect(house.coordinates.lat).toBeLessThan(90);
        expect(house.coordinates.lng).toBeGreaterThan(-180);
        expect(house.coordinates.lng).toBeLessThan(180);
      });
    });
  });

  describe('getHouses', () => {
    it('should return an empty array initially', () => {
      const houses = dataService.getHouses();
      expect(houses).toEqual([]);
    });

    it('should return cached houses after fetching', async () => {
      await dataService.fetchHouses();
      const houses = dataService.getHouses();

      expect(houses.length).toBeGreaterThan(0);
    });
  });

  describe('getHouseById', () => {
    it('should return undefined for non-existent house', async () => {
      await dataService.fetchHouses();
      const house = dataService.getHouseById('non-existent-id');

      expect(house).toBeUndefined();
    });

    it('should return the correct house by id', async () => {
      await dataService.fetchHouses();
      const houses = dataService.getHouses();
      const firstHouse = houses[0];
      const foundHouse = dataService.getHouseById(firstHouse.id);

      expect(foundHouse).toEqual(firstHouse);
    });
  });

  describe('getLastFetchTime', () => {
    it('should return null initially', () => {
      const lastFetchTime = dataService.getLastFetchTime();
      expect(lastFetchTime).toBeNull();
    });

    it('should return a Date after fetching', async () => {
      await dataService.fetchHouses();
      const lastFetchTime = dataService.getLastFetchTime();

      expect(lastFetchTime).toBeInstanceOf(Date);
    });
  });

  describe('updateHouse', () => {
    it('should return undefined for non-existent house', async () => {
      await dataService.fetchHouses();
      const result = dataService.updateHouse('non-existent-id', { price: 100000 });

      expect(result).toBeUndefined();
    });

    it('should update house properties', async () => {
      await dataService.fetchHouses();
      const houses = dataService.getHouses();
      const originalHouse = houses[0];
      const newPrice = 999999;

      const updatedHouse = dataService.updateHouse(originalHouse.id, { price: newPrice });

      expect(updatedHouse).toBeDefined();
      expect(updatedHouse!.price).toBe(newPrice);
      expect(updatedHouse!.id).toBe(originalHouse.id);
    });

    it('should update lastModified date when updating house', async () => {
      await dataService.fetchHouses();
      const houses = dataService.getHouses();
      const originalHouse = houses[0];
      const originalLastModified = originalHouse.lastModified;

      // Wait a bit to ensure time difference
      await new Promise(resolve => setTimeout(resolve, 10));

      const updatedHouse = dataService.updateHouse(originalHouse.id, { price: 123456 });

      expect(updatedHouse).toBeDefined();
      expect(updatedHouse!.lastModified.getTime()).toBeGreaterThan(originalLastModified.getTime());
    });
  });
});
