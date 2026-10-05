import React, { useState, useEffect } from 'react';
import { recommendationService } from '../../services/recommendationService';
import { formatPrice } from '../../services/commercialService';
import { ArrowUpRight, Check, ShoppingCart } from '@phosphor-icons/react';
import { useCart } from '../../context/CartContext';

// What the relationship means to a buyer; the orb tint follows it.
const RELATION = {
  compatible: { label: 'Works with this', orb: 'st-orb--violet' },
  compatible_sensor: { label: 'Compatible sensor', orb: 'st-orb--violet' },
  complementary: { label: 'Pairs well', orb: 'st-orb--ember' },
  alternative: { label: 'Alternative', orb: '' },
};

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
      <section className="rc" aria-busy="true">
        <div className="rc__head">
          <h2 className="st-heading">You may also need</h2>
        </div>
        <p className="rc__loading" role="status">Loading recommendations</p>
      </section>
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
        currency: item.currency || 'VND',
      },
      1
    );

    setAddedMap((prev) => ({ ...prev, [item.model]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [item.model]: false }));
    }, 2000);
  };

  return (
    <section className="rc" aria-labelledby="rc-title">
      <div className="rc__head">
        <h2 id="rc-title" className="st-heading">You may also need</h2>
        <p>Picked by the AI from technical compatibility with {model}.</p>
      </div>

      <ul className="rc__grid">
        {recommendations.map((item) => {
          const isAdded = !!addedMap[item.model];
          const relation = RELATION[item.type] || RELATION.compatible;

          return (
            <li key={item.model} className="rc__item">
              <div className="rc__item-top">
                <span className="st-tag st-tag--outline">{relation.label}</span>
                <span className={`st-orb ${relation.orb}`} aria-hidden="true" />
              </div>
              <h3 className="rc__model">{item.model}</h3>
              {item.name && item.name !== item.model && <p className="rc__reason">{item.name}</p>}
              <p className="rc__reason">{item.reason}</p>

              <div className="rc__foot">
                <span className="rc__price">{formatPrice(item.price, item.currency)}</span>
                <div className="rc__actions" role="group" aria-label={`Actions for ${item.model}`}>
                  <button
                    type="button"
                    className={`st-btn st-btn--primary st-btn--sm ${isAdded ? 'is-added' : ''}`}
                    onClick={() => handleAddToCart(item)}
                  >
                    {isAdded ? <Check size={15} /> : <ShoppingCart size={15} />}
                    <span>{isAdded ? 'Added' : 'Add to cart'}</span>
                  </button>
                  <button
                    type="button"
                    className="st-btn st-btn--sm st-btn--icon"
                    onClick={() => onViewDetail && onViewDetail(item.model)}
                    aria-label={`View ${item.model}`}
                    title={`View ${item.model}`}
                  >
                    <ArrowUpRight size={15} />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default RecommendationRow;
