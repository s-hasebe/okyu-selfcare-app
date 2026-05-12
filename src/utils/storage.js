// ========= 共通ユーティリティ =========
export function formatDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}秒`;
  return `${m}分${s > 0 ? s + '秒' : ''}`;
}

// LocalStorage のキー
const KEYS = {
  CALIBRATION: 'okyu_calibration',
  HISTORY: 'okyu_history',
  ONBOARDING: 'okyu_onboarding',
  SAFETY_AGREED: 'okyu_safety_agreed',
};

const MAX_HISTORY = 200;

// ========= キャリブレーション =========
export function getCalibration() {
  try {
    const raw = localStorage.getItem(KEYS.CALIBRATION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCalibration(pixelsPerSun) {
  const data = { pixelsPerSun, measuredAt: Date.now() };
  localStorage.setItem(KEYS.CALIBRATION, JSON.stringify(data));
  return data;
}

export function clearCalibration() {
  localStorage.removeItem(KEYS.CALIBRATION);
}

// ========= 履歴 =========
export function getHistory() {
  try {
    const raw = localStorage.getItem(KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addHistory(entry) {
  const history = getHistory();
  history.unshift(entry); // 新しい順
  // 最大200件
  if (history.length > MAX_HISTORY) history.splice(MAX_HISTORY);
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
}

export function deleteHistory(id) {
  const history = getHistory().filter((h) => h.id !== id);
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
}

export function clearHistory() {
  localStorage.removeItem(KEYS.HISTORY);
}

// ========= オンボーディング =========
export function isOnboardingCompleted() {
  return localStorage.getItem(KEYS.ONBOARDING) === 'true';
}

export function setOnboardingCompleted() {
  localStorage.setItem(KEYS.ONBOARDING, 'true');
}

// ========= 安全同意 =========
export function isSafetyAgreed() {
  return localStorage.getItem(KEYS.SAFETY_AGREED) === 'true';
}

export function setSafetyAgreed() {
  localStorage.setItem(KEYS.SAFETY_AGREED, 'true');
}
