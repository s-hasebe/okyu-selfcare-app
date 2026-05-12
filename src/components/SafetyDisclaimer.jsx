import { useEffect } from 'react';

export default function SafetyDisclaimer({ onAgree }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
    >
      <div
        className="w-full max-w-md animate-slide-up max-h-[88dvh] flex flex-col rounded-2xl p-6"
        style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border-default)',
          boxShadow: 'var(--shadow-xl), var(--glow-inner)',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: 'rgba(232,84,10,0.15)', border: '1px solid var(--color-border-brand)' }}
          >
            ⚠️
          </div>
          <div>
            <h2
              className="text-base"
              style={{ fontFamily: 'var(--font-display-ja)', color: 'var(--color-text-primary)', letterSpacing: '0.08em' }}
            >
              ご利用前にお読みください
            </h2>
            <p
              className="text-xs mt-0.5"
              style={{ fontFamily: 'var(--font-label)', color: 'var(--color-text-muted)', letterSpacing: '0.06em' }}
            >
              SAFETY · IMPORTANT NOTICE
            </p>
          </div>
        </div>

        {/* Scrollable content */}
        <div
          className="flex-1 overflow-y-auto space-y-4 text-sm leading-relaxed pr-1"
          style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body-ja)', lineHeight: '1.9' }}
        >
          <div
            className="rounded-xl p-3"
            style={{ background: 'rgba(220,38,38,0.10)', border: '1px solid rgba(220,38,38,0.25)' }}
          >
            <p className="font-bold mb-1" style={{ color: '#fca5a5', fontFamily: 'var(--font-display-ja)', letterSpacing: '0.08em' }}>
              医療行為ではありません
            </p>
            <p>本アプリはツボの位置確認を補助するものであり、医療診断・治療を目的とするものではありません。</p>
          </div>

          <div className="space-y-1">
            <p className="font-bold" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display-ja)', letterSpacing: '0.08em' }}>
              妊娠中の方へ
            </p>
            <p>合谷・三陰交・気海・関元・肩井は<span style={{ color: '#f87171', fontWeight: 'bold' }}>使用禁忌</span>です。必ず医師に相談してください。</p>
          </div>

          <div className="space-y-1">
            <p className="font-bold" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display-ja)', letterSpacing: '0.08em' }}>
              禁忌事項
            </p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>皮膚に炎症・傷・湿疹がある部位への使用</li>
              <li>体調が優れない場合の使用</li>
              <li>飲酒後・食後すぐの使用</li>
            </ul>
          </div>

          <div className="space-y-1">
            <p className="font-bold" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display-ja)', letterSpacing: '0.08em' }}>
              お灸中の注意
            </p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>目を離さず、熱さを感じたらすぐに取り外す</li>
              <li>使用後のお灸は必ず水で消火してから廃棄する</li>
            </ul>
          </div>

          <div className="space-y-1">
            <p className="font-bold" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display-ja)', letterSpacing: '0.08em' }}>
              プライバシー
            </p>
            <p>カメラ映像はお使いの端末内のみで処理されます。外部サーバーへの送信は一切行いません。</p>
          </div>
        </div>

        {/* CTA */}
        <button onClick={onAgree} className="btn-primary w-full mt-5 flex-shrink-0">
          内容を確認して同意する
        </button>
      </div>
    </div>
  );
}
