import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Check } from 'lucide-react';

export function AddToCartButton({
  product,
  quantity = 1,
  className = '',
  style = {},
  size = 15,
  showLabel = true,
  label = 'Add to Cart',
  onAdded,
}) {
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const handleClick = (e) => {
    e.stopPropagation();
    addToCart(product, quantity);
    setJustAdded(true);
    if (onAdded) onAdded(product, quantity);
    setTimeout(() => {
      setJustAdded(false);
    }, 1500);
  };

  return (
    <button
      type="button"
      className={`btn ${justAdded ? 'btn-success' : 'btn-primary'} ${className}`}
      onClick={handleClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: '8px 14px',
        fontSize: 13,
        fontWeight: 600,
        borderRadius: 6,
        transition: 'all 0.2s ease',
        ...style,
      }}
      title="Add to shopping cart"
    >
      {justAdded ? (
        <>
          <Check size={size} />
          {showLabel && <span>Added</span>}
        </>
      ) : (
        <>
          <ShoppingCart size={size} />
          {showLabel && <span>{label}</span>}
        </>
      )}
    </button>
  );
}

export default AddToCartButton;
