import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tsuboData from '../data/tsubo.json';
import { PageHeader } from '../components/Common';
import { saveCalibration } from '../utils/storage';

// MediaPipe のランドマークインデックス
// 人差し指MCP=5, 小指MCP=17（4本指の根元）
const MCP_INDEX  = 5;
const MCP_PINKY  = 17;
const REQUIRED_STABLE_FRAMES = 60; // 60フレーム≒2秒安定

export default function Calibration() {
  const { tsuboId } = useParams();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const handsRef = useRef(null);
  const animRef = useRef(null);
  const stableCountRef = useRef(0);
  const lastPxRef = useRef(null);

  const [status, setStatus] = useState('loading'); // loading | ready | measuring | done | error
  const [message, setMessage] = useState('MediaPipeを読み込み中...');
  const [pixelsPerSun, setPixelsPerSun] = useState(null);

  // ========= MediaPipe 初期化 =========
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // MediaPipe Tasks Vision
        const { HandLandmarker, FilesetResolver } = await import(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0'
        );

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
        );

        handsRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
        });

        if (cancelled) return;

        // カメラ起動
        if (!navigator.mediaDevices?.getUserMedia) {
          throw Object.assign(new Error(), { name: 'NotSupportedError' });
        }

        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        }

        streamRef.current = stream;
        const video = videoRef.current;
        video.srcObject = stream;
        await new Promise((resolve) => { video.onloadedmetadata = resolve; });
        try { await video.play(); } catch { /* autoPlay 属性でカバー */ }

        if (cancelled) return;
        setStatus('ready');
        setMessage('手のひらをカメラに向け、枠内に収めてください');
        startDetection();
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setStatus('error');
          const msg =
            err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
              ? 'カメラへのアクセスが拒否されました。ブラウザの設定でカメラを許可してください。'
              : err.name === 'NotFoundError'
              ? 'カメラが見つかりません。'
              : location.protocol !== 'https:'
              ? 'カメラを使用するにはHTTPS接続が必要です。'
              : 'カメラまたはMediaPipeの初期化に失敗しました。';
          setMessage(msg);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      stopAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopAll = () => {
    cancelAnimationFrame(animRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  // ========= 推論ループ =========
  const startDetection = useCallback(() => {
    const detect = () => {
      if (!handsRef.current || !videoRef.current || videoRef.current.readyState < 2) {
        animRef.current = requestAnimationFrame(detect);
        return;
      }

      const result = handsRef.current.detectForVideo(videoRef.current, performance.now());
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Canvasサイズをvideoに合わせる
      canvas.width  = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (result.landmarks && result.landmarks.length > 0) {
        const lm = result.landmarks[0];
        const mcp1 = lm[MCP_INDEX];
        const mcp5 = lm[MCP_PINKY];

        // px座標に変換
        const x1 = mcp1.x * canvas.width;
        const y1 = mcp1.y * canvas.height;
        const x5 = mcp5.x * canvas.width;
        const y5 = mcp5.y * canvas.height;

        const dist = Math.hypot(x5 - x1, y5 - y1);
        // 4本指幅 = 3寸
        const pxPerSun = dist / 3;

        // 安定判定（前フレームとの差が5%以内）
        if (lastPxRef.current && Math.abs(pxPerSun - lastPxRef.current) / lastPxRef.current < 0.05) {
          stableCountRef.current += 1;
        } else {
          stableCountRef.current = 0;
        }
        lastPxRef.current = pxPerSun;

        // プログレス描画
        drawGuide(ctx, x1, y1, x5, y5, stableCountRef.current);

        if (stableCountRef.current >= REQUIRED_STABLE_FRAMES) {
          // 計測確定
          setPixelsPerSun(pxPerSun);
          setStatus('done');
          setMessage(`計測完了！1寸 ≈ ${Math.round(pxPerSun)}px`);
          return; // ループ停止
        }

        const progress = Math.min(stableCountRef.current / REQUIRED_STABLE_FRAMES, 1);
        setMessage(`計測中... ${Math.round(progress * 100)}%`);
      } else {
        stableCountRef.current = 0;
        lastPxRef.current = null;
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(canvas.width * 0.1, canvas.height * 0.2, canvas.width * 0.8, canvas.height * 0.6);
        setMessage('手のひらを枠内に収めてください');
      }

      animRef.current = requestAnimationFrame(detect);
    };

    animRef.current = requestAnimationFrame(detect);
  }, []);

  function drawGuide(ctx, x1, y1, x5, y5, stableCount) {
    const progress = Math.min(stableCount / REQUIRED_STABLE_FRAMES, 1);

    // 4本指の根元を結ぶ線
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x5, y5);
    ctx.strokeStyle = `rgba(230,126,34,${0.5 + progress * 0.5})`;
    ctx.lineWidth = 4;
    ctx.stroke();

    // 端点の円
    [{ x: x1, y: y1 }, { x: x5, y: y5 }].forEach(({ x, y }) => {
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(192,57,43,${0.7 + progress * 0.3})`;
      ctx.fill();
    });

    // プログレスバー（上部）
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, ctx.canvas.width, 8);
    ctx.fillStyle = progress >= 1 ? '#27ae60' : '#e67e22';
    ctx.fillRect(0, 0, ctx.canvas.width * progress, 8);
  }

  const handleConfirm = () => {
    if (!pixelsPerSun) return;
    saveCalibration(pixelsPerSun);
    stopAll();
    navigate(tsuboId ? `/ar/${tsuboId}` : '/');
  };

  const handleSkip = () => {
    // デフォルト値で進む（40px = 1寸）
    saveCalibration(40);
    stopAll();
    navigate(tsuboId ? `/ar/${tsuboId}` : '/');
  };

  return (
    <div className="page bg-black">
      <PageHeader title="指幅キャリブレーション" />

      {/* カメラ + Canvas レイヤー */}
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline autoPlay muted
          style={{ transform: 'scaleX(-1)' }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* ガイド枠オーバーレイ */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-4/5 h-1/2 border-2 border-dashed border-white/40 rounded-2xl" />
        </div>

        {/* ステータスバナー */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm px-4 py-4">
          <p className="text-white text-center text-sm font-medium mb-1">{message}</p>

          {status === 'loading' && (
            <div className="flex justify-center mt-2">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}

          {status === 'error' && (
            <button onClick={() => navigate(-1)} className="btn-secondary w-full mt-2">
              戻る
            </button>
          )}

          {status === 'done' && (
            <button onClick={handleConfirm} className="btn-primary w-full mt-2">
              確定してARガイドへ →
            </button>
          )}

          {(status === 'ready' || status === 'measuring') && (
            <button onClick={handleSkip} className="btn-ghost w-full text-xs mt-1 text-white/50">
              スキップ（デフォルト値で続ける）
            </button>
          )}
        </div>

        {/* 説明オーバーレイ（ready時） */}
        {status === 'ready' && (
          <div className="absolute top-16 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-2xl p-4">
            <p className="text-white text-sm font-bold mb-2">📏 計測方法</p>
            <ol className="text-white/80 text-xs space-y-1 list-decimal list-inside">
              <li>カメラを顔から30〜40cm離す</li>
              <li>手のひらを広げてカメラに向ける</li>
              <li>4本指（人差し指〜小指）が枠内に収まるよう調整</li>
              <li>2秒間静止すると自動確定します</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
