import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { Check, ShoppingCart } from '@phosphor-icons/react';

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
      className={`st-btn st-btn--primary st-btn--buy ${justAdded ? 'is-added' : ''} ${className}`}
      onClick={handleClick}
      style={style}
      title="Add to shopping cart"
      aria-label={showLabel ? undefined : justAdded ? `Added ${product.model || ''} to cart` : `Add ${product.model || ''} to cart`}
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
