import { Router } from 'express';
import { computeAvailability } from '../services/availability.js';
import type { ComputeAvailabilityInput, MemberAvailabilityInput, TimeRange } from '../types/availability.js';

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function parseTimeRange(value: unknown, label: string): { data?: TimeRange; error?: string } {
  if (typeof value !== 'object' || value === null) {
    return { error: `${label}が不正です` };
  }
  const v = value as Record<string, unknown>;
  if (typeof v.start !== 'string' || !TIME_RE.test(v.start)) {
    return { error: `${label}の開始時刻はHH:mm形式で指定してください` };
  }
  if (typeof v.end !== 'string' || !TIME_RE.test(v.end)) {
    return { error: `${label}の終了時刻はHH:mm形式で指定してください` };
  }
  if (toMinutes(v.start) >= toMinutes(v.end)) {
    return { error: `${label}は開始時刻より終了時刻を後にしてください` };
  }
  return { data: { start: v.start, end: v.end } };
}

function parseComputeInput(body: unknown): { data?: ComputeAvailabilityInput; error?: string } {
  if (typeof body !== 'object' || body === null) {
    return { error: 'リクエストボディが不正です' };
  }
  const b = body as Record<string, unknown>;

  if (typeof b.range_start !== 'string' || !TIME_RE.test(b.range_start)) {
    return { error: '検索範囲の開始時刻(range_start)はHH:mm形式で指定してください' };
  }
  if (typeof b.range_end !== 'string' || !TIME_RE.test(b.range_end)) {
    return { error: '検索範囲の終了時刻(range_end)はHH:mm形式で指定してください' };
  }
  if (toMinutes(b.range_start) >= toMinutes(b.range_end)) {
    return { error: '検索範囲は開始時刻より終了時刻を後にしてください' };
  }
  if (!Array.isArray(b.members)) {
    return { error: 'members は配列で指定してください' };
  }

  const members: MemberAvailabilityInput[] = [];
  for (const [idx, raw] of b.members.entries()) {
    if (typeof raw !== 'object' || raw === null) {
      return { error: `メンバー[${idx}]の指定が不正です` };
    }
    const m = raw as Record<string, unknown>;
    if (typeof m.name !== 'string' || !m.name.trim()) {
      return { error: `メンバー[${idx}]の名前(name)は必須です` };
    }
    if (!Array.isArray(m.busy)) {
      return { error: `メンバー[${idx}]のbusyは配列で指定してください` };
    }
    const busy: TimeRange[] = [];
    for (const [slotIdx, slotRaw] of m.busy.entries()) {
      const { data, error } = parseTimeRange(slotRaw, `メンバー「${m.name}」の予定[${slotIdx}]`);
      if (error || !data) return { error };
      busy.push(data);
    }
    members.push({ name: m.name.trim(), busy });
  }

  return { data: { range_start: b.range_start, range_end: b.range_end, members } };
}

export const availabilityRouter = Router();

availabilityRouter.post('/compute', (req, res) => {
  const { data, error } = parseComputeInput(req.body);
  if (error || !data) {
    res.status(400).json({ error });
    return;
  }
  res.json(computeAvailability(data));
});
