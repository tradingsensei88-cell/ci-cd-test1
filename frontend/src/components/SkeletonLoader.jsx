import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="skeleton-card-wrapper glass-panel" key={Math.random()}>
            <div className="skeleton skeleton-image" />
            <div className="skeleton-content">
              <div className="skeleton skeleton-text" style={{ width: '40%' }} />
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-text" style={{ width: '30%', height: '12px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                <div className="skeleton skeleton-text" style={{ width: '50%', height: '24px', marginBottom: 0 }} />
                <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
              </div>
            </div>
            <style>{`
              .skeleton-card-wrapper {
                padding: 0;
                overflow: hidden;
              }
              .skeleton-content {
                padding: 20px;
              }
            `}</style>
          </div>
        );
      case 'detail':
        return (
          <div className="skeleton-detail-wrapper container" key={Math.random()}>
            <div className="detail-grid">
              <div className="skeleton skeleton-image" style={{ height: '450px' }} />
              <div className="detail-info">
                <div className="skeleton skeleton-text" style={{ width: '20%', height: '20px' }} />
                <div className="skeleton skeleton-title" style={{ height: '40px', width: '80%' }} />
                <div className="skeleton skeleton-text" style={{ width: '30%', height: '20px', marginBottom: '24px' }} />
                <div className="skeleton skeleton-text" style={{ height: '100px' }} />
                <div className="skeleton skeleton-text" style={{ width: '50%', height: '40px', margin: '30px 0' }} />
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="skeleton" style={{ width: '150px', height: '50px', borderRadius: '8px' }} />
                  <div className="skeleton" style={{ width: '150px', height: '50px', borderRadius: '8px' }} />
                </div>
              </div>
            </div>
            <style>{`
              .detail-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 48px;
                margin-top: 40px;
              }
              @media (max-width: 768px) {
                .detail-grid {
                  grid-template-columns: 1fr;
                }
              }
            `}</style>
          </div>
        );
      case 'list':
      default:
        return (
          <div className="skeleton-list-wrapper" key={Math.random()}>
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text" />
          </div>
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          {renderSkeleton()}
        </React.Fragment>
      ))}
    </>
  );
};

export default SkeletonLoader;
