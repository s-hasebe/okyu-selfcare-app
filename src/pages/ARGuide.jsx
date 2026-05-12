import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tsuboData from '../data/tsubo.json';
import { PageHeader } from '../components/Common';
import { getCalibration } from '../utils/storage';
import { calcTsuboPosition } from '../utils/offsetCalculator';

// アニメーション設定
const PULSE_PERIOD = 1500; // ms

export default function ARGuide() {
  const { tsuboId } = useParams();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animRef = useRef(null);
  const tsuboPositionRef = useRef(null); // 確定したツボ座標

  const [facingMode, setFacingMode] = useState('environment'); // 'user' | 'environment'
  const [step, setStep] = useState('guide'); // 'guide' | 'tap' | 'confirmed'
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const tsubo = tsuboData.find((t) => t.id === tsuboId);
  const calibration = getCalibration();
  const pixelsPerSun = calibration?.pixelsPerSun ?? 40;

  // ========= カメラ起動 =========
  const startCamera = useCallback(async (mode) => {
    // 既存ストリームを停止
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCameraReady(false);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('このブラウザはカメラに対応していません。Chrome / Safari の最新版をお使いください。');
      return;
    }

    let stream;
    try {
      // まず適切な解像度で試みる
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
    } catch {
      try {
        // 解像度制約なしで再試行
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: mode } },
        });
      } catch (err) {
        const msg =
          err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
            ? 'カメラへのアクセスが拒否されました。ブラウザの設定でカメラを許可してください。'
            : err.name === 'NotFoundError'
            ? 'カメラが見つかりません。カメラが接続されているか確認してください。'
            : location.protocol !== 'https:'
            ? 'カメラを使用するにはHTTPS接続が必要です（http:// → https://）。'
            : `カメラを起動できませんでした（${err.name}）`;
        setCameraError(msg);
        return;
      }
    }

    streamRef.current = stream;
    const video = videoRef.current;
    if (!video) { stream.getTracks().forEach((t) => t.stop()); return; }

    video.srcObject = stream;
    // loadedmetadata を待ってから再生（iOS Safari 対策）
    await new Promise((resolve) => { video.onloadedmetadata = resolve; });
    try { await video.play(); } catch { /* autoPlay 属性でカバー */ }

    setCameraReady(true);
    setCameraError(null);
  }, []);

  useEffect(() => {
    const initialMode = tsubo?.cameraMode === 'front' ? 'user' : 'environment';
    setFacingMode(initialMode);
    startCamera(initialMode);

    return () => {
      cancelAnimationFrame(animRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ========= 描画ループ（ツボマーカー点滅） =========
  useEffect(() => {
    if (!cameraReady) return;

    const draw = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      // Canvasをvideoサイズに合わせる（CSS表示とは別）
      canvas.width  = video.videoWidth  || canvas.offsetWidth;
      canvas.height = video.videoHeight || canvas.offsetHeight;

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ツボ位置が確定していれば描画
      if (tsuboPositionRef.current) {
        const { x, y } = tsuboPositionRef.current;
        const t = (Date.now() % PULSE_PERIOD) / PULSE_PERIOD;
        const alpha = 0.5 + 0.5 * Math.sin(t * Math.PI * 2);
        const radius = 20 + 8 * Math.sin(t * Math.PI * 2);

        // 外リング（点滅）
        ctx.beginPath();
        ctx.arc(x, y, radius + 10, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(192,57,43,${alpha * 0.5})`;
        ctx.lineWidth = 3;
        ctx.stroke();

        // 内リング
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(192,57,43,${0.8})`;
        ctx.lineWidth = 4;
        ctx.stroke();

        // 中心点
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#c0392b';
        ctx.fill();

        // ラベル
        ctx.font = 'bold 18px "Noto Sans JP", sans-serif';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 8;
        ctx.fillText(tsubo?.name ?? '', x, y - radius - 16);
        ctx.shadowBlur = 0;
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [cameraReady, tsubo]);

  // ========= タップ処理 =========
  const handleCanvasTap = (e) => {
    if (step !== 'tap') return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // CSSサイズとcanvas解像度の比率
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;

    const tapX = (e.clientX - rect.left) * scaleX;
    const tapY = (e.clientY - rect.top)  * scaleY;

    // 前カメラは映像が左右反転しているため座標を反転
    const adjustedX = facingMode === 'user' ? canvas.width - tapX : tapX;

    const pos = calcTsuboPosition(
      { x: adjustedX, y: tapY },
      tsubo.offsetSun,
      pixelsPerSun,
      facingMode === 'user' ? 'front' : 'back'
    );

    // 前カメラ表示では再度反転
    tsuboPositionRef.current = {
      x: facingMode === 'user' ? canvas.width - pos.x : pos.x,
      y: pos.y,
    };

    setStep('confirmed');
  };

  const handleCameraToggle = async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    tsuboPositionRef.current = null;
    setStep('tap');
    await startCamera(newMode);
  };

  if (!tsubo) {
    return (
      <div className="page">
        <PageHeader title="ARガイド" />
        <div className="page-content flex items-center justify-center">
          <p className="text-okyu-smoke">ツボが見つかりません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page bg-black">
      <PageHeader title={`${tsubo.name} ARガイド`} />

      {/* カメラビュー */}
      <div className="relative flex-1 overflow-hidden" onClick={handleCanvasTap}>
        {/* ビデオ（前カメラは鏡映し） */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline autoPlay muted
          style={facingMode === 'user' ? { transform: 'scaleX(-1)' } : {}}
        />

        {/* ARオーバーレイCanvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={facingMode === 'user' ? { transform: 'scaleX(-1)' } : {}}
        />

        {/* エラー表示 */}
        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6">
            <div className="text-center">
              <p className="text-red-400 font-bold mb-3">📷 {cameraError}</p>
              <button onClick={() => navigate(-1)} className="btn-secondary">戻る</button>
            </div>
          </div>
        )}

        {/* ガイドUI（下部） */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pt-8 pb-4">
          {/* ステップ表示 */}
          {step === 'guide' && (
            <div className="mb-4 bg-black/50 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-white font-bold text-sm mb-1">📌 基準点の見つけ方</p>
              <p className="text-white/80 text-xs leading-relaxed">{tsubo.guideMessage}</p>
              <p className="text-okyu-sand text-xs mt-2">
                基準点: {tsubo.landmark}
              </p>
            </div>
          )}

          {step === 'confirmed' && (
            <div className="mb-4 bg-black/50 backdrop-blur-sm rounded-2xl p-3">
              <p className="text-emerald-400 font-bold text-sm">
                ✅ ツボ「{tsubo.name}」の位置を表示中
              </p>
              <p className="text-white/60 text-xs mt-1">
                赤い丸印がツボの位置です。タップして位置を変更できます。
              </p>
            </div>
          )}

          {/* ボタン群 */}
          <div className="flex gap-2">
            {step === 'guide' && (
              <button
                onClick={(e) => { e.stopPropagation(); setStep('tap'); }}
                className="btn-primary flex-1"
              >
                📍 基準点をタップする
              </button>
            )}

            {step === 'tap' && (
              <p className="flex-1 text-white text-center py-3 text-sm font-medium">
                👆 {tsubo.landmark} をタップしてください
              </p>
            )}

            {step === 'confirmed' && (
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/timer/${tsubo.id}`); }}
                className="btn-primary flex-1"
              >
                ⏱️ お灸を始める
              </button>
            )}

            {/* カメラ切替 */}
            <button
              onClick={(e) => { e.stopPropagation(); handleCameraToggle(); }}
              className="btn-secondary px-4 flex items-center justify-center"
              aria-label="カメラ切替"
            >
              🔄
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
