import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ListView } from './ListView';
import { House, HouseStatus } from '../types/House';

describe('ListView', () => {
  const mockHouses: House[] = [
    {
      id: '1',
      address: '123 Main St',
      price: 300000,
      status: HouseStatus.AVAILABLE,
      squareFootage: 2000,
      bedrooms: 3,
      bathrooms: 2,
      amenities: ['Pool', 'Garage', 'Fireplace'],
      images: ['image1.jpg'],
      description: 'Nice house',
      coordinates: { lat: 30.0, lng: -97.0 },
      lastModified: new Date('2024-01-01'),
      listedDate: new Date('2023-12-01'),
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
      amenities: ['Garage'],
      images: ['image2.jpg'],
      description: 'Great house',
      coordinates: { lat: 30.1, lng: -97.1 },
      lastModified: new Date('2024-01-02'),
      listedDate: new Date('2023-12-02'),
      propertyType: 'Townhouse',
    },
  ];

  it('should render the list of houses', () => {
    render(
      <ListView
        houses={mockHouses}
        selectedHouse={null}
        onHouseSelect={vi.fn()}
      />
    );

    expect(screen.getByText(/Properties \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('456 Oak Ave')).toBeInTheDocument();
  });

  it('should display house prices correctly', () => {
    render(
      <ListView
        houses={mockHouses}
        selectedHouse={null}
        onHouseSelect={vi.fn()}
      />
    );

    expect(screen.getByText('$300,000')).toBeInTheDocument();
    expect(screen.getByText('$450,000')).toBeInTheDocument();
  });

  it('should display house specifications', () => {
    render(
      <ListView
        houses={mockHouses}
        selectedHouse={null}
        onHouseSelect={vi.fn()}
      />
    );

    expect(screen.getByText(/3 bed/i)).toBeInTheDocument();
    expect(screen.getByText(/2 bath/i)).toBeInTheDocument();
    expect(screen.getByText(/2,000 sqft/i)).toBeInTheDocument();
  });

  it('should display property types', () => {
    render(
      <ListView
        houses={mockHouses}
        selectedHouse={null}
        onHouseSelect={vi.fn()}
      />
    );

    expect(screen.getByText('Single Family')).toBeInTheDocument();
    expect(screen.getByText('Townhouse')).toBeInTheDocument();
  });

  it('should display amenities preview', () => {
    render(
      <ListView
        houses={mockHouses}
        selectedHouse={null}
        onHouseSelect={vi.fn()}
      />
    );

    expect(screen.getByText(/Pool • Garage • Fireplace/i)).toBeInTheDocument();
  });

  it('should show +N for additional amenities', () => {
    const houseWithManyAmenities: House = {
      ...mockHouses[0],
      amenities: ['Pool', 'Garage', 'Fireplace', 'Deck', 'Patio'],
    };

    render(
      <ListView
        houses={[houseWithManyAmenities]}
        selectedHouse={null}
        onHouseSelect={vi.fn()}
      />
    );

    expect(screen.getByText(/\+2/i)).toBeInTheDocument();
  });

  it('should call onHouseSelect when a house is clicked', () => {
    const handleSelect = vi.fn();

    render(
      <ListView
        houses={mockHouses}
        selectedHouse={null}
        onHouseSelect={handleSelect}
      />
    );

    const firstHouse = screen.getByText('123 Main St').closest('.list-item');
    fireEvent.click(firstHouse!);

    expect(handleSelect).toHaveBeenCalledWith(mockHouses[0]);
  });

  it('should highlight selected house', () => {
    render(
      <ListView
        houses={mockHouses}
        selectedHouse={mockHouses[0]}
        onHouseSelect={vi.fn()}
      />
    );

    const firstHouse = screen.getByText('123 Main St').closest('.list-item');
    expect(firstHouse).toHaveClass('selected');
  });

  it('should display no results message when houses array is empty', () => {
    render(
      <ListView
        houses={[]}
        selectedHouse={null}
        onHouseSelect={vi.fn()}
      />
    );

    expect(screen.getByText('No properties match your filters')).toBeInTheDocument();
  });

  it('should display correct house count', () => {
    render(
      <ListView
        houses={mockHouses}
        selectedHouse={null}
        onHouseSelect={vi.fn()}
      />
    );

    expect(screen.getByText('Properties (2)')).toBeInTheDocument();
  });
});
