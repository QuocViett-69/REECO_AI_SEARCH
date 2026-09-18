import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { formatApiError, humanizeFeature, searchProducts } from '../api/client';
import { ProductCard } from '../components/ProductCard';
import { LoadingPanel, StatePanel } from '../components/StatePanel';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim() ?? '';
  const [draft, setDraft] = useState(query);

  useEffect(() => setDraft(query), [query]);

  const search = useQuery({
    queryKey: ['search', query],
    queryFn: ({ signal }) => searchProducts({ query, limit: 10 }, signal),
    enabled: Boolean(query),
    retry: false,
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = draft.trim();
    if (nextQuery) setSearchParams({ q: nextQuery });
  }

  return (
    <div className="search-page">
      <section className="search-hero">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
        <div className="hero-content">
          <span className="eyebrow hero-eyebrow">
            Structured product intelligence
          </span>
          <h1>Find the right environmental monitoring product.</h1>
          <p>
            Search by model, measurement, protocol, application, or operating
            constraint.
          </p>
          <form className="search-box" onSubmit={handleSubmit}>
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Product search"
              maxLength={500}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Try “CS655”, “SDI-12”, or “soil sensor down to -40°C”"
              value={draft}
            />
            <button className="button button-primary" type="submit">
              Search
            </button>
          </form>
          <div className="search-suggestions">
            {[
              'CS655',
              'soil moisture sensor',
              'SDI-12',
              'operates at -40°C',
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setDraft(suggestion);
                  setSearchParams({ q: suggestion });
                }}
                type="button"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </section>

      {!query ? (
        <section className="feature-strip">
          <div>
            <strong>42</strong>
            <span>active products</span>
          </div>
          <div>
            <strong>Hybrid</strong>
            <span>keyword + semantic retrieval</span>
          </div>
          <div>
            <strong>Verified</strong>
            <span>structured technical evidence</span>
          </div>
        </section>
      ) : null}

      {query ? (
        <section className="results-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Search results</span>
              <h2>Results for “{query}”</h2>
            </div>
            {search.data ? (
              <span className={`mode mode-${search.data.mode}`}>
                {search.data.mode} retrieval
              </span>
            ) : null}
          </div>

          {search.isLoading ? (
            <LoadingPanel label="Searching the catalog…" />
          ) : null}
          {search.isError ? (
            <StatePanel
              action={
                <button
                  className="button button-primary"
                  onClick={() => void search.refetch()}
                  type="button"
                >
                  Retry
                </button>
              }
              description={formatApiError(search.error)}
              title="Search is unavailable"
              tone="error"
            />
          ) : null}
          {search.data?.mode === 'keyword' ? (
            <div className="notice">
              Semantic retrieval is temporarily unavailable. Results are from
              keyword fallback.
            </div>
          ) : null}
          {search.data && search.data.results.length === 0 ? (
            <StatePanel
              description="Try a model, a broader measurement, or a supported protocol."
              title="No matching products"
            />
          ) : null}
          {search.data?.results.length ? (
            <div className="result-list">
              {search.data.results.map((result) => (
                <div className="result-entry" key={result.product_id}>
                  <ProductCard product={result} />
                  {result.matched_features.length ? (
                    <div
                      className="evidence-row"
                      aria-label="Matched technical evidence"
                    >
                      <strong>Matched evidence</strong>
                      {result.matched_features.map((feature) => (
                        <span className="evidence" key={feature}>
                          {humanizeFeature(feature)}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
