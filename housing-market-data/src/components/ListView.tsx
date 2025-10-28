import { House } from '../types/House';

interface ListViewProps {
  houses: House[];
  selectedHouse: House | null;
  onHouseSelect: (house: House) => void;
}

export function ListView({ houses, selectedHouse, onHouseSelect }: ListViewProps) {
  return (
    <div className="list-container">
      <div className="list-header">
        <h2>Properties ({houses.length})</h2>
      </div>
      <div className="list-items">
        {houses.length === 0 ? (
          <div className="no-results">
            <p>No properties match your filters</p>
          </div>
        ) : (
          houses.map(house => (
            <div
              key={house.id}
              className={`list-item ${selectedHouse?.id === house.id ? 'selected' : ''}`}
              onClick={() => onHouseSelect(house)}
            >
              <div className="list-item-image">
                <img src={house.images[0]} alt={house.address} />
                <span className={`status-badge ${house.status}`}>
                  {house.status.replace('_', ' ')}
                </span>
              </div>
              <div className="list-item-content">
                <h3 className="price">${house.price.toLocaleString()}</h3>
                <p className="address">{house.address}</p>
                <div className="specs">
                  <span>{house.bedrooms} bed</span>
                  <span>•</span>
                  <span>{house.bathrooms} bath</span>
                  <span>•</span>
                  <span>{house.squareFootage.toLocaleString()} sqft</span>
                </div>
                <div className="property-type">{house.propertyType}</div>
                {house.amenities.length > 0 && (
                  <div className="amenities-preview">
                    {house.amenities.slice(0, 3).join(' • ')}
                    {house.amenities.length > 3 && ` +${house.amenities.length - 3}`}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
