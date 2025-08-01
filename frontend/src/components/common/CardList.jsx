import React from 'react';

const CardList = ({ 
  data, 
  renderCard, 
  loading = false,
  emptyMessage = "No hay datos disponibles",
  onCardClick 
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="card p-4 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-neutral-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-text-secondary">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div
          key={index}
          className={`card p-4 ${
            onCardClick ? 'cursor-pointer hover:shadow-md' : ''
          } transition-shadow duration-200`}
          onClick={() => onCardClick && onCardClick(item)}
        >
          {renderCard(item)}
        </div>
      ))}
    </div>
  );
};

export default CardList;
