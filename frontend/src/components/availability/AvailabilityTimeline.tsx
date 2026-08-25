import type { CSSProperties } from 'react';
import type { MemberAvailabilityInput, TimeRange } from '../../types/availability';
import { timeToMinutes } from '../../utils/time';

type Props = {
  rangeStart: string;
  rangeEnd: string;
  members: MemberAvailabilityInput[];
  freeSlots: TimeRange[];
};

function segmentStyle(rangeStartMin: number, totalMin: number, seg: TimeRange): CSSProperties {
  const s = Math.max(timeToMinutes(seg.start), rangeStartMin);
  const e = Math.min(timeToMinutes(seg.end), rangeStartMin + totalMin);
  const left = ((s - rangeStartMin) / totalMin) * 100;
  const width = Math.max(((e - s) / totalMin) * 100, 0);
  return { left: `${left}%`, width: `${width}%` };
}

export default function AvailabilityTimeline({ rangeStart, rangeEnd, members, freeSlots }: Props) {
  const rangeStartMin = timeToMinutes(rangeStart);
  const rangeEndMin = timeToMinutes(rangeEnd);
  const totalMin = rangeEndMin - rangeStartMin;
  if (totalMin <= 0) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex justify-between text-xs text-gray-400">
        <span>{rangeStart}</span>
        <span>{rangeEnd}</span>
      </div>

      {members.map((m, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-20 shrink-0 truncate text-xs text-gray-600">{m.name || '(名前未入力)'}</span>
          <div className="relative h-6 flex-1 overflow-hidden rounded bg-gray-100">
            {m.busy.map((b, j) => (
              <div
                key={j}
                className="absolute top-0 h-full bg-red-300"
                style={segmentStyle(rangeStartMin, totalMin, b)}
                title={`${b.start} 〜 ${b.end}`}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3 border-t border-gray-200 pt-2.5">
        <span className="w-20 shrink-0 text-xs font-semibold text-gray-700">全員空き</span>
        <div className="relative h-6 flex-1 overflow-hidden rounded bg-gray-100">
          {freeSlots.map((f, i) => (
            <div
              key={i}
              className="absolute top-0 h-full bg-green-400"
              style={segmentStyle(rangeStartMin, totalMin, f)}
              title={`${f.start} 〜 ${f.end}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
