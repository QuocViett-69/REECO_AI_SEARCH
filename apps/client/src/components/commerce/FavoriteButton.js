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
      className={`btn btn-secondary favorite-btn ${active ? 'btn-added' : ''} ${className}`}
      onClick={handleClick}
      style={style}
      title={active ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        size={size}
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        className={active ? 'icon-active' : ''}
      />
      {showLabel && (
        <span>
          {active ? 'Favorited' : 'Favorite'}
        </span>
      )}
    </button>
  );
}

export default FavoriteButton;
