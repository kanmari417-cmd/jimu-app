import type { MemberAvailabilityInput, TimeRange } from '../../types/availability';

const timeInputClass = 'rounded-md border border-gray-300 px-2 py-1 text-sm';

type Props = {
  member: MemberAvailabilityInput;
  onChange: (member: MemberAvailabilityInput) => void;
  onRemove: () => void;
};

export default function MemberInputCard({ member, onChange, onRemove }: Props) {
  function updateName(name: string) {
    onChange({ ...member, name });
  }

  function updateBusy(index: number, patch: Partial<TimeRange>) {
    const busy = member.busy.map((b, i) => (i === index ? { ...b, ...patch } : b));
    onChange({ ...member, busy });
  }

  function addBusy() {
    onChange({ ...member, busy: [...member.busy, { start: '12:00', end: '13:00' }] });
  }

  function removeBusy(index: number) {
    onChange({ ...member, busy: member.busy.filter((_, i) => i !== index) });
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="mb-2 flex items-center gap-2">
        <input
          value={member.name}
          onChange={(e) => updateName(e.target.value)}
          placeholder="メンバー名"
          className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
        <button type="button" onClick={onRemove} className="shrink-0 text-xs text-red-600 hover:underline">
          メンバー削除
        </button>
      </div>

      <div className="space-y-1.5">
        {member.busy.length === 0 && <p className="text-xs text-gray-400">予定なし(終日空き扱い)</p>}
        {member.busy.map((b, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="time"
              value={b.start}
              onChange={(e) => updateBusy(i, { start: e.target.value })}
              className={timeInputClass}
            />
            <span className="text-xs text-gray-400">〜</span>
            <input
              type="time"
              value={b.end}
              onChange={(e) => updateBusy(i, { end: e.target.value })}
              className={timeInputClass}
            />
            <button
              type="button"
              onClick={() => removeBusy(i)}
              aria-label="この予定を削除"
              className="text-xs text-gray-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button type="button" onClick={addBusy} className="mt-2 text-xs font-medium text-blue-600 hover:underline">
        + 予定を追加
      </button>
    </div>
  );
}
