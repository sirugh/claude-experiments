export enum HouseStatus {
  AVAILABLE = 'available',
  UNDER_CONTRACT = 'under_contract',
  SOLD = 'sold',
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface House {
  id: string;
  address: string;
  price: number;
  status: HouseStatus;
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  floorPlanLink?: string;
  images: string[];
  description: string;
  coordinates: Coordinates;
  lastModified: Date;
  listedDate: Date;
  lotSize?: number;
  yearBuilt?: number;
  propertyType: string;
  mlsNumber?: string;
}

export interface HouseFilters {
  status?: HouseStatus[];
  minPrice?: number;
  maxPrice?: number;
  minSquareFootage?: number;
  maxSquareFootage?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  amenities?: string[];
  propertyTypes?: string[];
}
