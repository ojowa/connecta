export class VectorClock {
  private clock: Map<string, number>;

  constructor(serialized?: string) {
    this.clock = new Map();
    if (serialized) {
      try {
        const entries: [string, number][] = JSON.parse(serialized);
        for (const [key, value] of entries) {
          this.clock.set(key, value);
        }
      } catch {
        this.clock = new Map();
      }
    }
  }

  increment(deviceId: string): void {
    this.clock.set(deviceId, (this.clock.get(deviceId) || 0) + 1);
  }

  merge(other: VectorClock): void {
    for (const [key, value] of other.clock) {
      const current = this.clock.get(key) || 0;
      if (value > current) this.clock.set(key, value);
    }
  }

  compare(other: VectorClock): 'before' | 'after' | 'concurrent' {
    let thisGreater = false;
    let otherGreater = false;

    const allKeys = new Set([...this.clock.keys(), ...other.clock.keys()]);
    for (const key of allKeys) {
      const thisVal = this.clock.get(key) || 0;
      const otherVal = other.clock.get(key) || 0;
      if (thisVal > otherVal) thisGreater = true;
      if (otherVal > thisVal) otherGreater = true;
    }

    if (thisGreater && !otherGreater) return 'after';
    if (otherGreater && !thisGreater) return 'before';
    return 'concurrent';
  }

  serialize(): string {
    return JSON.stringify(Array.from(this.clock.entries()));
  }

  getDeviceClock(deviceId: string): number {
    return this.clock.get(deviceId) || 0;
  }

  setDeviceClock(deviceId: string, value: number): void {
    this.clock.set(deviceId, value);
  }
}
