import React, { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Floating, FloatingElement } from '../fancy/ParallaxFloating';
import { masterProducts } from '../../data/masterProducts';

// 8 featured products selected from real masterProducts data
const FEATURED_MODELS = [
  'CSAT3B-NC',   // 0: top-[8%] left-[9%] (depth: 0.5) - 3D Sonic Anemometer
  'CS301',       // 1: top-[9%] left-[28%] (depth: 1) - Solar Pyranometer
  'ClimaVue50G2',// 2: top-[2%] left-[52%] (depth: 2) - All-in-One Weather
  'TempVue50',   // 3: top-[2%] left-[81%] (depth: 1) - Precision Temp
  'BaroVue10',   // 4: top-[38%] left-[3%] (depth: 1) - Digital Barometer
  'ClariVue10',  // 5: top-[66%] left-[77%] (depth: 2) - Turbidity Sensor
  'CS451',       // 6: top-[70%] left-[13%] (depth: 3) - Water Level & Pressure
  'CS655',       // 7: top-[76%] left-[47%] (depth: 1) - Soil Moisture Probe
];

export function SearchHero({ onSearch, onViewDetail }) {
  const [query, setQuery] = useState('');

  // Extract products from masterProducts
  const featuredProducts = FEATURED_MODELS.map((model) => {
    const found = masterProducts.find((p) => p.model === model);
    return (
      found || {
        model,
        name: model,
        image: 'https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_460/179',
        category: 'Sensors',
      }
    );
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
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

      {/* Floating Parallax Product Images from masterProducts data */}
      <Floating sensitivity={-1} className="hero-floating-products-container">
        {featuredProducts.map((product, idx) => (
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
          <span>Search 40+ precision sensors, dataloggers, and telemetry systems to match your application—all in one place.</span>
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
              <ArrowUp size={20} />
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
