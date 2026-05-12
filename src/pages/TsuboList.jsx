import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import tsuboData from '../data/tsubo.json';
import { PageHeader } from '../components/Common';

const BODY_AREAS = ['すべて', '手腕', '足下腿', '腹部胸部', '背中肩'];
const AREA_EMOJI = { 手腕: '🤚', 足下腿: '🦵', 腹部胸部: '🫁', 背中肩: '🫙' };

export default function TsuboList() {
  const navigate = useNavigate();
  const [selectedArea, setSelectedArea] = useState('すべて');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    let list = tsuboData;
    if (selectedArea !== 'すべて') list = list.filter((t) => t.bodyArea === selectedArea);
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      list = list.filter(
        (t) => t.name.includes(q) || t.reading.includes(q.toLowerCase()) || t.symptoms.some((s) => s.includes(q))
      );
    }
    return list;
  }, [selectedArea, searchQuery]);

  return (
    <div className="page">
      <PageHeader title="ツボ一覧" />

      {/* ── 検索バー ── */}
      <div
        className="px-4 pt-3 pb-2 sticky z-30"
        style={{ top: '53px', background: 'var(--color-bg-base)' }}
      >
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--color-text-muted)' }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            id="tsubo-search"
            type="search"
            placeholder="ツボ名・症状で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl focus:outline-none"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-default)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-body-ja)',
            }}
          />
        </div>
      </div>

      {/* ── カテゴリフィルター ── */}
      <div
        className="px-4 pb-3 sticky z-30"
        style={{ top: '109px', background: 'var(--color-bg-base)' }}
      >
        <div className="flex gap-2 overflow-x-auto pb-1">
          {BODY_AREAS.map((area) => (
            <button
              key={area}
              onClick={() => setSelectedArea(area)}
              className="flex-shrink-0 px-3 py-1.5 rounded-pill text-sm transition-all duration-150"
              style={{
                fontFamily: 'var(--font-label)',
                fontSize: '0.75rem',
                letterSpacing: '0.04em',
                borderRadius: 'var(--radius-pill)',
                ...(selectedArea === area
                  ? {
                      background: 'var(--color-brand-gradient)',
                      color: '#fff',
                      boxShadow: 'var(--glow-sm)',
                      border: 'none',
                    }
                  : {
                      background: 'var(--color-bg-elevated)',
                      color: 'var(--color-text-muted)',
                      border: '1px solid var(--color-border-default)',
                    }),
              }}
            >
              {area !== 'すべて' && AREA_EMOJI[area]}{' '}{area}
            </button>
          ))}
        </div>
      </div>

      {/* ── ツボ一覧 ── */}
      <main className="page-content space-y-3">
        <p
          className="text-xs mb-1"
          style={{ fontFamily: 'var(--font-label)', color: 'var(--color-text-muted)', letterSpacing: '0.06em' }}
        >
          {filtered.length} POINTS
        </p>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <span className="text-4xl">🔍</span>
            <p style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display-ja)', letterSpacing: '0.1em' }}>
              見つかりませんでした
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              検索ワードやカテゴリを変えてお試しください
            </p>
          </div>
        ) : (
          filtered.map((tsubo, i) => (
            <TsuboCard
              key={tsubo.id}
              tsubo={tsubo}
              index={i}
              onClick={() => navigate(`/tsubo/${tsubo.id}`)}
            />
          ))
        )}
      </main>
    </div>
  );
}

function TsuboCard({ tsubo, index, onClick }) {
  return (
    <button
      id={`tsubo-card-${tsubo.id}`}
      onClick={onClick}
      className="card-hover animate-fade-up"
      style={{ animationDelay: `${Math.min(index * 0.04, 0.3)}s` }}
    >
      <div className="flex items-start gap-4">
        {/* アイコン */}
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl mt-0.5"
          style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border-default)' }}
        >
          {AREA_EMOJI[tsubo.bodyArea] || '💊'}
        </div>

        <div className="flex-1 min-w-0">
          {/* 名前 + 禁忌バッジ */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="font-bold text-base"
              style={{ fontFamily: 'var(--font-display-ja)', color: 'var(--color-text-primary)', letterSpacing: '0.06em' }}
            >
              {tsubo.name}
            </span>
            <span
              className="text-xs"
              style={{ fontFamily: 'var(--font-label)', color: 'var(--color-text-muted)', letterSpacing: '0.04em' }}
            >
              {tsubo.reading}
            </span>
            {tsubo.isPregnancyForbidden && (
              <span className="badge-red">妊禁</span>
            )}
          </div>

          {/* 症状タグ */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tsubo.symptoms.slice(0, 3).map((s) => (
              <span key={s} className="tag">{s}</span>
            ))}
            {tsubo.symptoms.length > 3 && (
              <span className="tag">+{tsubo.symptoms.length - 3}</span>
            )}
          </div>
        </div>

        <svg
          className="w-4 h-4 flex-shrink-0 mt-2"
          style={{ color: 'var(--color-text-muted)' }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
