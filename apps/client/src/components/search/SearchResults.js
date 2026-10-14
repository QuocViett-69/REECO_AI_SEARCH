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
} from '../common/SkyIconSet';

import { FavoriteButton } from '../commerce/FavoriteButton';
import { AddToCartButton } from '../commerce/AddToCartButton';
import { formatPrice, getDisplayPrice } from '../../services/commercialService';
import { sizedImage } from '../../services/images';
import { explainProductFit } from '../../services/productFitService';
import '../../styles/studio/discovery.css';

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
  const models = joinModels(top.map((p) => p.model), vi);
  const many = top.length > 1;
  const text = vi
    ? `${models} ${many ? 'là các kết quả' : 'là kết quả'} đầu tiên. Đối chiếu đại lượng đo và các yêu cầu chưa được xác nhận trong phần giải thích bên dưới.`
    : `${models} ${many ? 'are the first results' : 'is the first result'}. Compare documented measurements and unconfirmed requirements in the explanations below.`;
  return { text, language: vi ? 'vi' : 'en' };
}

// The AI's overall answer for the request: why these results fit, and which instruments
// cover each part of a multi-instrument system.
function GuidancePanel({ guidance, onViewDetail }) {
  const vi = guidance.language === 'vi';
  return (
    <section className="res-answer" aria-label={vi ? 'Giải thích nhu cầu' : 'Search guidance'}>
      <p className="res-answer__who">
        <span className="res-answer__basis">{vi ? 'Tóm tắt từ dữ liệu sản phẩm' : 'Summarised from product data'}</span>
      </p>
      <p className="res-answer__text">{guidance.text}</p>
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

// Product evidence for the request, shown right under its row.
function FitPanel({ id, product, fit, onClose }) {
  const data = fit.data;
  const vi = (data?.language || product.explanation?.language) === 'vi';
  return (
    <section className="res-fit" id={id} aria-label={`Evidence for ${product.model}`} aria-live="polite">
      <div className="res-fit__head">
        <span className="res-fit__icon" aria-hidden="true"><ChatCircleText size={16} /></span>
        <p className="res-fit__title">
          {vi ? `Đối chiếu ${product.model} với nhu cầu của bạn` : `Compare ${product.model} with your request`}
        </p>
        <button type="button" className="res-fit__close" onClick={onClose} aria-label={vi ? 'Đóng giải thích' : 'Close explanation'}>
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
          <div className="res-fit__summary">
            {data.summary.split(/\n+|(?<=[.!?])\s+/u).map((sentence, i) => <p key={i}>{sentence}</p>)}
          </div>
          {data.confirmed.length > 0 && (
            <details className="res-fit__evidence">
              <summary>{vi ? 'Xem dữ liệu đối chiếu' : 'View supporting product data'} <CaretDown size={14} aria-hidden="true" /></summary>
              <div className="res-fit__grid">
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
            </details>
          )}
          {[
            ['matched', vi ? 'Yêu cầu đã xác nhận' : 'Confirmed requirements'],
            ['unconfirmed', vi ? 'Chưa được xác nhận' : 'Not confirmed yet'],
            ['mismatched', vi ? 'Không đáp ứng theo dữ liệu' : 'Requirements not met according to product data'],
          ].map(([key, label]) => data[key]?.length > 0 && (
            <div className="res-fit__pending" key={key}>
              <p className="res-fit__label">{label}</p>
              <ul className="res-fit__list res-fit__list--open">
                {data[key].map((text, i) => (
                  <li key={`${text}-${i}`}>
                    {key === 'matched' ? <Check size={14} aria-hidden="true" /> : <Warning size={14} aria-hidden="true" />}
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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

// Groups show search order; rank alone does not establish suitability.
const TIERS = [
  { key: 'best', level: 3, label: 'First result', meter: 'Rank #1', hint: 'Review the documented evidence and remaining requirements' },
  { key: 'strong', level: 2, label: 'Next results', meter: 'Ranks #2–3', hint: 'Compare measurements and specifications' },
  { key: 'more', level: 1, label: 'More results', meter: 'Rank #4+', hint: 'Additional results to compare' },
];

function tierFor(index) {
  if (index === 0) return TIERS[0];
  if (index <= 2) return TIERS[1];
  return TIERS[2];
}

// Three bars, filled up to the tier's level
function MatchMeter({ level }) {
  const name = TIERS.find((tier) => tier.level === level)?.meter;
  return (
    <span className={`res-meter res-meter--${level}`} role="img" aria-label={`Search order: ${name}`}>
      <span className="res-meter__bars" aria-hidden="true"><i /><i /><i /></span>
    </span>
  );
}

function PickCard({ product: p, rank, tier, isBest, vi, fit, fitId, onToggleFit, onViewDetail, onToggleCompare, isInCompare }) {
  const inCompare = isInCompare ? isInCompare(p.model) : false;
  const price = getDisplayPrice(p);
  const priceLabel = price != null ? formatPrice(price, p.currency) : vi ? 'Liên hệ báo giá' : 'Price on request';
  const compact = tier.key === 'more';

  return (
    <li className={`res-row res-row--${tier.key} ${isBest ? 'res-row--best' : ''}`} data-model={p.model} data-rank={rank}>
      <ProductPlate product={p} width={isBest ? 640 : 320} />
      <div className="res-row__body">
        <div className="res-row__top">
          {isBest ? (
            <p className="res-row__flag"><SealCheck size={14} aria-hidden="true" /> {vi ? 'Kết quả đầu tiên' : tier.label}</p>
          ) : (
            <p className="res-row__rank">#{rank}</p>
          )}
        </div>
        <p className="res-row__path">{p.subcategory || p.deviceType}</p>
        <h2 className="res-row__model">
          <button type="button" className="res-link" onClick={() => onViewDetail(p.model)}>
            {p.model}
          </button>
        </h2>
        <p className="res-row__name">{p.name || p.name_en || p.name_vi}</p>
        {p.explanation?.text && (
          <div className="res-row__insight">
            <p className="res-row__explain">{p.explanation.text.split(/(?<=[.!?])\s+/u)[0]}</p>
            <ExplanationSource explanation={p.explanation} />
          </div>
        )}
      </div>
      <div className="res-row__buy">
        <span className="res-row__price">{priceLabel}</span>
        <div className="res-actions" role="group" aria-label={`Actions for ${p.model}`}>
          <AddToCartButton
            product={{ ...p, price }}
            className={compact ? 'st-btn--icon st-btn--sm' : isBest ? '' : 'st-btn--sm'}
            showLabel={!compact}
            label={vi ? 'Thêm vào giỏ' : 'Add to cart'}
            size={compact ? 15 : 16}
          />
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
            onToggleFit();
          }}
        >
          <ChatCircleText size={15} aria-hidden="true" />
          {vi ? (fit ? 'Ẩn giải thích' : 'Giải thích theo nhu cầu') : fit ? 'Hide explanation' : 'Explain this model for my needs'}
          <CaretDown size={13} aria-hidden="true" className="res-explain__caret" />
        </button>
      </div>

      {fit && <FitPanel id={fitId} product={p} fit={fit} onClose={onToggleFit} />}
    </li>
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
  const vi = (answer?.language || results[0]?.explanation?.language) === 'vi';

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
                <section className="chat-picks" aria-label="Search results">
                  <div className="chat-picks__head">
                    <p className="chat-picks__title">
                      {vi ? 'Sản phẩm tìm thấy' : 'Search results'} <span className="st-tab__count">{visible.length}</span>
                    </p>
                    {categories.length > 1 && (
                      <div className="st-tabs" role="group" aria-label="Category">
                        <button type="button" className="st-tab" aria-pressed={!filterCategory} onClick={() => setFilterCategory('')}>
                          {vi ? 'Tất cả' : 'All'} <span className="st-tab__count">{results.length}</span>
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

                  {TIERS.map((tier) => {
                    const picks = visible
                      .map((p, index) => ({ p, index }))
                      .filter(({ index }) => tierFor(index) === tier);
                    if (picks.length === 0) return null;
                    return (
                      <section key={tier.key} className={`res-tier res-tier--${tier.key}`} aria-label={tier.label}>
                        {tier.key !== 'best' && (
                          <header className="res-tier__head">
                            <MatchMeter level={tier.level} />
                            <p className="res-tier__title">{vi ? (tier.key === 'strong' ? 'Kết quả tiếp theo' : 'Khám phá thêm') : tier.label}</p>
                            <p className="res-tier__hint">{vi ? 'Mở giải thích để đối chiếu với nhu cầu của bạn' : tier.hint}</p>
                          </header>
                        )}
                        <ol className={`res-list res-list--${tier.key}`} start={picks[0].index + 1}>
                          {picks.map(({ p, index }) => {
                            const fitKey = p.product_id || p.model;
                            return (
                              <PickCard
                                key={fitKey}
                                product={p}
                                rank={index + 1}
                                tier={tier}
                                isBest={tier.key === 'best' && !filterCategory}
                                vi={vi}
                                fit={fits[fitKey]}
                                fitId={`fit-${turn.id}-${fitKey}`.replace(/[^a-zA-Z0-9_-]/g, '-')}
                                onToggleFit={() => toggleFit(p)}
                                onViewDetail={onViewDetail}
                                onToggleCompare={onToggleCompare}
                                isInCompare={isInCompare}
                              />
                            );
                          })}
                        </ol>
                      </section>
                    );
                  })}
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
  const latest = turns[turns.length - 1];
  const vi = (latest.guidance?.language || latest.results?.[0]?.explanation?.language) === 'vi';

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
            <PencilSimple size={14} /> {vi ? 'Tìm kiếm mới' : 'New search'}
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
        <div className="chat-composer__box">
          <label htmlFor="search-follow-up" className="sr-only">{vi ? 'Bổ sung nhu cầu tìm kiếm' : 'Ask a follow-up question'}</label>
          <input
            id="search-follow-up"
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={vi ? 'Bổ sung nhu cầu, ví dụ: hỗ trợ Modbus…' : 'Ask a follow-up, e.g. and supports Modbus'}
            maxLength={500}
            disabled={busy}
            autoComplete="off"
          />
          <button type="submit" disabled={busy || !draft.trim()} aria-label={vi ? 'Gửi' : 'Send'}>
            <ArrowUp size={18} />
          </button>
        </div>
      </form>
      <p className="chat-composer__hint">{vi ? 'Thông tin dựa trên dữ liệu Campbell Scientific. Đối chiếu thông số trước khi đặt hàng.' : 'Campbell AI answers from Campbell Scientific product data. Check the specifications before ordering.'}</p>
    </div>
  );
}
