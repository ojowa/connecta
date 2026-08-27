const LOCAL_API = process.env.EXPO_PUBLIC_LOCAL_API_URL || '';
const LOCAL_WS = process.env.EXPO_PUBLIC_LOCAL_WS_URL || '';
const PUBLIC_API = process.env.EXPO_PUBLIC_API_URL || '';
const PUBLIC_WS = process.env.EXPO_PUBLIC_WS_URL || '';

let cachedApiUrl: string | null = null;
let cachedWsUrl: string | null = null;

function isHttps(url: string): boolean {
  return url.startsWith('https://') || url.startsWith('wss://');
}

function isAllowedUrl(url: string): boolean {
  return isHttps(url) || __DEV__;
}

async function isLocalReachable(): Promise<boolean> {
  if (!LOCAL_API || !isAllowedUrl(LOCAL_API)) return false;
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

  if (LOCAL_API && isAllowedUrl(LOCAL_API)) {
    if (__DEV__ || (await isLocalReachable())) {
      cachedApiUrl = LOCAL_API;
    }
  }
  if (!cachedApiUrl && PUBLIC_API && isHttps(PUBLIC_API)) {
    cachedApiUrl = PUBLIC_API;
  }
  if (!cachedApiUrl) {
    throw new Error(
      `No valid API URL configured. Set EXPO_PUBLIC_API_URL or EXPO_PUBLIC_LOCAL_API_URL.` +
      `\nLOCAL_API=${LOCAL_API || '(empty)'}` +
      `\nPUBLIC_API=${PUBLIC_API || '(empty)'}`
    );
  }
  return cachedApiUrl!;
}

export async function resolveWsUrl(): Promise<string> {
  if (cachedWsUrl) return cachedWsUrl;

  if (LOCAL_WS && isAllowedUrl(LOCAL_WS)) {
    if (__DEV__ || (await isLocalReachable())) {
      cachedWsUrl = LOCAL_WS;
    }
  }
  if (!cachedWsUrl && PUBLIC_WS && isHttps(PUBLIC_WS)) {
    cachedWsUrl = PUBLIC_WS;
  }
  if (!cachedWsUrl) {
    throw new Error(
      `No valid WS URL configured. Set EXPO_PUBLIC_WS_URL or EXPO_PUBLIC_LOCAL_WS_URL.` +
      `\nLOCAL_WS=${LOCAL_WS || '(empty)'}` +
      `\nPUBLIC_WS=${PUBLIC_WS || '(empty)'}`
    );
  }
  return cachedWsUrl!;
}

export function resetUrlCache() {
  cachedApiUrl = null;
  cachedWsUrl = null;
}
