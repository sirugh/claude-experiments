import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DetailView } from './DetailView';
import { House, HouseStatus } from '../types/House';

describe('DetailView', () => {
  const mockHouse: House = {
    id: '1',
    address: '123 Main St, Austin, TX',
    price: 350000,
    status: HouseStatus.AVAILABLE,
    squareFootage: 2000,
    bedrooms: 3,
    bathrooms: 2.5,
    amenities: ['Pool', 'Garage', 'Fireplace', 'Deck'],
    images: ['image1.jpg', 'image2.jpg', 'image3.jpg'],
    description: 'Beautiful home with modern amenities',
    coordinates: { lat: 30.0, lng: -97.0 },
    lastModified: new Date('2024-01-15'),
    listedDate: new Date('2023-12-01'),
    lotSize: 5000,
    yearBuilt: 2010,
    propertyType: 'Single Family',
    mlsNumber: 'MLS-123456',
    floorPlanLink: 'https://example.com/floorplan.pdf',
  };

  it('should not render when house is null', () => {
    const { container } = render(
      <DetailView house={null} onClose={vi.fn()} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render house details when house is provided', () => {
    render(<DetailView house={mockHouse} onClose={vi.fn()} />);

    expect(screen.getByText('$350,000')).toBeInTheDocument();
    expect(screen.getByText('123 Main St, Austin, TX')).toBeInTheDocument();
    expect(screen.getByText('Beautiful home with modern amenities')).toBeInTheDocument();
  });

  it('should display all house specifications', () => {
    render(<DetailView house={mockHouse} onClose={vi.fn()} />);

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2.5')).toBeInTheDocument();
    expect(screen.getByText('2,000')).toBeInTheDocument();
    expect(screen.getByText('Single Family')).toBeInTheDocument();
  });

  it('should display optional fields when provided', () => {
    render(<DetailView house={mockHouse} onClose={vi.fn()} />);

    expect(screen.getByText('5,000 sqft')).toBeInTheDocument();
    expect(screen.getByText('2010')).toBeInTheDocument();
    expect(screen.getByText('MLS-123456')).toBeInTheDocument();
  });

  it('should display all amenities', () => {
    render(<DetailView house={mockHouse} onClose={vi.fn()} />);

    expect(screen.getByText('Pool')).toBeInTheDocument();
    expect(screen.getByText('Garage')).toBeInTheDocument();
    expect(screen.getByText('Fireplace')).toBeInTheDocument();
    expect(screen.getByText('Deck')).toBeInTheDocument();
  });

  it('should display formatted dates', () => {
    render(<DetailView house={mockHouse} onClose={vi.fn()} />);

    const listedDate = new Date('2023-12-01').toLocaleDateString();
    const modifiedDate = new Date('2024-01-15').toLocaleDateString();

    expect(screen.getByText(listedDate)).toBeInTheDocument();
    expect(screen.getByText(modifiedDate)).toBeInTheDocument();
  });

  it('should display floor plan link when provided', () => {
    render(<DetailView house={mockHouse} onClose={vi.fn()} />);

    const link = screen.getByText('View Floor Plan') as HTMLAnchorElement;
    expect(link).toBeInTheDocument();
    expect(link.href).toBe('https://example.com/floorplan.pdf');
    expect(link.target).toBe('_blank');
  });

  it('should not display floor plan link when not provided', () => {
    const houseWithoutFloorPlan = { ...mockHouse, floorPlanLink: undefined };
    render(<DetailView house={houseWithoutFloorPlan} onClose={vi.fn()} />);

    expect(screen.queryByText('View Floor Plan')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<DetailView house={mockHouse} onClose={handleClose} />);

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when overlay is clicked', () => {
    const handleClose = vi.fn();
    render(<DetailView house={mockHouse} onClose={handleClose} />);

    const overlay = screen.getByText('×').closest('.detail-overlay');
    fireEvent.click(overlay!);

    expect(handleClose).toHaveBeenCalled();
  });

  it('should not call onClose when detail container is clicked', () => {
    const handleClose = vi.fn();
    render(<DetailView house={mockHouse} onClose={handleClose} />);

    const container = screen.getByText('123 Main St, Austin, TX').closest('.detail-container');
    fireEvent.click(container!);

    expect(handleClose).not.toHaveBeenCalled();
  });

  it('should render main image and thumbnails', () => {
    render(<DetailView house={mockHouse} onClose={vi.fn()} />);

    const images = screen.getAllByRole('img') as HTMLImageElement[];
    expect(images.length).toBe(3); // 1 main + 2 thumbnails

    expect(images[0].src).toContain('image1.jpg');
    expect(images[1].src).toContain('image2.jpg');
    expect(images[2].src).toContain('image3.jpg');
  });

  it('should display correct status badge', () => {
    render(<DetailView house={mockHouse} onClose={vi.fn()} />);

    const statusBadge = screen.getByText('available');
    expect(statusBadge).toHaveClass('status-badge', 'available');
  });
});
