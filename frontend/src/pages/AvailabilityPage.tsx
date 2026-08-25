import { useState } from 'react';
import { apiPost } from '../api/client';
import AvailabilityTimeline from '../components/availability/AvailabilityTimeline';
import MemberInputCard from '../components/availability/MemberInputCard';
import type { ComputeAvailabilityInput, ComputeAvailabilityResult, MemberAvailabilityInput } from '../types/availability';

function defaultMembers(): MemberAvailabilityInput[] {
  return [
    { name: '山田', busy: [{ start: '10:00', end: '11:00' }] },
    { name: '鈴木', busy: [{ start: '13:00', end: '14:30' }] },
  ];
}

export default function AvailabilityPage() {
  const [rangeStart, setRangeStart] = useState('09:00');
  const [rangeEnd, setRangeEnd] = useState('18:00');
  const [members, setMembers] = useState<MemberAvailabilityInput[]>(defaultMembers());
  const [result, setResult] = useState<ComputeAvailabilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateMember(index: number, updated: MemberAvailabilityInput) {
    setMembers((prev) => prev.map((m, i) => (i === index ? updated : m)));
    setResult(null);
  }

  function addMember() {
    setMembers((prev) => [...prev, { name: '', busy: [] }]);
    setResult(null);
  }

  function removeMember(index: number) {
    setMembers((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  }

  async function handleCompute() {
    setError(null);
    setLoading(true);
    try {
      const input: ComputeAvailabilityInput = { range_start: rangeStart, range_end: rangeEnd, members };
      const data = await apiPost<ComputeAvailabilityResult>('/availability/compute', input);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '計算に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">④ 空き時間提案</h2>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-4 flex flex-wrap items-end gap-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">検索範囲(開始)</span>
            <input
              type="time"
              value={rangeStart}
              onChange={(e) => {
                setRangeStart(e.target.value);
                setResult(null);
              }}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">検索範囲(終了)</span>
            <input
              type="time"
              value={rangeEnd}
              onChange={(e) => {
                setRangeEnd(e.target.value);
                setResult(null);
              }}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={addMember}
            className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            + メンバーを追加
          </button>
        </div>

        {members.length === 0 ? (
          <p className="rounded-md border border-dashed border-gray-300 py-6 text-center text-sm text-gray-400">
            メンバーを追加してください
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {members.map((m, i) => (
              <MemberInputCard
                key={i}
                member={m}
                onChange={(updated) => updateMember(i, updated)}
                onRemove={() => removeMember(i)}
              />
            ))}
          </div>
        )}

        {error && <p className="mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button
          type="button"
          onClick={handleCompute}
          disabled={loading}
          className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '計算中…' : '空き時間を計算'}
        </button>
      </div>

      {result && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">タイムライン</h3>
          <AvailabilityTimeline
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            members={members}
            freeSlots={result.free_slots}
          />

          <h3 className="mb-2 mt-5 text-sm font-semibold text-gray-700">全員が空いている時間帯</h3>
          {result.free_slots.length === 0 ? (
            <p className="text-sm text-gray-500">共通の空き時間は見つかりませんでした。</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {result.free_slots.map((slot, i) => (
                <span
                  key={i}
                  className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700"
                >
                  {slot.start} 〜 {slot.end}({slot.duration_minutes}分)
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
