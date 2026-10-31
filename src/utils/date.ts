/** 秒级时间戳判定阈值：小于 1e11 视为秒（10 位），否则视为毫秒（13 位）；毫秒值小于 1e11 对应 1973 年之前，业务数据不会出现 */
const SECONDS_THRESHOLD = 1e11;

/** epoch 归一：秒级转毫秒，毫秒原样返回 */
function normalizeEpoch(n: number): number {
  return n > 0 && n < SECONDS_THRESHOLD ? n * 1000 : n;
}

/** 后端时间值归一为时间戳（epoch 毫秒 / epoch 秒 / 数字字符串 / ISO / 'yyyy-MM-dd HH:mm:ss' / 'yyyy-MM-dd'） */
export function toTimeValue(v: string | number | undefined | null): number {
  if (v === undefined || v === null || v === '') return 0;
  if (typeof v === 'number') return normalizeEpoch(v);
  const trimmed = String(v).trim();
  if (trimmed !== '') {
    const n = Number(trimmed);
    if (!Number.isNaN(n)) return normalizeEpoch(n);
  }
  const t = new Date(trimmed.replace(' ', 'T')).getTime();
  return Number.isNaN(t) ? 0 : t;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** 格式化为 YYYY-MM-DD HH:mm:ss */
export function formatDateTime(v: string | number | undefined | null): string {
  const t = toTimeValue(v);
  if (!t) return '';
  const d = new Date(t);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** 格式化为 YYYY-MM-DD */
export function formatDate(v: string | number | undefined | null): string {
  const t = toTimeValue(v);
  if (!t) return '';
  const d = new Date(t);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
