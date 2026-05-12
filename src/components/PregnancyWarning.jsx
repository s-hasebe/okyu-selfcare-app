export default function PregnancyWarning({ tsuboName, onContinue, onBack }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
    >
      <div
        className="w-full max-w-sm animate-slide-up rounded-2xl p-6"
        style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid rgba(220,38,38,0.35)',
          boxShadow: '0 0 40px rgba(220,38,38,0.15), var(--shadow-xl)',
        }}
      >
        {/* Icon */}
        <div className="text-center mb-5">
          <div
            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-4xl mb-4"
            style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.25)' }}
          >
            🚫
          </div>
          <h2
            className="text-xl mb-1"
            style={{ fontFamily: 'var(--font-display-ja)', color: '#f87171', letterSpacing: '0.08em' }}
          >
            妊婦禁忌ツボ
          </h2>
          <p
            className="text-lg"
            style={{ fontFamily: 'var(--font-display-ja)', color: 'var(--color-text-primary)', letterSpacing: '0.1em' }}
          >
            「{tsuboName}」
          </p>
        </div>

        {/* Warning */}
        <div
          className="rounded-xl p-4 mb-5 text-sm leading-relaxed"
          style={{
            background: 'rgba(220,38,38,0.10)',
            border: '1px solid rgba(220,38,38,0.20)',
            color: '#fca5a5',
            fontFamily: 'var(--font-body-ja)',
            lineHeight: '1.9',
          }}
        >
          <p>このツボは<strong>妊娠中の使用が禁忌</strong>とされています。子宮収縮を促す可能性があり、流産・早産のリスクがあります。</p>
          <p className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            妊娠中でない方は引き続き利用できます。不安な方は医師にご相談ください。
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button onClick={onBack} className="btn-secondary w-full">
            戻る
          </button>
          <button
            onClick={onContinue}
            className="btn-ghost w-full text-center text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            妊娠中ではないため続ける
          </button>
        </div>
      </div>
    </div>
  );
}
