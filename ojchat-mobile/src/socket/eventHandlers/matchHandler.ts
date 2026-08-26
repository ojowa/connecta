import { Match } from '../../types/match';
import { useAppStore } from '../../store';

export class MatchHandler {
  onNewMatch = (match: Match): void => {
    useAppStore.getState().addNewMatch(match);
  };

  onLikeReceived = (data: { fromUserId: string }): void => {
    // Handled by UI
  };
}
