import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  ArrowsLeftRight,
  ChatCircleText,
  Check,
  MagnifyingGlassMinus,
  PencilSimple,
  CaretDown,
  SealCheck,
  Warning,
  WifiSlash,
  X,
} from '@phosphor-icons/react';

import { FavoriteButton } from '../commerce/FavoriteButton';
import { AddToCartButton } from '../commerce/AddToCartButton';
import { formatPrice, getProductPrice } from '../../services/commercialService';
import { sizedImage } from '../../services/images';
import { explainProductFit } from '../../services/productFitService';
import '../../styles/studio/discovery.css';

// Readable names for evidence fields, in English and Vietnamese.
const evidenceLabels = {
  model: ['Model', 'Model'],
  measurements: ['Measures', 'Đại lượng đo'],
  capabilities: ['Capabilities', 'Khả năng'],
  applications: ['Applications', 'Ứng dụng'],
  'taxonomy.device_type': ['Device type', 'Loại thiết bị'],
  'taxonomy.category': ['Category', 'Danh mục'],
  supported_protocols: ['Supported interface', 'Giao tiếp hỗ trợ'],
  unsupported_protocols: ['Unsupported interface', 'Giao tiếp không hỗ trợ'],
  operating_temperature_range: ['Operating range', 'Dải hoạt động'],
  temperature_measurement_range: ['Measurement range', 'Dải đo'],
  measurement_temperature_range: ['Measurement range', 'Dải đo'],
  ingress_protection: ['Environmental protection', 'Bảo vệ môi trường'],
};

// ─── Parse a matched_feature string into a human-readable chip ────────────────
function parseFeatureChip(feature) {
  if (!feature) return null;
  const parts = feature.split(':');
  if (parts.length >= 2) {
    const type = parts[0];
    const rest = parts.slice(1).join(':');
    if (type === 'identity') {
      const subParts = rest.split(':');
      return subParts.length >= 2 ? `${capitalize(subParts[0])}: ${subParts.slice(1).join(':')}` : rest;
    }
    if (type === 'protocol') return rest;
    if (type === 'operating-temperature') return `Operating temperature ${rest}`;
    if (type === 'measurement-temperature') return `Measures temperature ${rest}`;
    return `${capitalize(type)}: ${rest}`;
  }
  return feature;
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

// Evidence carries the matched fact; its field becomes a readable label in the result's language.
function matchReasons(p) {
  if (p.explanation?.evidence?.length > 0) {
    const vi = p.explanation.language === 'vi';
    return p.explanation.evidence.map((item) => {
      const label = evidenceLabels[item.field]?.[vi ? 1 : 0] || item.field.replaceAll('_', ' ');
      return {
        label: `${label}: ${item.value}`,
        title: item.source ? `${item.field} (${item.source})` : item.field,
      };
    });
  }
  return (p.matched_features || []).slice(0, 5).map((f) => ({ label: parseFeatureChip(f), title: f }));
}

function ExplanationSource({ explanation }) {
  if (!explanation?.source) return null;
  const vi = explanation.language === 'vi';
  const llm = explanation.source === 'llm';
  return (
    <span className={`explanation-source res-source ${llm ? 'res-source--ai' : ''}`}>
      {vi ? (llm ? 'AI hỗ trợ diễn đạt' : 'Dựa trên dữ liệu') : llm ? 'AI-assisted wording' : 'Product evidence'}
    </span>
  );
}

function joinModels(models, vi) {
  if (models.length < 2) return models.join('');
  return `${models.slice(0, -1).join(', ')} ${vi ? 'và' : 'and'} ${models[models.length - 1]}`;
}

// When the API sends no guidance, the answer is summarised from the explanations and evidence
// it returned for the top results; nothing is added beyond that evidence.
function summarizeResults(results, query) {
  const top = results.filter((p) => p.explanation?.text).slice(0, 3);
  if (top.length === 0) return null;
  const vi = top[0].explanation.language
    ? top[0].explanation.language === 'vi'
    : /[ăâđêôơư]|[\u1ea0-\u1ef9]/iu.test(query || '');
  // Evidence values are often bilingual ("soil moisture / độ ẩm đất"); keep the reader's language.
  const inLanguage = (value) => {
    const parts = String(value).split(' / ');
    return parts.length === 2 ? parts[vi ? 1 : 0] : String(value);
  };
  const valueSets = top.map((p) => new Set((p.explanation.evidence || []).map((item) => inLanguage(item.value))));
  const shared = [...valueSets[0]].filter((value) => valueSets.every((set) => set.has(value))).slice(0, 3);
  const models = joinModels(top.map((p) => p.model), vi);
  const many = top.length > 1;
  let text;
  if (shared.length) {
    const facts = joinModels(shared, vi);
    text = vi
      ? `${models} phù hợp với yêu cầu của bạn vì dữ liệu sản phẩm xác nhận ${facts}.`
      : `${models} ${many ? 'fit' : 'fits'} your request: product data confirms ${facts}.`;
  } else {
    text = vi
      ? `${models} ${many ? 'là các lựa chọn' : 'là lựa chọn'} phù hợp nhất với yêu cầu của bạn.`
      : `${models} ${many ? 'are the closest matches' : 'is the closest match'} for your request.`;
  }
  const reasons = top.map((p) => {
    // Explanations often open with "MODEL: "; the model is already shown beside the reason.
    const reason = p.explanation.text.replace(new RegExp(`^${p.model.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[:\\-–]\\s*`, 'i'), '');
    return { model: p.model, text: reason.charAt(0).toUpperCase() + reason.slice(1) };
  });
  // Identical reasons would only repeat the summary line.
  const distinct = new Set(reasons.map((reason) => reason.text)).size > 1;
  return { text, language: vi ? 'vi' : 'en', derived: true, reasons: distinct ? reasons : [] };
}

// The AI's overall answer for the request: why these results fit, and which instruments
// cover each part of a multi-instrument system.
function GuidancePanel({ guidance, onViewDetail }) {
  const vi = guidance.language === 'vi';
  return (
    <section className="res-answer" aria-label={vi ? 'Giải thích nhu cầu' : 'Search guidance'}>
      <p className="res-answer__who">
        <span className="st-orb st-orb--live" aria-hidden="true" />
        Campbell AI
        {guidance.derived && (
          <span className="res-answer__basis">{vi ? 'Tóm tắt từ dữ liệu sản phẩm' : 'Summarised from product data'}</span>
        )}
      </p>
      <p className="res-answer__text">{guidance.text}</p>
      {guidance.reasons?.length > 0 && (
        <ul className="res-answer__parts">
          {guidance.reasons.map((reason, index) => (
            <li key={`${reason.model}-${index}`}>
              <button
                type="button"
                className="st-tag res-answer__model res-answer__label-btn"
                onClick={() => onViewDetail && onViewDetail(reason.model)}
              >
                {reason.model}
              </button>
              <span className="res-answer__reason">{reason.text}</span>
            </li>
          ))}
        </ul>
      )}
      {guidance.components?.length > 0 && (
        <ul className="res-answer__parts">
          {guidance.components.map((component) => (
            <li key={component.query}>
              <span className="res-answer__label">{component.label}</span>
              {component.models.length > 0 ? (
                <span className="res-answer__models">
                  {component.models.map((model) => (
                    <button
                      key={model}
                      type="button"
                      className="st-tag res-answer__model"
                      onClick={() => onViewDetail && onViewDetail(model)}
                    >
                      {model}
                    </button>
                  ))}
                </span>
              ) : (
                <span className="res-answer__none">
                  {component.needs_clarification
                    ? vi ? 'Cần làm rõ đại lượng hoặc môi trường đo' : 'Clarify the measurement or medium'
                    : vi ? 'Chưa có ứng viên được xác nhận trong kết quả' : 'No confirmed candidate in these results'}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ModeNote({ mode }) {
  if (!mode || mode === 'hybrid') return null;
  return (
    <p className="st-note res-mode">
      <Warning size={16} aria-hidden="true" />
      {mode === 'keyword'
        ? 'Matched by keywords only. Meaning-based search is offline, so similar wording may be missed.'
        : 'Matched by meaning only. Keyword search is offline, so exact model numbers may rank lower.'}
    </p>
  );
}

function ProductPlate({ product, width }) {
  return (
    <div className="st-plate">
      {product.image ? (
        <img
          src={sizedImage(product.image, width)}
          alt=""
          onError={(e) => {
            e.target.style.display = 'none';
            const placeholder = e.target.parentElement.querySelector('.st-plate__fallback');
            if (placeholder) placeholder.style.display = 'flex';
          }}
        />
      ) : null}
      <div className="st-plate__fallback" style={{ display: product.image ? 'none' : 'flex' }}>
        {product.model}
      </div>
    </div>
  );
}

// Why one recommended model fits the request, shown right under its row
function FitPanel({ id, product, fit, onClose }) {
  const data = fit.data;
  const vi = data?.language === 'vi';
  return (
    <section className="res-fit" id={id} aria-label={`Why ${product.model} fits`} aria-live="polite">
      <div className="res-fit__head">
        <span className="res-fit__icon" aria-hidden="true"><ChatCircleText size={16} /></span>
        <p className="res-fit__title">
          {vi ? `Vì sao ${product.model} phù hợp với nhu cầu của bạn` : `Why ${product.model} fits your request`}
        </p>
        <button type="button" className="res-fit__close" onClick={onClose} aria-label="Close explanation">
          <X size={14} />
        </button>
      </div>

      {fit.status === 'loading' && (
        <div className="res-fit__loading" role="status" aria-label="Loading explanation">
          <span className="st-skeleton res-skeleton-line" />
          <span className="st-skeleton res-skeleton-line res-skeleton-line--short" />
        </div>
      )}

      {fit.status === 'error' && (
        <p className="res-fit__error" role="alert">
          <Warning size={15} aria-hidden="true" />
          {vi ? 'Chưa tải được phần giải thích. Hãy thử lại sau.' : 'The explanation could not be loaded. Try again in a moment.'}
        </p>
      )}

      {fit.status === 'done' && data && (
        <>
          <p className="res-fit__summary">{data.summary}</p>
          {(data.confirmed.length > 0 || data.unconfirmed.length > 0) && (
            <div className="res-fit__grid">
              {data.confirmed.length > 0 && (
                <div>
                  <p className="res-fit__label">{vi ? 'Dữ liệu sản phẩm xác nhận' : 'Confirmed by product data'}</p>
                  <ul className="res-fit__list">
                    {data.confirmed.map((item, i) => (
                      <li key={`${item.label}-${i}`}>
                        <Check size={14} aria-hidden="true" />
                        <span><strong>{item.label}:</strong> {item.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {data.unconfirmed.length > 0 && (
                <div>
                  <p className="res-fit__label">{vi ? 'Chưa được xác nhận' : 'Not confirmed yet'}</p>
                  <ul className="res-fit__list res-fit__list--open">
                    {data.unconfirmed.map((text, i) => (
                      <li key={`${text}-${i}`}>
                        <Warning size={14} aria-hidden="true" />
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {data.source && (
            <p className="res-fit__source">
              {data.source === 'llm'
                ? vi ? 'AI hỗ trợ diễn đạt, dựa trên dữ liệu sản phẩm' : 'AI-assisted wording, grounded in product data'
                : vi ? 'Dựa trên dữ liệu sản phẩm' : 'Based on product data'}
            </p>
          )}
        </>
      )}
    </section>
  );
}

// One question and Campbell AI's answer: the explanation first, then the products it
// recommends, best match on top.
function ChatTurn({
  turn,
  turnRef,
  isLatest,
  onViewDetail,
  onToggleCompare,
  isInCompare,
  onEditSearch,
}) {
  const [filterCategory, setFilterCategory] = useState('');
  // Inline "why this model fits" panels, keyed by product: { status, data, error }
  const [fits, setFits] = useState({});
  const results = turn.results || [];

  const toggleFit = async (product) => {
    const key = product.product_id || product.model;
    if (fits[key]) {
      setFits((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return;
    }
    setFits((prev) => ({ ...prev, [key]: { status: 'loading' } }));
    try {
      const data = await explainProductFit({ product, query: turn.query, resolvedQuery: turn.resolvedQuery });
      setFits((prev) => (prev[key] ? { ...prev, [key]: { status: 'done', data } } : prev));
    } catch (error) {
      setFits((prev) => (prev[key] ? { ...prev, [key]: { status: 'error', error } } : prev));
    }
  };
  const loading = turn.status === 'loading';
  const categories = Array.from(new Set(results.map((p) => p.category).filter(Boolean)));
  const visible = results.filter((p) => !filterCategory || p.category === filterCategory);
  const answer = loading || turn.error ? null : turn.guidance || summarizeResults(visible, turn.query);

  return (
    <li className="chat-turn" ref={turnRef}>
      <div className="chat-user">
        <p className="chat-bubble">{turn.query}</p>
      </div>

      <div className="chat-ai">
        <span className={`st-orb chat-ai__avatar ${loading ? 'st-orb--live' : ''}`} aria-hidden="true" />
        <div className="chat-ai__body">
          <p className="chat-ai__name">Campbell AI</p>

          {loading ? (
            <div aria-busy="true">
              <p className="chat-thinking" role="status">
                Matching instruments to your request
                <span className="chat-thinking__dots" aria-hidden="true"><i /><i /><i /></span>
              </p>
              <ol className="res-list">
                {[1, 2].map((n) => (
                  <li key={n} className="res-row">
                    <span className="st-skeleton res-skeleton-plate" />
                    <div className="res-row__body">
                      <span className="st-skeleton res-skeleton-line res-skeleton-line--title" />
                      <span className="st-skeleton res-skeleton-line" />
                      <span className="st-skeleton res-skeleton-line res-skeleton-line--short" />
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ) : turn.error ? (
            <div className="chat-note chat-note--error" role="alert">
              {turn.error.error === 'unavailable' ? <WifiSlash size={18} aria-hidden="true" /> : <Warning size={18} aria-hidden="true" />}
              <div>
                <p className="chat-note__title">
                  {turn.error.error === 'invalid_input' ? 'This search could not be read' : 'Search is unavailable right now'}
                </p>
                <p>{turn.error.message}</p>
              </div>
            </div>
          ) : (
            <>
              {turn.resolvedQuery && turn.resolvedQuery !== turn.query && (
                <p className="res-resolved">Searching for <strong>{turn.resolvedQuery}</strong></p>
              )}
              <ModeNote mode={turn.mode} />

              {answer && <GuidancePanel guidance={answer} onViewDetail={onViewDetail} />}

              {results.length === 0 ? (
                <div className="chat-note">
                  <MagnifyingGlassMinus size={18} aria-hidden="true" />
                  <div>
                    <p className="chat-note__title">No products match this request</p>
                    <p>Describe what you need to measure, or ask for a model number such as CR1000X.</p>
                    {isLatest && onEditSearch && (
                      <button type="button" className="st-btn st-btn--sm chat-note__action" onClick={onEditSearch}>
                        <PencilSimple size={14} /> New search
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <section className="chat-picks" aria-label="Recommended products">
                  <div className="chat-picks__head">
                    <p className="chat-picks__title">
                      Recommended products <span className="st-tab__count">{visible.length}</span>
                    </p>
                    {categories.length > 1 && (
                      <div className="st-tabs" role="group" aria-label="Category">
                        <button type="button" className="st-tab" aria-pressed={!filterCategory} onClick={() => setFilterCategory('')}>
                          All <span className="st-tab__count">{results.length}</span>
                        </button>
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            className="st-tab"
                            aria-pressed={filterCategory === cat}
                            onClick={() => setFilterCategory(filterCategory === cat ? '' : cat)}
                          >
                            {cat} <span className="st-tab__count">{results.filter((p) => p.category === cat).length}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <ol className="res-list">
                    {visible.map((p, index) => {
                      const inCompare = isInCompare ? isInCompare(p.model) : false;
                      const price = p.price ?? getProductPrice(p.product_id, p.model);
                      const priceLabel = price != null ? formatPrice(price, p.currency) : 'Price on request';
                      const reasons = matchReasons(p);
                      const isBest = index === 0 && !filterCategory;
                      const fitKey = p.product_id || p.model;
                      const fit = fits[fitKey];
                      const fitId = `fit-${turn.id}-${fitKey}`.replace(/[^a-zA-Z0-9_-]/g, '-');

                      return (
                        <li key={p.product_id || p.model} className={`res-row ${isBest ? 'res-row--best' : ''}`} data-model={p.model}>
                          <ProductPlate product={p} width={isBest ? 480 : 320} />
                          <div className="res-row__body">
                            {isBest ? (
                              <p className="res-row__flag"><SealCheck size={14} aria-hidden="true" /> Best match</p>
                            ) : (
                              <p className="res-row__rank">#{index + 1}</p>
                            )}
                            <p className="res-row__path">{p.subcategory || p.deviceType}</p>
                            <h2 className="res-row__model">
                              <button type="button" className="res-link" onClick={() => onViewDetail(p.model)}>
                                {p.model}
                              </button>
                            </h2>
                            <p className="res-row__name">{p.name}</p>
                            {p.explanation?.text && (
                              <p className="res-row__explain">
                                {p.explanation.text} <ExplanationSource explanation={p.explanation} />
                              </p>
                            )}
                            {reasons.length > 0 && (
                              <ul className="res-reasons" aria-label="Why it matches">
                                {reasons.map((reason, i) => (
                                  <li key={`${reason.label}-${i}`} className="st-tag" title={reason.title}>
                                    <Check size={13} aria-hidden="true" /> {reason.label}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div className="res-row__buy">
                            <span className="res-row__price">{priceLabel}</span>
                            <div className="res-actions" role="group" aria-label={`Actions for ${p.model}`}>
                              <AddToCartButton product={{ ...p, price }} className="st-btn--sm" label="Add to cart" size={15} />
                              {onToggleCompare && (
                                <button
                                  type="button"
                                  className={`st-btn st-btn--icon st-btn--sm ${inCompare ? 'is-on' : ''}`}
                                  onClick={() => onToggleCompare(p.model)}
                                  aria-pressed={inCompare}
                                  aria-label={inCompare ? `Remove ${p.model} from compare` : `Add ${p.model} to compare`}
                                  title={inCompare ? 'Remove from compare' : 'Add to compare'}
                                >
                                  {inCompare ? <Check size={15} /> : <ArrowsLeftRight size={15} />}
                                </button>
                              )}
                              <FavoriteButton product={{ ...p, price }} className="st-btn--icon st-btn--sm" size={15} />
                            </div>
                            <button
                              type="button"
                              className={`st-btn st-btn--ghost st-btn--sm res-explain ${fit ? 'is-open' : ''}`}
                              aria-expanded={Boolean(fit)}
                              aria-controls={fitId}
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleFit(p);
                              }}
                            >
                              <ChatCircleText size={15} aria-hidden="true" />
                              {fit ? 'Hide explanation' : 'Explain this model for my needs'}
                              <CaretDown size={13} aria-hidden="true" className="res-explain__caret" />
                            </button>
                          </div>

                          {fit && (
                            <FitPanel id={fitId} product={p} fit={fit} onClose={() => toggleFit(p)} />
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </li>
  );
}

export function SearchResults({
  thread,
  query,
  resolvedQuery,
  guidance,
  results = [],
  mode,
  searchError,
  isLoading,
  onEditSearch,
  onFollowUp,
  onViewDetail,
  onToggleCompare,
  isInCompare,
}) {
  const [draft, setDraft] = useState('');
  const latestRef = useRef(null);

  // Without a thread (older callers, tests) the latest search is shown as a single turn
  const turns = thread && thread.length > 0
    ? thread
    : [{
        id: 'single',
        query,
        status: isLoading ? 'loading' : 'done',
        results,
        guidance,
        mode,
        error: searchError,
        resolvedQuery,
      }];
  const busy = Boolean(isLoading) || turns.some((turn) => turn.status === 'loading');

  // Bring each new follow-up into view, like a chat
  const turnCount = turns.length;
  useEffect(() => {
    if (turnCount > 1 && latestRef.current?.scrollIntoView) {
      latestRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [turnCount]);

  const submit = (event) => {
    event.preventDefault();
    const next = draft.trim();
    if (!next || busy || !onFollowUp) return;
    setDraft('');
    onFollowUp(next);
  };

  return (
    <div id="searchResults" className="st-page chat">
      <header className="chat-head">
        <p className="chat-head__title">
          <span className="st-orb" aria-hidden="true" /> Campbell AI Search
        </p>
        {onEditSearch && (
          <button type="button" className="st-btn st-btn--sm" onClick={onEditSearch}>
            <PencilSimple size={14} /> New search
          </button>
        )}
      </header>

      <ol className="chat-thread" aria-label="Conversation">
        {turns.map((turn, index) => (
          <ChatTurn
            key={turn.id}
            turn={turn}
            turnRef={index === turns.length - 1 ? latestRef : null}
            isLatest={index === turns.length - 1}
            onViewDetail={onViewDetail}
            onToggleCompare={onToggleCompare}
            isInCompare={isInCompare}
            onEditSearch={onEditSearch}
          />
        ))}
      </ol>

      <form className="chat-composer" onSubmit={submit}>
        <label htmlFor="search-follow-up" className="sr-only">Ask a follow-up question</label>
        <input
          id="search-follow-up"
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask a follow-up, e.g. and supports Modbus"
          maxLength={500}
          disabled={busy}
          autoComplete="off"
        />
        <button type="submit" disabled={busy || !draft.trim()} aria-label="Send">
          <ArrowUp size={18} />
        </button>
      </form>
      <p className="chat-composer__hint">Campbell AI answers from Campbell Scientific product data. Check the specifications before ordering.</p>
    </div>
  );
}
