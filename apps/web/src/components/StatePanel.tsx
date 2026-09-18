import type { ReactNode } from 'react';

interface StatePanelProps {
  title: string;
  description?: string;
  tone?: 'neutral' | 'error';
  action?: ReactNode;
}

export function StatePanel({
  title,
  description,
  tone = 'neutral',
  action,
}: StatePanelProps) {
  return (
    <section
      className={`state-panel state-${tone}`}
      role={tone === 'error' ? 'alert' : undefined}
    >
      <div className="state-symbol" aria-hidden="true">
        {tone === 'error' ? '!' : '·'}
      </div>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {action}
    </section>
  );
}

export function LoadingPanel({ label = 'Loading…' }: { label?: string }) {
  return (
    <section className="state-panel" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <h2>{label}</h2>
    </section>
  );
}
