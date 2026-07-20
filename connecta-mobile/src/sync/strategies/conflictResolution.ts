export const conflictResolver = {
  resolve<T extends { updated_at: string }>(local: T, server: T): T {
    return local.updated_at > server.updated_at ? local : server;
  },

  mergeProfiles(local: any, server: any): any {
    const result = { ...server };
    for (const key of Object.keys(local)) {
      if (local[key] && (!server[key] || local[key] > server[key])) {
        result[key] = local[key];
      }
    }
    return result;
  },

  mergeReactions(local: any[], server: any[]): any[] {
    const map = new Map<string, any>();
    for (const r of [...server, ...local]) map.set(`${r.userId}:${r.emoji}`, r);
    return Array.from(map.values());
  },
};
