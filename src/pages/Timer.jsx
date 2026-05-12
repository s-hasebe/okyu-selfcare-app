import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tsuboData from '../data/tsubo.json';
import { PageHeader } from '../components/Common';

export default function Timer() {
  const { tsuboId } = useParams();
  const navigate = useNavigate();

  const tsubo = tsuboData.find((t) => t.id === tsuboId);
  const totalSeconds = (tsubo?.recommendedMinutes ?? 5) * 60;

  const [remaining, setRemaining] = useState(totalSeconds);
  const [status, setStatus] = useState('idle');
  const intervalRef = useRef(null);
  const startedAtRef = useRef(null);

  const start = () => {
    clearInterval(intervalRef.current);
    if (status === 'idle') startedAtRef.current = Date.now();
    setStatus('running');
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) { clearInterval(intervalRef.current); onComplete(); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const pause = () => { clearInterval(intervalRef.current); setStatus('paused'); };

  const reset = () => { clearInterval(intervalRef.current); setRemaining(totalSeconds); setStatus('idle'); };

  const onComplete = () => {
    setStatus('done');
    if ('vibrate' in navigator) navigator.vibrate([300, 100, 300, 100, 600]);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = 1 - remaining / totalSeconds;
  const radius = 110;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="page">
      <PageHeader title={`${tsubo?.name ?? 'タイマー'} — お灸タイマー`} />

      <main className="page-content flex flex-col items-center">
        {/* ── ツボ名 ── */}
        <div className="text-center mt-6 mb-8 animate-fade-up">
          <p
            className="text-xs mb-1"
            style={{ fontFamily: 'var(--font-label)', color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}
          >
            CURRENT POINT
          </p>
          <p
            className="text-xl"
            style={{ fontFamily: 'var(--font-display-ja)', color: 'var(--color-text-primary)', letterSpacing: '0.12em' }}
          >
            {tsubo?.name ?? '—'}
            {tsubo && (
              <span
                className="text-sm ml-2"
                style={{ fontFamily: 'var(--font-label)', color: 'var(--color-text-muted)', letterSpacing: '0.04em' }}
              >
                {tsubo.reading}
              </span>
            )}
          </p>
        </div>

        {/* ── 円形プログレス ── */}
        <div className="relative w-64 h-64 mb-8 animate-fade-up delay-100">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 240 240">
            {/* トラック */}
            <circle cx="120" cy="120" r={radius}
              fill="none"
              stroke="var(--color-bg-elevated)"
              strokeWidth="10"
            />
            {/* プログレス */}
            <circle cx="120" cy="120" r={radius}
              fill="none"
              stroke={status === 'done' ? '#34d399' : 'url(#orangeGrad)'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              style={{ transition: 'stroke-dashoffset 1s ease, filter 0.3s ease', filter: status !== 'idle' ? 'drop-shadow(0 0 8px rgba(232,84,10,0.6))' : 'none' }}
            />
            <defs>
              <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#e8540a" />
                <stop offset="60%"  stopColor="#f97316" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>
          </svg>

          {/* 時刻 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {status === 'done' ? (
              <>
                <span className="text-5xl mb-1">✅</span>
                <p style={{ color: '#34d399', fontFamily: 'var(--font-display-ja)', letterSpacing: '0.1em' }}>完了！</p>
              </>
            ) : (
              <>
                <span
                  className="text-5xl tabular-nums"
                  style={{ fontFamily: 'var(--font-label)', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}
                >
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
                <p
                  className="text-sm mt-1"
                  style={{ fontFamily: 'var(--font-label)', color: 'var(--color-text-muted)', letterSpacing: '0.06em' }}
                >
                  {status === 'idle' ? 'READY' : status === 'running' ? 'RUNNING' : 'PAUSED'}
                </p>
              </>
            )}
          </div>
        </div>

        {/* ── 完了メッセージ ── */}
        {status === 'done' && (
          <div
            className="rounded-2xl p-5 text-center mb-6 animate-slide-up w-full"
            style={{ background: 'var(--color-bg-surface)', border: '1px solid rgba(52,211,153,0.25)' }}
          >
            <p
              className="font-bold mb-1"
              style={{ color: '#34d399', fontFamily: 'var(--font-display-ja)', letterSpacing: '0.1em' }}
            >
              お灸が完了しました！
            </p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body-ja)', lineHeight: '1.9' }}>
              お灸を安全に取り外し、必ず水で消火してから廃棄してください。
            </p>
          </div>
        )}

        {/* ── コントロール ── */}
        <div className="flex gap-3 mb-6 w-full max-w-xs animate-fade-up delay-200">
          {status !== 'done' && (
            <>
              {status === 'running' ? (
                <button onClick={pause} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                  <span>⏸</span>一時停止
                </button>
              ) : (
                <button onClick={start} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <span>▶</span>{status === 'idle' ? '開始' : '再開'}
                </button>
              )}
              <button onClick={reset} className="btn-secondary px-5 flex items-center justify-center text-lg">
                ↺
              </button>
            </>
          )}

          {status === 'done' && (
            <button
              onClick={() => navigate(`/record/${tsuboId}`, {
                state: { durationSec: totalSeconds - remaining, startedAt: startedAtRef.current }
              })}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              📝 記録する
            </button>
          )}
        </div>

        {status !== 'done' && (
          <button
            onClick={() => navigate(`/record/${tsuboId}`, {
              state: { durationSec: totalSeconds - remaining, startedAt: startedAtRef.current ?? Date.now() }
            })}
            className="btn-ghost text-sm mb-4"
            style={{ color: 'var(--color-text-muted)' }}
          >
            記録だけする（タイマーをスキップ）
          </button>
        )}

        {/* ── 注意事項 ── */}
        <div
          className="w-full rounded-xl p-4 text-xs space-y-1 mt-2 animate-fade-up delay-300"
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-default)',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-body-ja)',
            lineHeight: '1.9',
          }}
        >
          <p>⚠️ お灸中は目を離さないでください</p>
          <p>🔥 熱さを感じたらすぐに取り外してください</p>
          <p>💧 使用後のお灸は水で消火してから廃棄してください</p>
        </div>
      </main>
    </div>
  );
}
