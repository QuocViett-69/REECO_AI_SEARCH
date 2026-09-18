import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Search, SlidersHorizontal, ArrowRight } from 'lucide-react';

const SUGGESTIONS = [
  'Soil moisture sensor with SDI-12',
  'Environmental monitoring datalogger',
  'Cellular device for remote monitoring',
  'Water level sensor',
  'Temperature probe',
];

const FLOAT_CONFIGS = [
  {
    model: 'CR6',
    image: 'https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_920/11919',
    top: '12%',
    left: '4%',
    width: '110px',
    depth: 0.5,
  },
  {
    model: 'CS655',
    image: 'https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/4883',
    top: '15%',
    left: '88%',
    width: '120px',
    depth: 1.0,
  },
  {
    model: 'RV50X',
    image: 'https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/7892',
    top: '65%',
    left: '3%',
    width: '130px',
    depth: 2.0,
  },
  {
    model: 'ClariVue10',
    image: 'https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_920/13165',
    top: '55%',
    left: '92%',
    width: '110px',
    depth: 1.0,
  },
  {
    model: 'CR310',
    image: 'https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_920/11631',
    top: '85%',
    left: '12%',
    width: '95px',
    depth: 0.8,
  },
  {
    model: 'RangeVue30',
    image: 'https://res.cloudinary.com/campbellsci/image/upload/f_auto,q_80,w_620/14971',
    top: '35%',
    left: '94%',
    width: '125px',
    depth: 1.5,
  },
];

export function SearchHero({ onSearch }) {
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const elements = containerRef.current.querySelectorAll('.floating-element');
      const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      const mouseY = (e.clientY / window.innerHeight) * 2 - 1;

      elements.forEach((el) => {
        const depth = parseFloat(el.getAttribute('data-depth') || '1');
        const moveX = mouseX * depth * -30;
        const moveY = mouseY * depth * -30;
        el.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="search-hero">
      <div className="floating-container" ref={containerRef}>
        {FLOAT_CONFIGS.map((item) => (
          <div
            key={item.model}
            className="floating-element"
            data-depth={item.depth}
            title={`${item.model} - Click to search`}
            onClick={() => onSearch(item.model)}
            style={{
              top: item.top,
              left: item.left,
              width: item.width,
              height: item.width,
              zIndex: Math.floor(item.depth * 10),
              opacity: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '16px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              userSelect: 'none',
              transition: 'transform 0.15s ease-out, box-shadow 0.2s',
              padding: '10px',
              position: 'absolute',
              cursor: 'pointer',
            }}
          >
            <img
              src={item.image}
              alt={item.model}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '8px',
                pointerEvents: 'none',
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                const placeholder = e.target.parentElement.querySelector('.float-fallback');
                if (placeholder) placeholder.style.display = 'block';
              }}
            />
            <div
              className="float-fallback"
              style={{ display: 'none', fontWeight: 700, fontSize: '13px', color: 'var(--primary)' }}
            >
              {item.model}
            </div>
            <span
              style={{
                position: 'absolute',
                bottom: '-8px',
                backgroundColor: 'rgba(44, 44, 44, 0.88)',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '600',
                letterSpacing: '0.3px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                whiteSpace: 'nowrap',
              }}
            >
              {item.model}
            </span>
          </div>
        ))}
      </div>

      <div className="search-hero-badge">
        <Sparkles size={16} /> AI-Powered Search
      </div>

      <h1>
        Find the right<br />
        <span className="gradient-text">Campbell product</span>
      </h1>

      <p>
        Describe what you need in natural language, or search by model, application, or technical
        requirement.
      </p>

      <form className="search-bar-wrap" onSubmit={handleSubmit}>
        <div className="search-bar">
          <div className="search-icon">
            <Search size={18} />
          </div>
          <input
            type="text"
            id="searchInput"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. soil moisture sensor with SDI-12 output..."
          />
          <button
            type="button"
            className="filter-btn"
            title="Filters"
            onClick={() => onSearch(query || 'Sensors')}
          >
            <SlidersHorizontal size={18} />
          </button>
          <button type="submit" className="search-btn" id="searchBtn">
            Search
            <ArrowRight size={16} />
          </button>
        </div>
      </form>

      <div className="suggestions">
        <span className="suggestions-label">Try:</span>
        {SUGGESTIONS.map((sug) => (
          <div
            key={sug}
            className="suggestion-chip"
            onClick={() => {
              setQuery(sug);
              onSearch(sug);
            }}
          >
            {sug}
          </div>
        ))}
      </div>
    </div>
  );
}
