import React, { useState, useEffect } from 'react';
import { recommendationService } from '../../services/recommendationService';
import { formatPrice } from '../../services/commercialService';
import { Sparkles, ShoppingCart, Eye, Plus, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export function RecommendationRow({ productId, model, onViewDetail }) {
  const { addToCart } = useCart();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedMap, setAddedMap] = useState({});

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    recommendationService
      .getProductRecommendations(productId, model)
      .then((items) => {
        if (isMounted) {
          setRecommendations(items);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId, model]);

  if (loading) {
    return (
      <div style={{ marginTop: 36, paddingTop: 28, borderTop: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Sparkles size={18} color="#0069e0" />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>
            You may also need
          </h3>
        </div>
        <div style={{ fontSize: 13, color: '#6b7280' }}>Loading recommendations...</div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  const handleAddToCart = (item) => {
    addToCart(
      {
        product_id: item.product_id,
        model: item.model,
        name: item.name,
        image: item.image,
        price: item.price,
        currency: item.currency || 'USD',
      },
      1
    );

    setAddedMap((prev) => ({ ...prev, [item.model]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [item.model]: false }));
    }, 2000);
  };

  return (
    <div style={{ marginTop: 36, paddingTop: 28, borderTop: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <Sparkles size={18} color="#0069e0" />
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>
          You may also need
        </h3>
        <span style={{ fontSize: 11, background: 'rgba(0, 105, 224, 0.08)', color: '#0069e0', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
          AI Recommended
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        {recommendations.map((item) => {
          const isAdded = !!addedMap[item.model];

          return (
            <div
              key={item.model}
              style={{
                padding: 16,
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: '#ffffff',
                border: '1px solid #e5e7eb',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0069e0' }}>
                    {item.model}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: '#535862',
                      background: '#f3f4f6',
                      padding: '2px 8px',
                      borderRadius: 4,
                      maxWidth: 150,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={item.reason}
                  >
                    {item.reason}
                  </span>
                </div>

                <h4 style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '0 0 8px', lineHeight: 1.4 }}>
                  {item.name}
                </h4>

                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 14 }}>
                  {formatPrice(item.price, item.currency)}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => onViewDetail && onViewDetail(item.model)}
                  style={{
                    padding: '8px 10px',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    background: '#ffffff',
                    color: '#111827',
                    border: '1px solid #e5e7eb',
                    borderRadius: 9999,
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  <Eye size={13} /> View
                </button>

                <button
                  type="button"
                  onClick={() => handleAddToCart(item)}
                  style={{
                    padding: '8px 10px',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    background: isAdded ? '#0f9554' : '#111827',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 9999,
                    cursor: 'pointer',
                    fontWeight: 500,
                    transition: 'background 0.2s',
                  }}
                >
                  {isAdded ? <Check size={13} /> : <ShoppingCart size={13} />}
                  <span>{isAdded ? 'Added!' : 'Add to Cart'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RecommendationRow;
