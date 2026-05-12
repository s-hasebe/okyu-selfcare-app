import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tsuboData from '../data/tsubo.json';
import { PageHeader, DifficultyBadge } from '../components/Common';
import PregnancyWarning from '../components/PregnancyWarning';
import { getCalibration } from '../utils/storage';

const AREA_EMOJI = { 手腕: '🤚', 足下腿: '🦵', 腹部胸部: '🫁', 背中肩: '🫙' };

export default function TsuboDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPregnancyWarning, setShowPregnancyWarning] = useState(false);

  const tsubo = tsuboData.find((t) => t.id === id);

  if (!tsubo) {
    return (
      <div className="page">
        <PageHeader title="ツボ詳細" />
        <div className="page-content flex items-center justify-center">
          <p style={{ color: 'var(--color-text-muted)' }}>ツボが見つかりません</p>
        </div>
      </div>
    );
  }

  const handleARStart = () => {
    if (tsubo.isPregnancyForbidden) {
      setShowPregnancyWarning(true);
    } else {
      goToAR();
    }
  };

  const goToAR = () => {
    const calibration = getCalibration();
    navigate(calibration ? `/ar/${tsubo.id}` : `/calibration/${tsubo.id}`);
  };

  return (
    <div className="page">
      <PageHeader title={tsubo.name} />

      {showPregnancyWarning && (
        <PregnancyWarning
          tsuboName={tsubo.name}
          onBack={() => setShowPregnancyWarning(false)}
          onContinue={() => { setShowPregnancyWarning(false); goToAR(); }}
        />
      )}

      <main className="page-content space-y-4 animate-fade-up">
        {/* ── ヘッダーカード ── */}
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--color-bg-elevated) 0%, var(--color-bg-surface) 100%)',
            border: '1px solid var(--color-border-default)',
            boxShadow: 'var(--glow-inner)',
          }}
        >
          {/* Ambient glow */}
          <div
            className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center bottom, rgba(232,84,10,0.08) 0%, transparent 70%)',
            }}
          />
          <div className="flex items-start gap-4 relative">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
              style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border-default)' }}
            >
              {AREA_EMOJI[tsubo.bodyArea]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2
                  className="text-2xl"
                  style={{ fontFamily: 'var(--font-display-ja)', color: 'var(--color-text-primary)', letterSpacing: '0.1em' }}
                >
                  {tsubo.name}
                </h2>
                {tsubo.isPregnancyForbidden && <span className="badge-red">妊婦禁忌</span>}
              </div>
              <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-label)', letterSpacing: '0.04em' }}>
                {tsubo.reading} · {tsubo.bodyArea}
              </p>
              <DifficultyBadge difficulty={tsubo.arDifficulty} />
            </div>
          </div>
        </div>

        {/* ── 症状タグ ── */}
        <div>
          <p className="section-title">関連症状</p>
          <div className="flex flex-wrap gap-2">
            {tsubo.symptoms.map((s) => (
              <span key={s} className="tag text-sm px-3 py-1.5">{s}</span>
            ))}
          </div>
        </div>

        {/* ── 効能 ── */}
        <div className="card">
          <p className="section-title">効能・説明</p>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body-ja)', lineHeight: '1.9', letterSpacing: '0.05em' }}>
            {tsubo.effect}
          </p>
        </div>

        {/* ── 注意事項 ── */}
        {tsubo.caution && tsubo.caution !== '特になし。' && (
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'rgba(249,115,22,0.07)',
              border: '1px solid rgba(249,115,22,0.20)',
            }}
          >
            <p className="section-title" style={{ color: 'var(--color-brand-light)' }}>注意事項</p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body-ja)', lineHeight: '1.9' }}>
              {tsubo.caution}
            </p>
          </div>
        )}

        {/* ── 妊婦禁忌 ── */}
        {tsubo.isPregnancyForbidden && (
          <div className="pregnancy-forbidden">
            <p className="font-bold mb-1" style={{ fontFamily: 'var(--font-display-ja)', letterSpacing: '0.08em' }}>
              🚫 妊婦禁忌
            </p>
            <p>{tsubo.caution}</p>
          </div>
        )}

        {/* ── 他者撮影推奨 ── */}
        {tsubo.requiresAssistant && (
          <div
            className="rounded-xl p-4 text-sm"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-default)',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-body-ja)',
              lineHeight: '1.9',
            }}
          >
            📸 このツボは<strong style={{ color: 'var(--color-text-primary)' }}>他者による撮影を推奨</strong>します。
          </div>
        )}

        {/* ── 基本情報 ── */}
        <div className="card space-y-3">
          <p className="section-title">基本情報</p>
          <InfoRow label="推奨時間" value={`${tsubo.recommendedMinutes}分`} />
          <InfoRow label="推奨カメラ"
            value={tsubo.cameraMode === 'front' ? 'インカメラ' : tsubo.cameraMode === 'back' ? 'アウトカメラ' : 'どちらでも'}
          />
          <InfoRow label="基準点" value={tsubo.landmark} small />
        </div>

        {/* ── CTA ── */}
        <div className="pt-2 pb-2 space-y-3">
          <button
            id={`btn-ar-start-${tsubo.id}`}
            onClick={handleARStart}
            className="btn-primary w-full text-xl py-5"
          >
            <span className="text-2xl">📷</span>
            ARでツボを確認する
          </button>
          <button
            onClick={() => navigate(`/timer/${tsubo.id}`)}
            className="btn-secondary w-full"
          >
            <span>⏱️</span>タイマーだけ使う
          </button>
        </div>
      </main>
    </div>
  );
}

function InfoRow({ label, value, small }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-sm flex-shrink-0" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-label)', letterSpacing: '0.04em' }}>
        {label}
      </span>
      <span
        className={`text-right ${small ? 'text-sm' : 'font-medium'}`}
        style={{ color: 'var(--color-text-primary)', fontFamily: small ? 'var(--font-body-ja)' : 'var(--font-body)' }}
      >
        {value}
      </span>
    </div>
  );
}
