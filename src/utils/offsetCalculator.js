/**
 * 寸 → px 変換ユーティリティ
 * @param {number} sun      - 寸数
 * @param {number} pixelsPerSun - 1寸あたりのピクセル数（キャリブレーション値）
 * @returns {number} ピクセル数
 */
export function sunToPx(sun, pixelsPerSun) {
  return sun * pixelsPerSun;
}

/**
 * ツボのCanvas座標を計算する
 * @param {Object} tapPoint      - 基準点タップ座標 { x, y }
 * @param {Object} offsetSun     - ツボデータの offsetSun { vertical, horizontal, direction }
 * @param {number} pixelsPerSun  - 1寸あたりのピクセル数
 * @param {string} cameraFacing  - 'front' | 'back' (前カメラは左右反転)
 * @returns {{ x: number, y: number }} ツボのCanvas座標
 */
export function calcTsuboPosition(tapPoint, offsetSun, pixelsPerSun, cameraFacing = 'back') {
  const { vertical, horizontal, direction } = offsetSun;

  const vertPx = sunToPx(vertical, pixelsPerSun);
  const horizPx = sunToPx(horizontal, pixelsPerSun);

  let deltaX = 0;
  let deltaY = 0;

  // direction に基づき delta を決定
  switch (direction) {
    case 'distal':
      // 末梢方向（基本的に下方 = y増加）
      deltaY = vertPx;
      break;
    case 'proximal':
      // 中枢方向（上方 = y減少）
      deltaY = -vertPx;
      break;
    case 'lateral':
      // 外側方向。前カメラは左右反転を考慮
      deltaX = cameraFacing === 'front' ? -horizPx : horizPx;
      break;
    case 'none':
    default:
      // 基準点そのもの（オフセットなし）
      deltaX = 0;
      deltaY = 0;
      break;
  }

  // horizontal が指定されている場合は追加オフセット
  if (direction !== 'lateral' && horizontal !== 0) {
    deltaX += cameraFacing === 'front' ? -horizPx : horizPx;
  }

  return {
    x: tapPoint.x + deltaX,
    y: tapPoint.y + deltaY,
  };
}
