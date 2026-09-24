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
      <div style={{ marginTop: 36, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Sparkles size={18} color="var(--accent, #00d2ff)" />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1, #fff)', margin: 0 }}>
            You may also need
          </h3>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-3, #888)' }}>Loading recommendations...</div>
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
    <div style={{ marginTop: 36, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <Sparkles size={18} color="var(--accent, #00d2ff)" />
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1, #fff)', margin: 0 }}>
          You may also need
        </h3>
        <span style={{ fontSize: 11, background: 'rgba(0, 210, 255, 0.1)', color: 'var(--accent, #00d2ff)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
          AI Recommended
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        {recommendations.map((item) => {
          const isAdded = !!addedMap[item.model];

          return (
            <div
              key={item.model}
              className="glass-card"
              style={{
                padding: 16,
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent, #00d2ff)' }}>
                    {item.model}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--text-2, #ccc)',
                      background: 'rgba(255,255,255,0.06)',
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

                <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1, #fff)', margin: '0 0 8px', lineHeight: 1.4 }}>
                  {item.name}
                </h4>

                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1, #fff)', marginBottom: 14 }}>
                  {formatPrice(item.price, item.currency)}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => onViewDetail && onViewDetail(item.model)}
                  style={{
                    padding: '8px 10px',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  }}
                >
                  <Eye size={13} /> View
                </button>

                <button
                  type="button"
                  className={`btn ${isAdded ? 'btn-success' : 'btn-primary'}`}
                  onClick={() => handleAddToCart(item)}
                  style={{
                    padding: '8px 10px',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
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
