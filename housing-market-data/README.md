# Housing Market Data Service

A React-based web application for collecting, viewing, and filtering housing market data. This service provides an intuitive interface for browsing available, under contract, and sold properties with detailed information.

## Features

- **Data Collection Service**: Collects and manages housing market data including:
  - Property details (address, price, square footage, bedrooms, bathrooms)
  - Status tracking (available, under contract, sold)
  - Amenities and property features
  - Floor plan links and images
  - Location coordinates for mapping
  - Last modified dates

- **Interactive Map View**: Browse properties on an interactive map powered by Leaflet
  - Click markers to see property details
  - Popup previews with key information
  - Auto-centering on selected properties

- **List View**: Scroll through properties in a detailed list format
  - Property images and status badges
  - Key specs at a glance
  - Click to view full details

- **Dual View Mode**: View both map and list simultaneously or toggle between them

- **Advanced Filtering**: Filter properties by:
  - Status (available, under contract, sold)
  - Price range
  - Square footage
  - Number of bedrooms and bathrooms
  - Amenities (must have all selected)
  - Property type

- **Detailed Property View**: Click any property to see:
  - Full image gallery
  - Complete specifications
  - All amenities
  - Listing and modification dates
  - Floor plan link
  - MLS number

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Leaflet & React-Leaflet** - Interactive maps
- **Vitest** - Unit testing
- **React Testing Library** - Component testing

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
housing-market-data/
├── src/
│   ├── components/         # React components
│   │   ├── MapView.tsx
│   │   ├── ListView.tsx
│   │   ├── DetailView.tsx
│   │   ├── FilterPanel.tsx
│   │   └── *.test.tsx      # Component tests
│   ├── services/           # Business logic
│   │   ├── DataService.ts  # Data fetching and management
│   │   ├── FilterService.ts # Filtering logic
│   │   └── *.test.ts       # Service tests
│   ├── types/              # TypeScript types
│   │   └── House.ts
│   ├── test/               # Test setup
│   │   └── setup.ts
│   ├── App.tsx             # Main application component
│   ├── App.css             # Application styles
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## Data Model

The `House` interface defines the structure of property data:

```typescript
interface House {
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
```

## Services

### DataService

Manages housing data fetching and caching:
- `fetchHouses()` - Fetch housing data (currently returns mock data)
- `getHouses()` - Get cached houses
- `getHouseById(id)` - Get a specific house
- `updateHouse(id, updates)` - Update house data
- `getLastFetchTime()` - Get last fetch timestamp

### FilterService

Handles filtering logic:
- `filterHouses(houses, filters)` - Apply filters to houses
- `getUniqueAmenities(houses)` - Get all unique amenities
- `getUniquePropertyTypes(houses)` - Get all property types
- `getPriceRange(houses)` - Get min/max prices
- `getSquareFootageRange(houses)` - Get min/max square footage

## Testing

The project includes comprehensive unit tests for all components and services:

- **Service Tests**: Test data fetching, filtering, and business logic
- **Component Tests**: Test rendering, user interactions, and props handling
- **100% Coverage Goal**: All critical functionality is tested

Run tests:
```bash
npm test                 # Run all tests
npm run test:ui          # Open Vitest UI
npm run test:coverage    # Generate coverage report
```

## Future Enhancements

- Real data source integration (MLS API, web scraping, etc.)
- User authentication and saved searches
- Property comparison feature
- Email alerts for new listings
- Property history tracking
- Advanced map features (drawing search areas, etc.)
- Mobile app version

## License

Private - Part of claude-experiments repository
