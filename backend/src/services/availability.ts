import type { ComputeAvailabilityInput, ComputeAvailabilityResult, FreeSlot, TimeRange } from '../types/availability.js';

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function toHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * 全員が空いている時間帯を自動計算する。
 * 「範囲全体」から「誰か1人でも予定が入っている時間帯の和集合」を差し引いた
 * 残りが、全員に共通する空き時間になる。
 */
export function computeAvailability(input: ComputeAvailabilityInput): ComputeAvailabilityResult {
  const rangeStart = toMinutes(input.range_start);
  const rangeEnd = toMinutes(input.range_end);

  const intervals: Array<[number, number]> = [];
  for (const member of input.members) {
    for (const slot of member.busy) {
      const s = Math.max(toMinutes(slot.start), rangeStart);
      const e = Math.min(toMinutes(slot.end), rangeEnd);
      if (e > s) intervals.push([s, e]);
    }
  }
  intervals.sort((a, b) => a[0] - b[0]);

  const merged: Array<[number, number]> = [];
  for (const [s, e] of intervals) {
    const last = merged[merged.length - 1];
    if (last && s <= last[1]) {
      last[1] = Math.max(last[1], e);
    } else {
      merged.push([s, e]);
    }
  }

  const freeSlots: FreeSlot[] = [];
  let cursor = rangeStart;
  for (const [s, e] of merged) {
    if (s > cursor) {
      freeSlots.push({ start: toHHMM(cursor), end: toHHMM(s), duration_minutes: s - cursor });
    }
    cursor = Math.max(cursor, e);
  }
  if (cursor < rangeEnd) {
    freeSlots.push({ start: toHHMM(cursor), end: toHHMM(rangeEnd), duration_minutes: rangeEnd - cursor });
  }

  const busyUnion: TimeRange[] = merged.map(([s, e]) => ({ start: toHHMM(s), end: toHHMM(e) }));

  return { free_slots: freeSlots, busy_union: busyUnion };
}
