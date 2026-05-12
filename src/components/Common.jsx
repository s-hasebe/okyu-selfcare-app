import { useNavigate } from 'react-router-dom';

// ── BackButton ─────────────────────────────────────────────────
export function BackButton({ label = '戻る' }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className="btn-ghost flex items-center gap-1 text-sm py-1 px-2"
      style={{ color: 'var(--color-text-secondary)' }}
      aria-label={label}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  );
}

// ── PageHeader ─────────────────────────────────────────────────
export function PageHeader({ title, showBack = true }) {
  return (
    <header className="page-header">
      {showBack && <BackButton />}
      <h1
        className="flex-1 text-center truncate text-base"
        style={{
          fontFamily: 'var(--font-display-ja)',
          color: 'var(--color-text-primary)',
          letterSpacing: '0.08em',
          paddingRight: showBack ? '2.5rem' : '0',
        }}
      >
        {title}
      </h1>
    </header>
  );
}

// ── LoadingSpinner ─────────────────────────────────────────────
export function LoadingSpinner({ message = '読み込み中...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div
        className="w-10 h-10 border-4 rounded-full animate-spin"
        style={{ borderColor: 'var(--color-border-default)', borderTopColor: 'var(--color-brand-primary)' }}
      />
      <p className="text-sm" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-label)' }}>
        {message}
      </p>
    </div>
  );
}

// ── EmptyState ─────────────────────────────────────────────────
export function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center animate-fade-up">
      {icon && <span className="text-5xl">{icon}</span>}
      <p className="font-bold text-lg" style={{ fontFamily: 'var(--font-display-ja)', color: 'var(--color-text-primary)', letterSpacing: '0.1em' }}>
        {title}
      </p>
      {description && (
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body-ja)' }}>
          {description}
        </p>
      )}
    </div>
  );
}

// ── DifficultyBadge ────────────────────────────────────────────
const DIFFICULTY_MAP = {
  easy:   { label: '◎ 特定しやすい', cls: 'badge' },
  medium: { label: '○ 基準点タップ', cls: 'badge' },
  hard:   { label: '△ やや複雑',     cls: 'badge' },
};
const DIFFICULTY_COLORS = {
  easy:   { color: '#34d399' },
  medium: { color: 'var(--color-brand-light)' },
  hard:   { color: '#f87171' },
};

export function DifficultyBadge({ difficulty }) {
  const d = DIFFICULTY_MAP[difficulty] || DIFFICULTY_MAP.medium;
  const c = DIFFICULTY_COLORS[difficulty] || DIFFICULTY_COLORS.medium;
  return (
    <span
      className={d.cls}
      style={{ color: c.color, borderColor: c.color + '44', background: c.color + '15' }}
    >
      {d.label}
    </span>
  );
}
