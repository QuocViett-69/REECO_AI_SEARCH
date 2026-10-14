import React, { useState } from 'react';
import { ArrowUp } from '@phosphor-icons/react';
import { Floating, FloatingElement } from '../fancy/ParallaxFloating';

const FEATURED_PRODUCTS = [
  { model: 'CSAT3B-NC', name: 'CSAT3B 3-D Sonic Anemometer', image: 'https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_460/5805' },
  { model: 'CS301', name: 'Apogee SP-110-SS Pyranometer', image: 'https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_460/11307' },
  { model: 'ClimaVue50G2', name: 'Compact Digital Weather Sensor', image: 'https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/15290' },
  { model: 'TempVue50', name: 'TempVue 50', image: 'https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_920/14775' },
  { model: 'BaroVue10', name: 'Digital Barometer', image: 'https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_460/13865' },
  { model: 'ClariVue10', name: 'ClariVue 10', image: 'https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_920/13165' },
  { model: 'CS451', name: 'Stainless-Steel Pressure Transducer', image: 'https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_460/179' },
  { model: 'CS655', name: 'Water Content Reflectometer Plus', image: 'https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/4883' },
];

export function SearchHero({ onSearch, onViewDetail }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (/[\p{L}\p{N}]/u.test(query)) {
      onSearch(query.trim());
    }
  };

  const handleProductClick = (product) => {
    if (onViewDetail) {
      onViewDetail(product.model);
    } else {
      onSearch(product.model);
    }
  };

  const SUGGESTED_KEYWORDS = [
    'CR1000X Datalogger',
    'Cảm biến thời tiết',
    'Đo gió 3D CSAT3B',
    'Mực nước CS451',
    'Độ ẩm đất CS655',
    'Khí tượng thủy văn',
  ];

  return (
    <div className="genie-hero-stage">
      {/* Full-bleed atmospheric cloud backdrop */}
      <div className="hero-sky-backdrop" aria-hidden="true" />

      {/* Floating parallax product images */}
      <Floating sensitivity={-1} className="hero-floating-products-container">
        {FEATURED_PRODUCTS.map((product, idx) => (
          <FloatingElement
            key={product.model}
            depth={idx === 6 ? 3 : idx === 2 || idx === 5 ? 2 : idx === 0 ? 0.5 : 1}
            className={`floating-slot-${idx}`}
          >
            <div
              className={`floating-product-card ${idx === 2 || idx === 6 ? 'floating-card-large' : ''}`}
              onClick={() => handleProductClick(product)}
              title={`${product.model} — ${product.name}`}
            >
              <img
                src={product.image}
                alt={product.model}
                className="floating-product-img"
                loading="lazy"
              />
              <span className="floating-product-badge">{product.model}</span>
            </div>
          </FloatingElement>
        ))}
      </Floating>

      {/* Origin/Genie Editorial Hero Center Content */}
      <div className="origin-hero-content">
        {/* 1. Display Headline with Serif Italic */}
        <h1 className="origin-hero-headline">
          <em>Find</em> your instrument.
        </h1>

        {/* 2. Editorial Subhead */}
        <p className="origin-hero-subhead">
          <strong>Campbell AI is your personal technical instrument advisor.</strong>
          <span>Search precision sensors, dataloggers, and telemetry systems to match your application—all in one place.</span>
        </p>

        {/* 3. Frosted Capsule Search Bar with Circle Arrow Up Button */}
        <form className="origin-search-form" onSubmit={handleSubmit}>
          <div className="origin-search-bar">
            <input
              type="text"
              id="searchInput"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm cảm biến khí tượng, quan trắc mực nước, datalogger..."
              autoComplete="off"
            />
            <button
              type="submit"
              className="origin-search-arrow-btn"
              title="Tìm kiếm"
              id="searchBtn"
            >
              <ArrowUp size={20} weight="bold" />
            </button>
          </div>
        </form>

        {/* 4. Keyword Suggestion Buttons Underneath Search Bar */}
        <div className="genie-suggestions">
          <span className="suggestions-label">Gợi ý từ khóa:</span>
          {SUGGESTED_KEYWORDS.map((kw) => (
            <button
              key={kw}
              type="button"
              className="genie-suggestion-chip"
              onClick={() => onSearch(kw)}
            >
              {kw}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
