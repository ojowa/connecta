const LOCAL_API = process.env.EXPO_PUBLIC_LOCAL_API_URL || 'http://192.168.0.116:3000/v1';
const LOCAL_WS = process.env.EXPO_PUBLIC_LOCAL_WS_URL || 'http://192.168.0.116:3000';
const PUBLIC_API = process.env.EXPO_PUBLIC_API_URL || '';
const PUBLIC_WS = process.env.EXPO_PUBLIC_WS_URL || '';

let cachedApiUrl: string | null = null;
let cachedWsUrl: string | null = null;

async function isLocalReachable(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${LOCAL_API.replace('/v1', '')}/v1/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

export async function resolveApiUrl(): Promise<string> {
  if (cachedApiUrl) return cachedApiUrl;

  if (LOCAL_API && (await isLocalReachable())) {
    cachedApiUrl = LOCAL_API;
  } else if (PUBLIC_API) {
    cachedApiUrl = PUBLIC_API;
  } else {
    cachedApiUrl = LOCAL_API;
  }
  return cachedApiUrl!;
}

export async function resolveWsUrl(): Promise<string> {
  if (cachedWsUrl) return cachedWsUrl;

  if (LOCAL_WS && (await isLocalReachable())) {
    cachedWsUrl = LOCAL_WS;
  } else if (PUBLIC_WS) {
    cachedWsUrl = PUBLIC_WS;
  } else {
    cachedWsUrl = LOCAL_WS;
  }
  return cachedWsUrl!;
}

export function resetUrlCache() {
  cachedApiUrl = null;
  cachedWsUrl = null;
}
