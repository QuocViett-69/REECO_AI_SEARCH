import React from 'react';
import { useFavorite } from '../../context/FavoriteContext';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../services/commercialService';
import { Heart, ShoppingCart, Eye, Trash2, ArrowLeft } from 'lucide-react';

export function FavoriteList({ onNavigate, onViewDetail }) {
  const { favorites, removeFavorite } = useFavorite();
  const { addToCart } = useCart();

  const handleAddToCart = (item) => {
    addToCart(item, 1);
  };

  if (favorites.length === 0) {
    return (
      <div className="page-container" style={{ maxWidth: 800, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="glass-card" style={{ padding: '60px 20px', borderRadius: 16 }}>
          <div
            style={{
              display: 'inline-flex',
              padding: 20,
              borderRadius: '50%',
              background: 'rgba(255, 68, 68, 0.08)',
              color: '#ff6b6b',
              marginBottom: 20,
            }}
          >
            <Heart size={48} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-1, #fff)', marginBottom: 8 }}>
            No Saved Favorites Yet
          </h2>
          <p style={{ color: 'var(--text-3, #888)', fontSize: 14, maxWidth: 420, margin: '0 auto 28px' }}>
            Bookmark measurement instruments, loggers, and probes while browsing to review them later.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onNavigate && onNavigate('products')}
            style={{ padding: '12px 28px', fontSize: 15 }}
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 1080, margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('products')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: 'none',
              color: 'var(--text-3, #888)',
              cursor: 'pointer',
              fontSize: 13,
              marginBottom: 8,
            }}
          >
            <ArrowLeft size={14} /> Back to Catalog
          </button>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-1, #fff)', margin: 0 }}>
            My Favorites ({favorites.length})
          </h1>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 20,
        }}
      >
        {favorites.map((item) => (
          <div
            key={item.product_id}
            className="glass-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: 20,
              borderRadius: 14,
              position: 'relative',
            }}
          >
            {/* Remove Favorite Button */}
            <button
              type="button"
              onClick={() => removeFavorite(item.product_id)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#ff6b6b',
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              title="Remove from favorites"
            >
              <Trash2 size={14} />
            </button>

            {/* Image Preview */}
            <div
              style={{
                width: '100%',
                height: 140,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                overflow: 'hidden',
              }}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.model}
                  style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text-3, #666)' }}>No Image</div>
              )}
            </div>

            {/* Model & Availability */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent, #00d2ff)' }}>
                {item.model}
              </span>
              <span
                style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: 'rgba(0, 200, 115, 0.08)',
                  color: '#00c873',
                  border: '1px solid rgba(0, 200, 115, 0.2)',
                }}
              >
                {item.availability_label || 'Available for order'}
              </span>
            </div>

            {/* Title */}
            <h3
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--text-1, #fff)',
                margin: '0 0 12px',
                flexGrow: 1,
                lineHeight: 1.4,
              }}
            >
              {item.name}
            </h3>

            {/* Price */}
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1, #fff)', marginBottom: 16 }}>
              {formatPrice(item.price, item.currency)}
            </div>

            {/* Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onViewDetail ? onViewDetail(item.model) : onNavigate && onNavigate(`detail:${item.model}`)}
                style={{
                  padding: '9px 12px',
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Eye size={14} /> View
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleAddToCart(item)}
                style={{
                  padding: '9px 12px',
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <ShoppingCart size={14} /> Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FavoriteList;
