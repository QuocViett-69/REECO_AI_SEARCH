import React from 'react';
import { useFavorite } from '../../context/FavoriteContext';
import { Heart } from 'lucide-react';

export function FavoriteButton({ product, className = '', style = {}, size = 16, showLabel = false }) {
  const { isFavorite, toggleFavorite } = useFavorite();
  if (!product) return null;

  const productId = product.product_id || product.id;
  const active = isFavorite(productId);

  const handleClick = (e) => {
    e.stopPropagation();
    toggleFavorite(product);
  };

  return (
    <button
      type="button"
      className={`favorite-btn ${active ? 'active' : ''} ${className}`}
      onClick={handleClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: showLabel ? '6px 12px' : '8px',
        borderRadius: 6,
        border: active ? '1px solid rgba(255, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
        background: active ? 'rgba(255, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.04)',
        color: active ? '#ff6b6b' : 'var(--text-3, #888)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ...style,
      }}
      title={active ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        size={size}
        fill={active ? '#ff6b6b' : 'none'}
        stroke={active ? '#ff6b6b' : 'currentColor'}
      />
      {showLabel && (
        <span style={{ fontSize: 13, fontWeight: 500 }}>
          {active ? 'Favorited' : 'Favorite'}
        </span>
      )}
    </button>
  );
}

export default FavoriteButton;
