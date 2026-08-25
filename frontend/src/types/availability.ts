export interface TimeRange {
  start: string; // HH:mm
  end: string; // HH:mm
}

export interface MemberAvailabilityInput {
  name: string;
  busy: TimeRange[];
}

export interface ComputeAvailabilityInput {
  range_start: string;
  range_end: string;
  members: MemberAvailabilityInput[];
}

export interface FreeSlot extends TimeRange {
  duration_minutes: number;
}

export interface ComputeAvailabilityResult {
  free_slots: FreeSlot[];
  busy_union: TimeRange[];
}
