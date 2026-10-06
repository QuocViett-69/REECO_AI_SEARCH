import React from 'react';
import { useFavorite } from '../../context/FavoriteContext';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../services/commercialService';
import { sizedImage } from '../../services/images';
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  X,
} from '@phosphor-icons/react';
import '../../styles/studio/account.css';

export function FavoriteList({ onNavigate, onViewDetail }) {
  const { favorites, removeFavorite } = useFavorite();
  const { addToCart } = useCart();

  const handleAddToCart = (item) => {
    addToCart(item, 1);
  };

  const openItem = (item) => (
    onViewDetail ? onViewDetail(item.model) : onNavigate && onNavigate(`detail:${item.model}`)
  );

  if (favorites.length === 0) {
    return (
      <div className="st-page st-page--narrow ac-page">
        <div className="st-state">
          <div className="st-orb st-orb--live" aria-hidden="true">
            <span className="st-orb__icon"><Heart size={20} /></span>
          </div>
          <h1 className="st-state__title">No favorites yet</h1>
          <p className="st-state__desc">
            Save instruments, loggers and probes while you browse to compare and order them later.
          </p>
          <div className="st-state__actions">
            <button type="button" className="st-btn st-btn--primary" onClick={() => onNavigate && onNavigate('products')}>
              Browse products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="st-page ac-page">
      <button type="button" className="st-back" onClick={() => onNavigate && onNavigate('products')}>
        <ArrowLeft size={16} aria-hidden="true" /> Back to products
      </button>

      <header className="st-header">
        <div className="st-header__title">
          <h1>Favorites</h1>
        </div>
        <div className="st-header__aside">
          <p>
            {favorites.length} {favorites.length === 1 ? 'product' : 'products'} you saved while browsing.
            Add them to your cart when you are ready to order.
          </p>
        </div>
      </header>

      <ul className="ac-favs">
        {favorites.map((item) => (
          <li key={item.product_id} className="ac-fav">
            <div className="st-plate" onClick={() => openItem(item)}>
              {item.image ? (
                <img src={sizedImage(item.image, 480)} alt="" loading="lazy" />
              ) : (
                <span className="st-plate__fallback">{item.model}</span>
              )}
              <button
                type="button"
                className="st-btn st-btn--icon st-btn--sm ac-fav__remove"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(item.product_id);
                }}
                aria-label={`Remove ${item.model} from favorites`}
                title="Remove from favorites"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>

            <div className="ac-fav__body">
              <h2 className="ac-fav__title">
                <button type="button" className="ac-fav__model" onClick={() => openItem(item)}>
                  {item.model}
                </button>
              </h2>
              <p className="ac-fav__name" title={item.name}>{item.name}</p>
              <div className="ac-fav__foot">
                <span className="ac-fav__price">{formatPrice(item.price, item.currency)}</span>
                <button
                  type="button"
                  className="st-btn st-btn--primary st-btn--buy st-btn--sm"
                  onClick={() => handleAddToCart(item)}
                >
                  <ShoppingCart size={14} aria-hidden="true" /> Add to cart
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FavoriteList;
