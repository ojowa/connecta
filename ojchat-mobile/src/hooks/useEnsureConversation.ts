import { useCallback, useState, useRef } from 'react';
import { chatApi } from '../services/api/chatApi';
import { logger } from '../utils/logger';

interface UseEnsureConversationResult {
  ensureConversation: (otherUserId: string) => Promise<string>;
  isEnsuring: boolean;
  error: string | null;
  reset: () => void;
}

export function useEnsureConversation(): UseEnsureConversationResult {
  const [isEnsuring, setIsEnsuring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inflight = useRef<Map<string, Promise<string>>>(new Map());

  const ensureConversation = useCallback(async (otherUserId: string): Promise<string> => {
    if (!otherUserId) {
      const err = 'Cannot create conversation: missing user id';
      setError(err);
      throw new Error(err);
    }

    const existing = inflight.current.get(otherUserId);
    if (existing) return existing;

    setIsEnsuring(true);
    setError(null);

    const promise = (async () => {
      try {
        const result = await chatApi.createConversation(otherUserId);
        if (!result?.id) {
          throw new Error('Server did not return a conversation id');
        }
        return result.id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create conversation';
        logger.error('useEnsureConversation failed', { otherUserId, message });
        setError(message);
        throw err;
      } finally {
        inflight.current.delete(otherUserId);
        setIsEnsuring(false);
      }
    })();

    inflight.current.set(otherUserId, promise);
    return promise;
  }, []);

  const reset = useCallback(() => {
    setError(null);
    inflight.current.clear();
  }, []);

  return { ensureConversation, isEnsuring, error, reset };
}
