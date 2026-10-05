import React from 'react';
import { ArrowUpRight } from '@phosphor-icons/react';
import { PaperCutStation } from '../common/PaperCutStation';

// Closing band for every page except the home hero.
export function SiteFooter({ onNavigate }) {
  const links = [
    ['search', 'AI Search'],
    ['products', 'Products'],
    ['compare', 'Compare'],
    ['cart', 'Cart'],
    ['account', 'Account'],
  ];

  return (
    <footer className="st-footer">
      <div className="st-footer__inner">
        <div>
          <h2 className="st-footer__title">Not sure which sensor fits your station?</h2>
          <p className="st-footer__lede">
            Describe what you need to measure and where. Campbell AI matches it to the right
            instruments, dataloggers and power.
          </p>
          <button type="button" className="st-footer__cta" onClick={() => onNavigate('search')}>
            Ask Campbell AI
            <span aria-hidden="true"><ArrowUpRight size={18} /></span>
          </button>
        </div>
        <PaperCutStation className="st-footer__art" sun="#f0c95b" ink="#ffffff" />
      </div>

      <div className="st-footer__bar">
        <span>Campbell Scientific instruments, supplied in Vietnam by REECO</span>
        <nav aria-label="Footer">
          <ul className="st-footer__links">
            {links.map(([page, label]) => (
              <li key={page}>
                <button type="button" onClick={() => onNavigate(page)}>{label}</button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}

export default SiteFooter;
