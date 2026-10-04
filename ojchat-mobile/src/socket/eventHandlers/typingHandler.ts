export class TypingHandler {
  onTypingStart = (data: { conversationId: string; userId: string }): void => {
    // Handled by UI via store subscription
  };

  onTypingStop = (data: { conversationId: string; userId: string }): void => {
    // Handled by UI via store subscription
  };
}
