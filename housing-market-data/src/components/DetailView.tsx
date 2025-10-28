import { House } from '../types/House';

interface DetailViewProps {
  house: House | null;
  onClose: () => void;
}

export function DetailView({ house, onClose }: DetailViewProps) {
  if (!house) return null;

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>

        <div className="detail-images">
          <div className="main-image">
            <img src={house.images[0]} alt={house.address} />
          </div>
          <div className="thumbnail-images">
            {house.images.slice(1).map((image, index) => (
              <img key={index} src={image} alt={`${house.address} ${index + 2}`} />
            ))}
          </div>
        </div>

        <div className="detail-content">
          <div className="detail-header">
            <h1 className="price">${house.price.toLocaleString()}</h1>
            <span className={`status-badge ${house.status}`}>
              {house.status.replace('_', ' ')}
            </span>
          </div>

          <h2 className="address">{house.address}</h2>

          <div className="detail-specs">
            <div className="spec-item">
              <span className="spec-label">Bedrooms</span>
              <span className="spec-value">{house.bedrooms}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Bathrooms</span>
              <span className="spec-value">{house.bathrooms}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Square Footage</span>
              <span className="spec-value">{house.squareFootage.toLocaleString()}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Property Type</span>
              <span className="spec-value">{house.propertyType}</span>
            </div>
            {house.lotSize && (
              <div className="spec-item">
                <span className="spec-label">Lot Size</span>
                <span className="spec-value">{house.lotSize.toLocaleString()} sqft</span>
              </div>
            )}
            {house.yearBuilt && (
              <div className="spec-item">
                <span className="spec-label">Year Built</span>
                <span className="spec-value">{house.yearBuilt}</span>
              </div>
            )}
            {house.mlsNumber && (
              <div className="spec-item">
                <span className="spec-label">MLS #</span>
                <span className="spec-value">{house.mlsNumber}</span>
              </div>
            )}
          </div>

          <div className="detail-section">
            <h3>Description</h3>
            <p>{house.description}</p>
          </div>

          <div className="detail-section">
            <h3>Amenities</h3>
            <div className="amenities-grid">
              {house.amenities.map((amenity, index) => (
                <span key={index} className="amenity-tag">{amenity}</span>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <h3>Property Details</h3>
            <div className="detail-dates">
              <div>
                <span className="label">Listed:</span>
                <span>{new Date(house.listedDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="label">Last Modified:</span>
                <span>{new Date(house.lastModified).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {house.floorPlanLink && (
            <div className="detail-actions">
              <a
                href={house.floorPlanLink}
                target="_blank"
                rel="noopener noreferrer"
                className="floor-plan-link"
              >
                View Floor Plan
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
