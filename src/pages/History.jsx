import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, EmptyState } from '../components/Common';
import { useHistory } from '../hooks/useHistory';
import { formatDuration } from '../utils/storage';

const AREA_EMOJI = { 手腕: '🤚', 足下腿: '🦵', 腹部胸部: '🫁', 背中肩: '🫙' };

export default function History() {
  const navigate = useNavigate();
  const { history, remove } = useHistory();
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const grouped = groupByDate(history);
  const totalMin = Math.round(history.reduce((s, h) => s + h.durationSec, 0) / 60);

  return (
    <div className="page">
      <PageHeader title="施灸の記録" />

      <main className="page-content">
        {history.length === 0 ? (
          <EmptyState
            icon="📋"
            title="まだ記録がありません"
            description="お灸を行ったら「記録する」ボタンから記録を追加できます"
          />
        ) : (
          <div className="space-y-6 animate-fade-up">

            {/* ── 統計サマリー ── */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard emoji="🔥" value={history.length} unit="回" label="TOTAL SESSIONS" />
              <StatCard emoji="⏱️" value={totalMin} unit="min" label="TOTAL TIME" />
            </div>

            {/* ── 日付別リスト ── */}
            {Object.entries(grouped).map(([date, entries]) => (
              <section key={date}>
                <p
                  className="section-title mb-3"
                  style={{ fontFamily: 'var(--font-label)', color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}
                >
                  {date}
                </p>
                <div className="space-y-2">
                  {entries.map((entry) => (
                    <HistoryCard
                      key={entry.id}
                      entry={entry}
                      isConfirmDelete={confirmDeleteId === entry.id}
                      onTap={() => navigate(`/tsubo/${entry.tsuboId}`)}
                      onDeleteRequest={() => setConfirmDeleteId(entry.id)}
                      onDeleteConfirm={() => { remove(entry.id); setConfirmDeleteId(null); }}
                      onDeleteCancel={() => setConfirmDeleteId(null)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ emoji, value, unit, label }) {
  return (
    <div
      className="rounded-xl p-4 text-center relative overflow-hidden"
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-default)',
        boxShadow: 'var(--glow-inner)',
      }}
    >
      <span className="text-3xl block mb-1">{emoji}</span>
      <p style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-label)', fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
        {value}
        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginLeft: '2px' }}>{unit}</span>
      </p>
      <p style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-label)', fontSize: '0.6rem', letterSpacing: '0.1em', marginTop: '2px' }}>
        {label}
      </p>
    </div>
  );
}

function HistoryCard({ entry, isConfirmDelete, onTap, onDeleteRequest, onDeleteConfirm, onDeleteCancel }) {
  const time = new Date(entry.startedAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  const duration = formatDuration(entry.durationSec);

  return (
    <div
      className="rounded-xl p-4 flex items-start gap-3 relative cursor-pointer transition-all duration-200"
      style={{
        background: 'var(--color-bg-surface)',
        border: `1px solid ${isConfirmDelete ? 'rgba(220,38,38,0.30)' : 'var(--color-border-default)'}`,
      }}
      onClick={!isConfirmDelete ? onTap : undefined}
    >
      {/* アイコン */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-default)' }}
      >
        {AREA_EMOJI[entry.bodyArea] || '💊'}
      </div>

      {/* 情報 */}
      <div className="flex-1 min-w-0">
        <p style={{ fontFamily: 'var(--font-display-ja)', color: 'var(--color-text-primary)', letterSpacing: '0.06em', fontSize: '0.9rem' }}>
          {entry.tsuboName}
        </p>
        <p
          className="text-xs mt-0.5"
          style={{ fontFamily: 'var(--font-label)', color: 'var(--color-text-muted)', letterSpacing: '0.04em' }}
        >
          {time} · {duration}{entry.bodyArea && ` · ${entry.bodyArea}`}
        </p>
        {entry.memo && (
          <p className="text-xs mt-1 truncate" style={{ color: 'var(--color-text-muted)' }}>
            📝 {entry.memo}
          </p>
        )}
      </div>

      {/* 削除 */}
      {!isConfirmDelete ? (
        <button
          onClick={(e) => { e.stopPropagation(); onDeleteRequest(); }}
          className="text-lg flex-shrink-0 p-1 transition-opacity opacity-40 hover:opacity-80"
          aria-label="削除"
        >
          🗑
        </button>
      ) : (
        <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button onClick={onDeleteConfirm} className="badge-red cursor-pointer">削除</button>
          <button onClick={onDeleteCancel} className="badge cursor-pointer">キャンセル</button>
        </div>
      )}
    </div>
  );
}

function groupByDate(history) {
  const groups = {};
  history.forEach((entry) => {
    const d = new Date(entry.startedAt);
    const label = d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
    if (!groups[label]) groups[label] = [];
    groups[label].push(entry);
  });
  return groups;
}

