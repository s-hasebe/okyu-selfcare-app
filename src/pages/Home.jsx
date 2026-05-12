import { useNavigate } from 'react-router-dom';
import { getHistory } from '../utils/storage';

export default function Home() {
  const navigate = useNavigate();
  const historyCount = getHistory().length;

  return (
    <div className="page hex-pattern">
      {/* ── Hero ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-between px-6 relative z-10">

        {/* Top spacer + logo */}
        <div className="mt-16 text-center animate-fade-up">
          {/* Logo icon */}
          <div className="mx-auto mb-6 logo-icon w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-glow-lg animate-glow-pulse">
            🔥
          </div>

          {/* Badge */}
          <div className="flex justify-center mb-5">
            <span className="badge">
              AR Selfcare · MVP
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl mb-4 leading-snug"
            style={{
              fontFamily: 'var(--font-display-ja)',
              letterSpacing: 'var(--tracking-ja-display)',
              color: 'var(--color-text-primary)',
            }}
          >
            お灸ガイド
          </h1>

          {/* Sub */}
          <p
            className="text-sm leading-relaxed max-w-xs mx-auto"
            style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body-ja)', letterSpacing: '0.05em', lineHeight: '1.9' }}
          >
            初心者でも迷わずツボを特定できる<br />
            ARセルフケアアシスタント
          </p>
        </div>

        {/* ── CTA Buttons ── */}
        <div className="w-full max-w-sm space-y-3 my-10 animate-fade-up delay-200">
          <button
            id="btn-find-tsubo"
            onClick={() => navigate('/tsubo')}
            className="btn-primary w-full text-lg py-5"
          >
            <span className="text-xl">🎯</span>
            ツボを探す
          </button>

          <button
            id="btn-view-history"
            onClick={() => navigate('/history')}
            className="btn-secondary w-full"
          >
            <span>📋</span>
            施灸の記録を見る
            {historyCount > 0 && (
              <span className="ml-auto badge-amber text-xs px-2 py-0.5">
                {historyCount}件
              </span>
            )}
          </button>
        </div>

        {/* Footer notes */}
        <div className="pb-10 text-center animate-fade-up delay-400">
          <div
            className="flex items-center gap-4 justify-center text-xs mb-2"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-label)' }}
          >
            <span>📷 カメラ不要で閲覧可</span>
            <span>·</span>
            <span>🔒 完全オフライン</span>
          </div>
          <p className="text-xs" style={{ color: 'rgba(107,95,84,0.5)' }}>
            ※ 本アプリは医療行為の代替ではありません
          </p>
        </div>
      </div>
    </div>
  );
}
