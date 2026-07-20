import { VectorClock } from '../VectorClock';

export type ResolutionStrategy = 'server-authoritative' | 'last-write-wins' | 'vector-clock' | 'merge';

export interface SyncRecord {
  id: string;
  updatedAt: number;
  vectorClock?: string;
  [key: string]: any;
}

export const STRATEGY_MATRIX: Record<string, ResolutionStrategy> = {
  message: 'server-authoritative',
  like: 'server-authoritative',
  pass: 'server-authoritative',
  match: 'server-authoritative',
  photo: 'server-authoritative',
  block: 'server-authoritative',
  report: 'server-authoritative',
  reaction: 'server-authoritative',
  profile: 'vector-clock',
  preference: 'last-write-wins',
  feed: 'merge',
};

export class ConflictResolver {
  resolve(
    local: SyncRecord,
    remote: SyncRecord,
    strategy: ResolutionStrategy,
  ): SyncRecord {
    switch (strategy) {
      case 'server-authoritative':
        return remote;

      case 'last-write-wins':
        return local.updatedAt > remote.updatedAt ? local : remote;

      case 'vector-clock':
        if (!local.vectorClock || !remote.vectorClock) {
          return local.updatedAt > remote.updatedAt ? local : remote;
        }
        const localClock = new VectorClock(local.vectorClock);
        const remoteClock = new VectorClock(remote.vectorClock);
        const comparison = localClock.compare(remoteClock);

        if (comparison === 'after') return local;
        if (comparison === 'before') return remote;
        return this.mergeConcurrent(local, remote);

      case 'merge':
        return this.mergeConcurrent(local, remote);

      default:
        return remote;
    }
  }

  getStrategyForEntity(entityType: string): ResolutionStrategy {
    return STRATEGY_MATRIX[entityType] || 'server-authoritative';
  }

  private mergeConcurrent(local: SyncRecord, remote: SyncRecord): SyncRecord {
    const merged = { ...remote };
    for (const [key, value] of Object.entries(local)) {
      if (value !== null && value !== undefined && key !== 'vectorClock') {
        merged[key] = value;
      }
    }
    merged.updatedAt = Math.max(local.updatedAt, remote.updatedAt);

    if (local.vectorClock && remote.vectorClock) {
      const localClock = new VectorClock(local.vectorClock);
      const remoteClock = new VectorClock(remote.vectorClock);
      localClock.merge(remoteClock);
      merged.vectorClock = localClock.serialize();
    }

    return merged;
  }
}
