import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterPanel } from './FilterPanel';
import { HouseFilters, HouseStatus } from '../types/House';

describe('FilterPanel', () => {
  const defaultProps = {
    filters: {},
    onFiltersChange: vi.fn(),
    availableAmenities: ['Pool', 'Garage', 'Fireplace'],
    availablePropertyTypes: ['Single Family', 'Townhouse', 'Condo'],
    priceRange: { min: 100000, max: 500000 },
    sqftRange: { min: 1000, max: 3000 },
  };

  it('should render filter panel with all sections', () => {
    render(<FilterPanel {...defaultProps} />);

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Price Range')).toBeInTheDocument();
    expect(screen.getByText('Square Footage')).toBeInTheDocument();
    expect(screen.getByText('Bedrooms')).toBeInTheDocument();
    expect(screen.getByText('Bathrooms')).toBeInTheDocument();
    expect(screen.getByText('Property Type')).toBeInTheDocument();
    expect(screen.getByText('Amenities')).toBeInTheDocument();
  });

  it('should render all status options', () => {
    render(<FilterPanel {...defaultProps} />);

    expect(screen.getByText('available')).toBeInTheDocument();
    expect(screen.getByText('under contract')).toBeInTheDocument();
    expect(screen.getByText('sold')).toBeInTheDocument();
  });

  it('should call onFiltersChange when status is selected', () => {
    const handleChange = vi.fn();
    render(<FilterPanel {...defaultProps} onFiltersChange={handleChange} />);

    const availableCheckbox = screen.getByLabelText('available') as HTMLInputElement;
    fireEvent.click(availableCheckbox);

    expect(handleChange).toHaveBeenCalledWith({
      status: [HouseStatus.AVAILABLE],
    });
  });

  it('should handle multiple status selections', () => {
    const handleChange = vi.fn();
    render(<FilterPanel {...defaultProps} onFiltersChange={handleChange} />);

    const availableCheckbox = screen.getByLabelText('available');
    const soldCheckbox = screen.getByLabelText('sold');

    fireEvent.click(availableCheckbox);
    fireEvent.click(soldCheckbox);

    expect(handleChange).toHaveBeenLastCalledWith({
      status: [HouseStatus.AVAILABLE, HouseStatus.SOLD],
    });
  });

  it('should display available amenities', () => {
    render(<FilterPanel {...defaultProps} />);

    expect(screen.getByLabelText('Pool')).toBeInTheDocument();
    expect(screen.getByLabelText('Garage')).toBeInTheDocument();
    expect(screen.getByLabelText('Fireplace')).toBeInTheDocument();
  });

  it('should call onFiltersChange when amenity is selected', () => {
    const handleChange = vi.fn();
    render(<FilterPanel {...defaultProps} onFiltersChange={handleChange} />);

    const poolCheckbox = screen.getByLabelText('Pool');
    fireEvent.click(poolCheckbox);

    expect(handleChange).toHaveBeenCalledWith({
      amenities: ['Pool'],
    });
  });

  it('should display available property types', () => {
    render(<FilterPanel {...defaultProps} />);

    expect(screen.getByLabelText('Single Family')).toBeInTheDocument();
    expect(screen.getByLabelText('Townhouse')).toBeInTheDocument();
    expect(screen.getByLabelText('Condo')).toBeInTheDocument();
  });

  it('should call onFiltersChange when property type is selected', () => {
    const handleChange = vi.fn();
    render(<FilterPanel {...defaultProps} onFiltersChange={handleChange} />);

    const condoCheckbox = screen.getByLabelText('Condo');
    fireEvent.click(condoCheckbox);

    expect(handleChange).toHaveBeenCalledWith({
      propertyTypes: ['Condo'],
    });
  });

  it('should handle price range input changes', () => {
    const handleChange = vi.fn();
    render(<FilterPanel {...defaultProps} onFiltersChange={handleChange} />);

    const minPriceInput = screen.getByPlaceholderText(/Min \(\$100,000\)/i) as HTMLInputElement;
    fireEvent.change(minPriceInput, { target: { value: '200000' } });

    expect(handleChange).toHaveBeenCalledWith({
      minPrice: 200000,
    });
  });

  it('should handle square footage range input changes', () => {
    const handleChange = vi.fn();
    render(<FilterPanel {...defaultProps} onFiltersChange={handleChange} />);

    const minSqftInput = screen.getByPlaceholderText(/Min \(1,000\)/i) as HTMLInputElement;
    fireEvent.change(minSqftInput, { target: { value: '1500' } });

    expect(handleChange).toHaveBeenCalledWith({
      minSquareFootage: 1500,
    });
  });

  it('should handle bedroom range input changes', () => {
    const handleChange = vi.fn();
    render(<FilterPanel {...defaultProps} onFiltersChange={handleChange} />);

    const bedroomInputs = screen.getAllByPlaceholderText('Min') as HTMLInputElement[];
    const bedroomMinInput = bedroomInputs.find(input =>
      input.closest('.filter-section')?.querySelector('h3')?.textContent === 'Bedrooms'
    );

    fireEvent.change(bedroomMinInput!, { target: { value: '3' } });

    expect(handleChange).toHaveBeenCalledWith({
      minBedrooms: 3,
    });
  });

  it('should show clear filters button when filters are active', () => {
    const activeFilters: HouseFilters = {
      status: [HouseStatus.AVAILABLE],
    };

    render(<FilterPanel {...defaultProps} filters={activeFilters} />);

    expect(screen.getByText('Clear All')).toBeInTheDocument();
  });

  it('should not show clear filters button when no filters are active', () => {
    render(<FilterPanel {...defaultProps} />);

    expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
  });

  it('should clear all filters when clear button is clicked', () => {
    const handleChange = vi.fn();
    const activeFilters: HouseFilters = {
      status: [HouseStatus.AVAILABLE],
      minPrice: 200000,
    };

    render(
      <FilterPanel
        {...defaultProps}
        filters={activeFilters}
        onFiltersChange={handleChange}
      />
    );

    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);

    expect(handleChange).toHaveBeenCalledWith({});
  });

  it('should toggle panel expansion', () => {
    render(<FilterPanel {...defaultProps} />);

    const toggleButton = screen.getByText('▼');
    fireEvent.click(toggleButton);

    expect(screen.getByText('▶')).toBeInTheDocument();
  });

  it('should reflect selected filters in checkboxes', () => {
    const activeFilters: HouseFilters = {
      status: [HouseStatus.AVAILABLE],
      amenities: ['Pool'],
    };

    render(<FilterPanel {...defaultProps} filters={activeFilters} />);

    const availableCheckbox = screen.getByLabelText('available') as HTMLInputElement;
    const poolCheckbox = screen.getByLabelText('Pool') as HTMLInputElement;

    expect(availableCheckbox.checked).toBe(true);
    expect(poolCheckbox.checked).toBe(true);
  });
});
