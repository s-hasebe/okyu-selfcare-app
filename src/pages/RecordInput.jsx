import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import tsuboData from '../data/tsubo.json';
import { PageHeader } from '../components/Common';
import { useHistory } from '../hooks/useHistory';
import { formatDuration } from '../utils/storage';

export default function RecordInput() {
  const { tsuboId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { add } = useHistory();

  const tsubo = tsuboData.find((t) => t.id === tsuboId);
  const durationSec = state?.durationSec ?? 0;
  const [memo, setMemo] = useState('');
  const [saved, setSaved] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleSave = () => {
    if (!tsubo) return;
    add({ tsuboId: tsubo.id, tsuboName: tsubo.name, bodyArea: tsubo.bodyArea, durationSec, memo: memo.slice(0, 50) });
    setSaved(true);
    timerRef.current = setTimeout(() => navigate('/'), 1500);
  };

  if (!tsubo) {
    return (
      <div className="page">
        <PageHeader title="記録入力" />
        <div className="page-content flex items-center justify-center">
          <p style={{ color: 'var(--color-text-muted)' }}>ツボが見つかりません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader title="施灸記録" />

      <main className="page-content space-y-5 animate-fade-up">
        {/* 保存完了 */}
        {saved && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
            style={{ background: 'rgba(0,0,0,0.85)' }}
          >
            <div className="text-center">
              <span className="text-7xl block mb-4">✅</span>
              <p
                style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display-ja)', letterSpacing: '0.1em', fontSize: '1.25rem' }}
              >
                記録しました！
              </p>
            </div>
          </div>
        )}

        {/* 実施内容 */}
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-brand)',
            boxShadow: 'var(--glow-sm)',
          }}
        >
          <p className="section-title">実施内容</p>
          <div className="space-y-3">
            <ConfirmRow label="ツボ" value={`${tsubo.name}（${tsubo.reading}）`} />
            <ConfirmRow label="部位" value={tsubo.bodyArea} />
            <ConfirmRow label="実施時間" value={formatDuration(durationSec)} />
            <ConfirmRow label="実施日時"
              value={new Date().toLocaleString('ja-JP', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            />
          </div>
        </div>

        {/* メモ */}
        <div>
          <label
            className="section-title block mb-2"
            htmlFor="memo-input"
          >
            メモ（任意・50文字以内）
          </label>
          <textarea
            id="memo-input"
            value={memo}
            onChange={(e) => setMemo(e.target.value.slice(0, 50))}
            placeholder="感想・体の変化など..."
            className="w-full px-4 py-3 rounded-xl text-sm resize-none focus:outline-none"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-default)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-body-ja)',
              lineHeight: '1.9',
            }}
            rows={3}
          />
          <p
            className="text-right text-xs mt-1"
            style={{ fontFamily: 'var(--font-label)', color: 'var(--color-text-muted)' }}
          >
            {memo.length} / 50
          </p>
        </div>

        <button id="btn-save-record" onClick={handleSave} className="btn-primary w-full">
          💾 記録を保存する
        </button>

        <button onClick={() => navigate('/')} className="btn-ghost w-full text-center">
          保存せずにホームへ戻る
        </button>
      </main>
    </div>
  );
}

function ConfirmRow({ label, value }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-label)', letterSpacing: '0.04em' }}>{label}</span>
      <span style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}>{value}</span>
    </div>
  );
}
