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
    const merged: SyncRecord = { ...remote };

    for (const [key, value] of Object.entries(local)) {
      if (key === 'vectorClock' || key === 'updatedAt') continue;
      if (value === null || value === undefined) continue;

      const remoteValue = remote[key];
      if (remoteValue === null || remoteValue === undefined) {
        merged[key] = value;
        continue;
      }

      if (Array.isArray(value) && Array.isArray(remoteValue)) {
        merged[key] = this.mergeArrays(value, remoteValue);
        continue;
      }

      if (typeof value === 'object' && typeof remoteValue === 'object' && !Array.isArray(value)) {
        merged[key] = this.mergeObjects(value, remoteValue);
        continue;
      }

      if (local.updatedAt > remote.updatedAt) {
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

  private mergeArrays(local: any[], remote: any[]): any[] {
    const map = new Map<string, any>();
    for (const item of remote) {
      const id = item.id || JSON.stringify(item);
      map.set(id, item);
    }
    for (const item of local) {
      const id = item.id || JSON.stringify(item);
      if (!map.has(id)) {
        map.set(id, item);
      }
    }
    return Array.from(map.values());
  }

  private mergeObjects(local: Record<string, any>, remote: Record<string, any>): Record<string, any> {
    const merged: Record<string, any> = { ...remote };
    for (const [key, value] of Object.entries(local)) {
      if (value === null || value === undefined) continue;
      if (remote[key] === null || remote[key] === undefined) {
        merged[key] = value;
      }
    }
    return merged;
  }
}
